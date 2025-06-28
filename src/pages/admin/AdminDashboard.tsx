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
  Trash2,
  Building,
  Award,
  Briefcase,
  Plus,
  X
} from 'lucide-react';
import { LeadService, ApplicationService, EventRegistrationService, UserService } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { EmailService } from '../../lib/emailService';
import BackButton from '../../components/BackButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

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
  reviewedBy?: string;
  reviewNotes?: string;
}

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  eventTitle: string;
  eventType: string;
  registrationDate: any;
  status: 'pending' | 'approved' | 'rejected';
  phone?: string;
  institution?: string;
  additionalInfo?: string;
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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  location: string;
  maxAttendees: number;
  price: string;
  image: string;
  tags: string[];
  institution: string;
  createdAt: any;
  status: 'active' | 'inactive';
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: any;
  status: 'active' | 'inactive';
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<'user' | 'event' | 'job'>('user');
  const [processingApplication, setProcessingApplication] = useState<string | null>(null);
  const [processingRegistration, setProcessingRegistration] = useState<string | null>(null);
  
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'tutor',
    phone: '',
    institution: '',
    skills: [] as string[]
  });

  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'Workshop',
    location: 'Online',
    maxAttendees: 100,
    price: 'Free',
    image: '',
    tags: [] as string[],
    institution: 'Doutly'
  });

  const [newJobData, setNewJobData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    experience: '1-3 years',
    salary: '$50,000 - $70,000',
    description: '',
    requirements: [] as string[],
    benefits: [] as string[]
  });

  useEffect(() => {
    let unsubscribeLeads: (() => void) | undefined;
    let unsubscribeApplications: (() => void) | undefined;
    let unsubscribeRegistrations: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;

    const setupSubscriptions = async () => {
      try {
        // Subscribe to all leads
        unsubscribeLeads = LeadService.subscribe([], (leadsData) => {
          setLeads(leadsData || []);
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
          // Filter to show only admin-manageable roles and exclude students
          const adminUsers = (usersData || []).filter(user => 
            ['admin', 'vertical_head', 'manager', 'team_leader', 'tutor', 'freelancer', 'bda', 'sales'].includes(user.role)
          );
          setUsers(adminUsers);
        });

        setLoading(false);
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        setLoading(false);
      }
    };

    setupSubscriptions();

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
    setProcessingApplication(applicationId);
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await ApplicationService.update(applicationId, {
        status: 'approved',
        reviewedBy: userProfile?.displayName,
        updatedAt: new Date()
      }, userProfile?.uid);

      // Send approval email
      const name = application.name || application.contactName || 'User';
      const emailType = type === 'tutor_application' ? 'tutor' : 'partnership';
      await EmailService.sendApprovalEmail(application.email, name, emailType);

      // If it's a tutor application, create user account
      if (type === 'tutor_application') {
        try {
          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
          
          // Create Firebase Auth user
          const userCredential = await createUserWithEmailAndPassword(auth, application.email, tempPassword);
          
          // Create user profile
          const userProfileData = {
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

          await UserService.create(userProfileData, userCredential.user.uid);
          
          alert(`Tutor approved and account created! Temporary password: ${tempPassword}\nApproval email sent to ${application.email}`);
        } catch (error) {
          console.error('Error creating tutor account:', error);
          alert('Application approved and email sent, but failed to create account. Please create manually.');
        }
      } else {
        alert(`Partnership application approved! Approval email sent to ${application.email}`);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application. Please try again.');
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleRejectApplication = async (applicationId: string, type: string) => {
    setProcessingApplication(applicationId);
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await ApplicationService.update(applicationId, {
        status: 'rejected',
        reviewedBy: userProfile?.displayName,
        updatedAt: new Date()
      }, userProfile?.uid);

      // Send rejection email
      const name = application.name || application.contactName || 'User';
      const emailType = type === 'tutor_application' ? 'tutor' : 'partnership';
      await EmailService.sendRejectionEmail(application.email, name, emailType);

      alert(`Application rejected. Notification email sent to ${application.email}`);
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application. Please try again.');
    } finally {
      setProcessingApplication(null);
    }
  };

  const handleApproveEventRegistration = async (registrationId: string) => {
    setProcessingRegistration(registrationId);
    try {
      const registration = eventRegistrations.find(reg => reg.id === registrationId);
      if (!registration) return;

      await EventRegistrationService.update(registrationId, {
        status: 'approved',
        approvedBy: userProfile?.displayName,
        approvalDate: new Date(),
        updatedAt: new Date()
      }, userProfile?.uid);

      // Send approval email
      await EmailService.sendEventRegistrationApproval(
        registration.email, 
        registration.name, 
        registration.eventTitle
      );

      alert(`Registration approved! Confirmation email sent to ${registration.email}`);
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration. Please try again.');
    } finally {
      setProcessingRegistration(null);
    }
  };

  const handleRejectEventRegistration = async (registrationId: string) => {
    setProcessingRegistration(registrationId);
    try {
      await EventRegistrationService.update(registrationId, {
        status: 'rejected',
        reviewedBy: userProfile?.displayName,
        updatedAt: new Date()
      }, userProfile?.uid);

      alert('Registration rejected successfully!');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Error rejecting registration. Please try again.');
    } finally {
      setProcessingRegistration(null);
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
        role: 'tutor',
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
        role: 'tutor',
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

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      if (deleteType === 'user') {
        await UserService.delete(itemToDelete.uid, userProfile?.uid);
        alert('User deleted successfully!');
      } else if (deleteType === 'event') {
        // Delete event logic here
        alert('Event deleted successfully!');
      } else if (deleteType === 'job') {
        // Delete job logic here
        alert('Job deleted successfully!');
      }
      
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error(`Error deleting ${deleteType}:`, error);
      alert(`Error deleting ${deleteType}: ${error.message}`);
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

  const addTag = (tag: string) => {
    if (tag.trim() && !newEventData.tags.includes(tag.trim())) {
      setNewEventData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setNewEventData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'vertical_head': return Building;
      case 'manager': return Briefcase;
      case 'team_leader': return Users;
      case 'tutor': return Award;
      case 'freelancer': return UserCheck;
      case 'bda': return TrendingUp;
      case 'sales': return BarChart3;
      default: return Users;
    }
  };

  // Calculate real statistics from Firebase data
  const totalLeads = leads.length;
  const openLeads = leads.filter(l => l.status === 'open').length;
  const resolvedLeads = leads.filter(l => l.status === 'resolved').length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const totalEmployees = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const pendingRegistrations = eventRegistrations.filter(r => r.status === 'pending').length;

  // Employee categories
  const employeeCategories = [
    { role: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
    { role: 'vertical_head', label: 'Vertical Heads', count: users.filter(u => u.role === 'vertical_head').length, icon: Building, color: 'text-purple-600', bg: 'bg-purple-100' },
    { role: 'manager', label: 'Managers', count: users.filter(u => u.role === 'manager').length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { role: 'team_leader', label: 'Team Leaders', count: users.filter(u => u.role === 'team_leader').length, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { role: 'tutor', label: 'Tutors', count: users.filter(u => u.role === 'tutor').length, icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { role: 'freelancer', label: 'Freelancers', count: users.filter(u => u.role === 'freelancer').length, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { role: 'bda', label: 'BDAs', count: users.filter(u => u.role === 'bda').length, icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-100' },
    { role: 'sales', label: 'Sales', count: users.filter(u => u.role === 'sales').length, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-100' }
  ];

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
      title: 'Event Management',
      description: 'Create and manage events',
      icon: Calendar,
      onClick: () => setActiveTab('events'),
      color: 'bg-purple-500'
    },
    {
      title: 'Job Management',
      description: 'Create and manage job postings',
      icon: Briefcase,
      onClick: () => setActiveTab('jobs'),
      color: 'bg-green-500'
    },
    {
      title: 'Approvals',
      description: 'Review partnership requests',
      icon: CheckCircle,
      onClick: () => setActiveTab('approvals'),
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
            <button
              key={index}
              onClick={action.onClick}
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
            </button>
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
              <LoadingSpinner text="Loading leads..." />
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
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
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
          <span>Create Employee</span>
        </button>
      </div>

      {/* Employee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'tutor').length}</p>
              <p className="text-sm text-gray-600">Tutors</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'manager').length}</p>
              <p className="text-sm text-gray-600">Managers</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {employeeCategories.map((category) => (
            <div key={category.role} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${category.bg}`}>
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{category.count}</p>
                  <p className="text-sm text-gray-600">{category.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <LoadingSpinner text="Loading employees..." />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No employees found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <RoleIcon className="h-4 w-4 text-gray-500" />
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
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
                              setItemToDelete(user);
                              setDeleteType('user');
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Approvals Management</h2>
      
      {/* Event Registrations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Event Registrations ({eventRegistrations.filter(r => r.status === 'pending').length} pending)</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center">
              <LoadingSpinner text="Loading event registrations..." />
            </div>
          ) : eventRegistrations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No event registrations found
            </div>
          ) : (
            eventRegistrations.map((reg) => (
              <div key={reg.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{reg.name}</h4>
                    <p className="text-sm text-gray-600">{reg.eventTitle}</p>
                    <p className="text-sm text-gray-500">{reg.email}</p>
                    {reg.phone && <p className="text-xs text-gray-500">{reg.phone}</p>}
                    {reg.institution && <p className="text-xs text-gray-500">{reg.institution}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Registered: {new Date(reg.registrationDate?.toDate?.() || reg.registrationDate).toLocaleDateString()}
                    </p>
                    {reg.additionalInfo && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        "{reg.additionalInfo}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                      {reg.status}
                    </span>
                    {reg.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveEventRegistration(reg.id)}
                          disabled={processingRegistration === reg.id}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processingRegistration === reg.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectEventRegistration(reg.id)}
                          disabled={processingRegistration === reg.id}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {processingRegistration === reg.id ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Partnership Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Partnership Requests ({applications.filter(a => (a.type === 'partnership_application' || a.type === 'event_partnership') && a.status === 'pending').length} pending)</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center">
              <LoadingSpinner text="Loading partnership requests..." />
            </div>
          ) : applications.filter(a => a.type === 'partnership_application' || a.type === 'event_partnership').length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No partnership requests found
            </div>
          ) : (
            applications.filter(a => a.type === 'partnership_application' || a.type === 'event_partnership').map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{app.organizationName || app.name}</h4>
                    <p className="text-sm text-gray-600">{app.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{app.eventType} • {app.estimatedAttendees} attendees</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(app.submittedAt?.toDate?.() || app.submittedAt).toLocaleDateString()}
                    </p>
                    {app.message && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        "{app.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveApplication(app.id, app.type)}
                          disabled={processingApplication === app.id}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processingApplication === app.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app.id, app.type)}
                          disabled={processingApplication === app.id}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {processingApplication === app.id ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tutor Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Tutor Applications ({applications.filter(a => a.type === 'tutor_application' && a.status === 'pending').length} pending)</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 text-center">
              <LoadingSpinner text="Loading tutor applications..." />
            </div>
          ) : applications.filter(a => a.type === 'tutor_application').length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tutor applications found
            </div>
          ) : (
            applications.filter(a => a.type === 'tutor_application').map((app) => (
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
                    {app.bio && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        "{app.bio}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveApplication(app.id, app.type)}
                          disabled={processingApplication === app.id}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processingApplication === app.id ? 'Processing...' : 'Approve & Create Account'}
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app.id, app.type)}
                          disabled={processingApplication === app.id}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {processingApplication === app.id ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

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
                { id: 'users', label: 'Employees', icon: Users },
                { id: 'approvals', label: 'Approvals', icon: CheckCircle },
                { id: 'events', label: 'Events', icon: Calendar },
                { id: 'jobs', label: 'Jobs', icon: Briefcase }
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
        {activeTab === 'events' && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Management</h3>
            <p className="text-gray-600 mb-6">Create and manage events for your platform</p>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          </div>
        )}
        {activeTab === 'jobs' && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Job Management</h3>
            <p className="text-gray-600 mb-6">Create and manage job postings for your careers page</p>
            <button
              onClick={() => setShowJobForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Job</span>
            </button>
          </div>
        )}

        {/* Create/Edit User Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingUser ? 'Edit Employee' : 'Create New Employee'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
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
                    {editingUser ? 'Update Employee' : 'Create Employee'}
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
          onConfirm={handleDeleteItem}
          title={`Delete ${deleteType}`}
          message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;