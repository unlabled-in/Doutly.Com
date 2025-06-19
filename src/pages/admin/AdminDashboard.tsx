import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  UserCheck,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  Filter,
  Search,
  Eye,
  ArrowRight,
  UserPlus,
  Mail,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';
import { LeadService, ApplicationService, EventRegistrationService, UserService } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import BackButton from '../../components/BackButton';
import ConfirmDialog from '../../components/ConfirmDialog';

interface Lead {
  id: string;
  ticketNumber: string;
  type: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  urgencyLevel: string;
  createdAt: any;
  assignedTo?: string;
  assignedBy?: string;
}

interface Application {
  id: string;
  type: 'tutor_application' | 'partnership_application' | 'event_partnership';
  name?: string;
  organizationName?: string;
  contactName?: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  bio?: string;
  partnershipType?: string;
  eventType?: string;
  targetAudience?: string;
  estimatedAttendees?: string;
  budget?: string;
  message?: string;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: any;
  isActive: boolean;
  phone?: string;
  institution?: string;
  skills?: string[];
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'student',
    phone: '',
    institution: '',
    skills: [] as string[]
  });

  useEffect(() => {
    let unsubscribeLeads: (() => void) | undefined;
    let unsubscribeApplications: (() => void) | undefined;
    let unsubscribeRegistrations: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    try {
      // Subscribe to all leads
      unsubscribeLeads = LeadService.subscribe([], (leadsData) => {
        setLeads(leadsData || []);
        setLoading(false);
      });

      // Subscribe to all applications
      unsubscribeApplications = ApplicationService.subscribe([], (applicationsData) => {
        setApplications(applicationsData || []);
      });

      // Subscribe to event registrations
      unsubscribeRegistrations = EventRegistrationService.subscribe([], (registrationsData) => {
        setEventRegistrations(registrationsData || []);
      });

      // Subscribe to all users (excluding students for admin management)
      unsubscribeUsers = UserService.subscribe([], (usersData) => {
        // Filter to show only admin-manageable roles
        const adminUsers = (usersData || []).filter(user => 
          ['admin', 'vertical_head', 'manager', 'team_leader', 'tutor', 'freelancer', 'bda', 'sales'].includes(user.role)
        );
        setUsers(adminUsers);
      });
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      setLoading(false);
    }

    return () => {
      unsubscribeLeads?.();
      unsubscribeApplications?.();
      unsubscribeRegistrations?.();
      unsubscribeUsers?.();
    };
  }, []);

  const handleAssignLead = async (leadId: string, assignTo: string) => {
    try {
      await LeadService.update(leadId, {
        assignedTo: assignTo,
        assignedBy: userProfile?.displayName,
        status: 'assigned',
        updatedAt: new Date()
      }, userProfile?.uid);
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const handleApproveApplication = async (applicationId: string, type: string) => {
    try {
      await ApplicationService.update(applicationId, {
        status: 'approved',
        reviewedBy: userProfile?.displayName,
        updatedAt: new Date()
      }, userProfile?.uid);

      // If it's a tutor application, create user account
      if (type === 'tutor_application') {
        const application = applications.find(app => app.id === applicationId);
        if (application && application.email) {
          try {
            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, application.email, tempPassword);
            
            // Create user profile
            const userProfile = {
              uid: userCredential.user.uid,
              email: application.email,
              displayName: application.name || 'New Tutor',
              role: 'tutor',
              phone: '',
              institution: '',
              skills: application.skills || [],
              experience: application.experience || '',
              hourlyRate: application.hourlyRate ? parseInt(application.hourlyRate) : 0,
              bio: application.bio || '',
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
              profileComplete: true
            };

            await UserService.create(userProfile, userCredential.user.uid);
            
            // TODO: Send email with login credentials
            alert(`Tutor approved! Temporary password: ${tempPassword}`);
          } catch (error) {
            console.error('Error creating tutor account:', error);
            alert('Application approved but failed to create account. Please create manually.');
          }
        }
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await ApplicationService.update(applicationId, {
        status: 'rejected',
        reviewedBy: userProfile?.displayName,
        updatedAt: new Date()
      }, userProfile?.uid);
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUserData.email, newUserData.password);
      
      // Create user profile in Firestore
      const userProfileData = {
        uid: userCredential.user.uid,
        email: newUserData.email,
        displayName: newUserData.displayName,
        role: newUserData.role,
        phone: newUserData.phone,
        institution: newUserData.institution,
        skills: newUserData.skills,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        profileComplete: true
      };

      await UserService.create(userProfileData, userCredential.user.uid);
      
      setShowUserForm(false);
      setNewUserData({ 
        email: '', 
        password: '', 
        displayName: '', 
        role: 'student',
        phone: '',
        institution: '',
        skills: []
      });
      alert('User created successfully!');
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + error.message);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUserData({
      email: user.email,
      password: '',
      displayName: user.displayName,
      role: user.role,
      phone: user.phone || '',
      institution: user.institution || '',
      skills: user.skills || []
    });
    setShowUserForm(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData = {
        displayName: newUserData.displayName,
        role: newUserData.role,
        phone: newUserData.phone,
        institution: newUserData.institution,
        skills: newUserData.skills,
        updatedAt: new Date()
      };

      await UserService.update(editingUser.uid, updateData, userProfile?.uid);
      
      setShowUserForm(false);
      setEditingUser(null);
      setNewUserData({ 
        email: '', 
        password: '', 
        displayName: '', 
        role: 'student',
        phone: '',
        institution: '',
        skills: []
      });
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await UserService.delete(userToDelete.uid, userProfile?.uid);
      setShowDeleteDialog(false);
      setUserToDelete(null);
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !newUserData.skills.includes(skill.trim())) {
      setNewUserData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setNewUserData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate real statistics from Firebase data
  const totalLeads = leads.length;
  const openLeads = leads.filter(l => l.status === 'open').length;
  const resolvedLeads = leads.filter(l => l.status === 'resolved').length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const pendingRegistrations = eventRegistrations.filter(r => r.status === 'pending').length;

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+12%'
    },
    {
      label: 'Open Leads',
      value: openLeads,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-100',
      change: '+8%'
    },
    {
      label: 'Resolved Today',
      value: resolvedLeads,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+15%'
    },
    {
      label: 'Pending Approvals',
      value: pendingApplications + pendingRegistrations,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      change: '+5%'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Create and manage user accounts',
      icon: Users,
      onClick: () => setActiveTab('users'),
      color: 'bg-blue-500'
    },
    {
      title: 'Registration Management',
      description: 'Review event registrations',
      icon: FileText,
      href: '/admin/registrations',
      color: 'bg-green-500'
    },
    {
      title: 'Approvals',
      description: 'Review partnership requests',
      icon: CheckCircle,
      onClick: () => setActiveTab('approvals'),
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      onClick: () => alert('Analytics dashboard coming soon!'),
      color: 'bg-orange-500'
    }
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = searchTerm === '' || 
      lead.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change} this month</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            action.href ? (
              <Link
                key={index}
                to={action.href}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </Link>
            ) : (
              <button
                key={index}
                onClick={action.onClick}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group text-left border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </button>
            )
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leads found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredLeads.slice(0, 10).map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-sm font-medium text-blue-600">
                          {lead.ticketNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{lead.subject}</h3>
                      <p className="text-sm text-gray-600">
                        by {lead.studentName} • {lead.studentEmail}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {lead.status === 'open' && (
                        <select
                          onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="" disabled>Assign to...</option>
                          <option value="vertical_head@doutly.com">Vertical Head</option>
                          <option value="manager@doutly.com">Manager</option>
                          <option value="team_leader@doutly.com">Team Leader</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setNewUserData({ 
              email: '', 
              password: '', 
              displayName: '', 
              role: 'tutor',
              phone: '',
              institution: '',
              skills: []
            });
            setShowUserForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Team Members ({totalUsers})</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Approvals</h2>
      
      {/* Partnership Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Partnership Requests ({applications.filter(a => a.type === 'partnership_application').length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {applications.filter(a => a.type === 'partnership_application').map((app) => (
            <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{app.organizationName || app.name}</h4>
                  <p className="text-sm text-gray-600">{app.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{app.eventType} • {app.estimatedAttendees} attendees</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {new Date(app.submittedAt?.toDate?.() || app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveApplication(app.id, app.type)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectApplication(app.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {applications.filter(a => a.type === 'partnership_application').length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No partnership requests found
            </div>
          )}
        </div>
      </div>

      {/* Tutor Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Tutor Applications ({applications.filter(a => a.type === 'tutor_application').length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {applications.filter(a => a.type === 'tutor_application').map((app) => (
            <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{app.name}</h4>
                  <p className="text-sm text-gray-600">{app.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{app.experience} experience • ₹{app.hourlyRate}/hour</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Skills: {app.skills?.join(', ') || 'Not specified'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {new Date(app.submittedAt?.toDate?.() || app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveApplication(app.id, app.type)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve & Create Account
                      </button>
                      <button
                        onClick={() => handleRejectApplication(app.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {applications.filter(a => a.type === 'tutor_application').length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No tutor applications found
            </div>
          )}
        </div>
      </div>

      {/* Event Registrations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Event Registrations ({eventRegistrations.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {eventRegistrations.map((reg) => (
            <div key={reg.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{reg.name}</h4>
                  <p className="text-sm text-gray-600">{reg.eventTitle}</p>
                  <p className="text-sm text-gray-500">{reg.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {new Date(reg.registrationDate?.toDate?.() || reg.registrationDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                  {reg.status}
                </span>
              </div>
            </div>
          ))}
          {eventRegistrations.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No event registrations found
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage the entire platform and monitor system performance
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'approvals', label: 'Approvals', icon: CheckCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'approvals' && renderApprovals()}

        {/* Create/Edit User Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingUser ? 'Edit User' : 'Create New User'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                    <input
                      type="text"
                      value={newUserData.displayName}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={newUserData.role}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="tutor">Tutor</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="manager">Manager</option>
                      <option value="vertical_head">Vertical Head</option>
                      <option value="bda">BDA</option>
                      <option value="sales">Sales</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newUserData.phone}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                    <input
                      type="text"
                      value={newUserData.institution}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newUserData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${userToDelete?.displayName}? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;