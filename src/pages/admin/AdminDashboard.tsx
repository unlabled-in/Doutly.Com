import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  UserPlus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Building,
  Award,
  Calendar,
  FileText,
  BarChart3,
  Send,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  where, 
  updateDoc, 
  doc,
  addDoc,
  deleteDoc 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserService, ApplicationService, EventRegistrationService } from '../../lib/database';
import { EmailService } from '../../lib/emailService';
import BackButton from '../../components/BackButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  phone?: string;
  institution?: string;
  createdAt: any;
  isActive: boolean;
  lastLoginAt?: any;
}

interface Application {
  id: string;
  type: string;
  name?: string;
  organizationName?: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  skills?: string[];
  experience?: string;
  bio?: string;
  message?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  eventTitle: string;
  eventType: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: any;
  approvedBy?: string;
  rejectionReason?: string;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    role: 'student',
    phone: '',
    institution: ''
  });

  useEffect(() => {
    // Subscribe to users with deduplication
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      // Remove duplicates based on email and uid
      const uniqueUsers = usersData.reduce((acc: User[], current) => {
        const existingUser = acc.find(user => 
          user.email === current.email || user.uid === current.uid
        );
        
        if (!existingUser) {
          acc.push(current);
        } else {
          // Keep the most recent one (with more complete data)
          const currentIndex = acc.indexOf(existingUser);
          if (current.displayName && !existingUser.displayName) {
            acc[currentIndex] = current;
          } else if (current.lastLoginAt && (!existingUser.lastLoginAt || 
            new Date(current.lastLoginAt.toDate?.() || current.lastLoginAt) > 
            new Date(existingUser.lastLoginAt.toDate?.() || existingUser.lastLoginAt))) {
            acc[currentIndex] = current;
          }
        }
        return acc;
      }, []);
      
      setUsers(uniqueUsers);
      setLoading(false);
    });

    // Subscribe to applications
    const applicationsQuery = query(collection(db, 'applications'), orderBy('submittedAt', 'desc'));
    const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      setApplications(applicationsData);
    });

    // Subscribe to event registrations
    const eventsQuery = query(collection(db, 'event_registrations'), orderBy('registrationDate', 'desc'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventRegistration[];
      setEventRegistrations(eventsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeApplications();
      unsubscribeEvents();
    };
  }, []);

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tempPassword = generateTempPassword();
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, tempPassword);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: newUser.displayName
      });

      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: newUser.displayName,
        role: newUser.role,
        phone: newUser.phone || undefined,
        institution: newUser.institution || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        profileComplete: true
      };

      await UserService.create(userProfile, user.uid);

      // Send welcome email with credentials
      await EmailService.sendTeamInviteEmail(
        user.email!,
        newUser.displayName,
        newUser.role,
        tempPassword
      );

      setNewUser({
        email: '',
        displayName: '',
        role: 'student',
        phone: '',
        institution: ''
      });
      setShowCreateUser(false);
      
      alert(`User created successfully! Credentials sent to ${user.email}`);
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await UserService.update(userId, { role: newRole, updatedAt: new Date() }, userProfile?.uid);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserService.delete(userId, userProfile?.uid);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await ApplicationService.update(applicationId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: userProfile?.displayName,
        reviewNotes: reason,
        updatedAt: new Date()
      }, userProfile?.uid);

      // Send email notification
      if (action === 'approve') {
        await EmailService.sendApprovalEmail(
          application.email,
          application.name || application.organizationName || 'User',
          application.type === 'tutor_application' ? 'tutor' : 'partnership'
        );
      } else {
        await EmailService.sendRejectionEmail(
          application.email,
          application.name || application.organizationName || 'User',
          application.type === 'tutor_application' ? 'tutor' : 'partnership',
          reason
        );
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleEventRegistrationAction = async (registrationId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const registration = eventRegistrations.find(reg => reg.id === registrationId);
      if (!registration) return;

      await EventRegistrationService.update(registrationId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: userProfile?.displayName,
        approvalDate: new Date(),
        rejectionReason: reason,
        updatedAt: new Date()
      }, userProfile?.uid);

      // Send email notification
      if (action === 'approve') {
        await EmailService.sendEventRegistrationApproval(
          registration.email,
          registration.name,
          registration.eventTitle
        );
      } else {
        await EmailService.sendEventRegistrationRejection(
          registration.email,
          registration.name,
          registration.eventTitle,
          reason
        );
      }
    } catch (error) {
      console.error('Error updating event registration:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const displayName = user.displayName || '';
    const email = user.email || '';
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+12%'
    },
    {
      label: 'Pending Applications',
      value: applications.filter(app => app.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      change: '+5%'
    },
    {
      label: 'Active Tutors',
      value: users.filter(user => user.role === 'tutor' && user.isActive).length,
      icon: Award,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+8%'
    },
    {
      label: 'Event Registrations',
      value: eventRegistrations.length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+15%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'vertical_head': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'team_leader': return 'bg-green-100 text-green-800';
      case 'tutor': return 'bg-orange-100 text-orange-800';
      case 'freelancer': return 'bg-pink-100 text-pink-800';
      case 'bda': return 'bg-indigo-100 text-indigo-800';
      case 'sales': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage users, applications, and system settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Create User</span>
              </button>
              <a
                href="/creator"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Creator Page</span>
              </a>
              <a
                href="/hackathons"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>Hackathons</span>
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'User Profiles', icon: Users },
                { id: 'applications', label: 'Applications', icon: FileText },
                { id: 'events', label: 'Event Registrations', icon: Calendar },
                { id: 'content', label: 'Content Management', icon: Edit },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {app.name || app.organizationName} applied as {app.type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(app.submittedAt?.toDate?.() || app.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      {['student', 'tutor', 'freelancer', 'manager', 'team_leader'].map((role) => {
                        const count = users.filter(user => user.role === role).length;
                        const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                        return (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{role.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">User Profiles</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="vertical_head">Vertical Head</option>
                      <option value="manager">Manager</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="tutor">Tutor</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="bda">BDA</option>
                      <option value="sales">Sales</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={`${user.uid}-${user.id}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.displayName || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                                {user.phone && (
                                  <div className="text-sm text-gray-500">{user.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastLoginAt 
                                ? new Date(user.lastLoginAt?.toDate?.() || user.lastLoginAt).toLocaleDateString()
                                : 'Never'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="student">Student</option>
                                  <option value="tutor">Tutor</option>
                                  <option value="freelancer">Freelancer</option>
                                  <option value="team_leader">Team Leader</option>
                                  <option value="manager">Manager</option>
                                  <option value="vertical_head">Vertical Head</option>
                                  <option value="bda">BDA</option>
                                  <option value="sales">Sales</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => setConfirmDialog({
                                    isOpen: true,
                                    title: 'Delete User',
                                    message: `Are you sure you want to delete ${user.displayName || user.email}? This action cannot be undone.`,
                                    onConfirm: () => handleDeleteUser(user.id),
                                    type: 'danger'
                                  })}
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
            )}

            {activeTab === 'applications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {application.name || application.organizationName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {application.email} • {application.type.replace('_', ' ')}
                          </p>
                          {application.bio && (
                            <p className="text-sm text-gray-700 mb-2">{application.bio}</p>
                          )}
                          {application.skills && application.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {application.skills.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(application.submittedAt?.toDate?.() || application.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {application.status === 'pending' && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleApplicationAction(application.id, 'approve')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection (optional):');
                                handleApplicationAction(application.id, 'reject', reason || undefined);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Event Registrations</h2>
                <div className="space-y-4">
                  {eventRegistrations.map((registration) => (
                    <div key={registration.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{registration.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                              {registration.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {registration.email} • {registration.eventTitle}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">Event Type: {registration.eventType}</p>
                          <p className="text-xs text-gray-500">
                            Registered: {new Date(registration.registrationDate?.toDate?.() || registration.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        {registration.status === 'pending' && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEventRegistrationAction(registration.id, 'approve')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for rejection (optional):');
                                handleEventRegistrationAction(registration.id, 'reject', reason || undefined);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Content Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Edit className="h-6 w-6 text-purple-600" />
                      <h3 className="text-lg font-medium text-gray-900">Creator Page</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Manage posts, articles, and educational content creation.
                    </p>
                    <a
                      href="/creator"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Manage Posts
                    </a>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-medium text-gray-900">Hackathons</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Create and manage hackathons, competitions, and tech events.
                    </p>
                    <a
                      href="/hackathons"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Hackathons
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        value="doutly4@gmail.com"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                      <input
                        type="tel"
                        value="8088887775"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                  <button
                    onClick={() => setShowCreateUser(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="student">Student</option>
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
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={newUser.institution}
                    onChange={(e) => setNewUser(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedUser.displayName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.institution && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Institution</label>
                      <p className="text-gray-900">{selectedUser.institution}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-gray-900">
                      {new Date(selectedUser.createdAt?.toDate?.() || selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Login</label>
                    <p className="text-gray-900">
                      {selectedUser.lastLoginAt 
                        ? new Date(selectedUser.lastLoginAt?.toDate?.() || selectedUser.lastLoginAt).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;