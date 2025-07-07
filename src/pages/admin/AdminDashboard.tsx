import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  UserCheck,
  Filter,
  Search,
  Eye,
  ArrowRight,
  Briefcase,
  Calendar,
  BookOpen,
  Settings,
  BarChart3,
  FileText,
  Mail,
  Phone,
  Building,
  Award,
  X,
  Trash2
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { LeadService, ApplicationService, EventRegistrationService, JobApplicationService, JobPostingService, UserService } from '../../lib/database';
import BackButton from '../../components/BackButton';
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
  doubtDescription: string;
}

interface Application {
  id: string;
  type: string;
  name?: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  skills?: string[];
  experience?: string;
}

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  eventTitle: string;
  eventType: string;
  status: 'pending' | 'approved' | 'rejected';
  registrationDate: any;
}

interface JobApplication {
  id: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter: string;
  resumeLink?: string;
  experience?: string;
  skills?: string[];
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  submittedAt: any;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const { signUp } = useAuth();
  // State for admin user creation
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'manager',
  });
  const [userCreateLoading, setUserCreateLoading] = useState(false);
  const [userCreateError, setUserCreateError] = useState('');
  const [userCreateSuccess, setUserCreateSuccess] = useState('');

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserCreateError('');
    setUserCreateSuccess('');
    if (newUser.password !== newUser.confirmPassword) {
      setUserCreateError('Passwords do not match');
      return;
    }
    if (newUser.password.length < 6) {
      setUserCreateError('Password must be at least 6 characters long');
      return;
    }
    setUserCreateLoading(true);
    try {
      await signUp(newUser.email, newUser.password, {
        displayName: newUser.displayName,
        role: newUser.role,
      });
      setUserCreateSuccess('User created successfully!');
      setNewUser({ email: '', password: '', confirmPassword: '', displayName: '', role: 'manager' });
    } catch (err: any) {
      setUserCreateError(err.message || 'Failed to create user');
    } finally {
      setUserCreateLoading(false);
    }
  };

  useEffect(() => {
    // Subscribe to leads
    const unsubscribeLeads = LeadService.subscribe([], (leadsData) => {
      setLeads(leadsData);
      setLoading(false);
    });

    // Subscribe to applications
    const unsubscribeApplications = ApplicationService.subscribe([], (applicationsData) => {
      setApplications(applicationsData);
    });

    // Subscribe to event registrations
    const unsubscribeEvents = EventRegistrationService.subscribe([], (eventsData) => {
      setEventRegistrations(eventsData);
    });

    // Subscribe to job applications
    const unsubscribeJobs = JobApplicationService.subscribe([], (jobsData) => {
      setJobApplications(jobsData);
    });

    // Fetch users for assignment dropdown
    const unsubscribeUsers = UserService.subscribe([], (usersData) => {
      setUsers(usersData);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeApplications();
      unsubscribeEvents();
      unsubscribeJobs();
      unsubscribeUsers();
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

  const handleUpdateStatus = async (collection: string, itemId: string, status: string) => {
    try {
      switch (collection) {
        case 'applications':
          await ApplicationService.update(itemId, { status, updatedAt: new Date() }, userProfile?.uid);
          break;
        case 'event_registrations':
          await EventRegistrationService.update(itemId, { status, updatedAt: new Date() }, userProfile?.uid);
          break;
        case 'job_applications':
          await JobApplicationService.update(itemId, { status, updatedAt: new Date() }, userProfile?.uid);
          break;
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteItem = async (collection: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (collection) {
        case 'applications':
          await ApplicationService.delete(itemId, userProfile?.uid);
          break;
        case 'event_registrations':
          await EventRegistrationService.delete(itemId, userProfile?.uid);
          break;
        case 'job_applications':
          await JobApplicationService.delete(itemId, userProfile?.uid);
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleRevokeLead = async (leadId: string) => {
    try {
      await LeadService.update(leadId, {
        assignedTo: null,
        assignedBy: null,
        status: 'open',
        updatedAt: new Date()
      }, userProfile?.uid);
    } catch (error) {
      console.error('Error revoking lead:', error);
    }
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
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      label: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+12%'
    },
    {
      label: 'Pending Applications',
      value: applications.filter(a => a.status === 'pending').length,
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: '+8%'
    },
    {
      label: 'Event Registrations',
      value: eventRegistrations.length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+15%'
    },
    {
      label: 'Job Applications',
      value: jobApplications.length,
      icon: Briefcase,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+22%'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'jobs', label: 'Job Applications', icon: Briefcase }
  ];

  const filterData = (data: any[], searchField: string) => {
    let filtered = data;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item[searchField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">{stat.change} this month</p>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/hackathons"
            className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Hackathons</span>
            </div>
            <ArrowRight className="h-4 w-4 text-purple-600" />
          </Link>
          <Link 
            to="/admin/job-postings"
            className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Manage Job Postings</span>
            </div>
            <ArrowRight className="h-4 w-4 text-yellow-600" />
          </Link>
          <Link 
            to="/admin/settings"
            className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">Settings</span>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-600" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{lead.subject}</p>
                  <p className="text-sm text-gray-600">{lead.studentName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Job Applications</h3>
          <div className="space-y-3">
            {jobApplications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{app.jobTitle}</p>
                  <p className="text-sm text-gray-600">{app.applicantName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => {
    const filteredLeads = filterData(leads, 'subject');
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Lead Management</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
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
              {filteredLeads.map((lead) => (
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
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{lead.subject}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {lead.studentName} • {lead.studentEmail}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {lead.doubtDescription}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedItem(lead)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {lead.status === 'open' && (
                        <select
                          onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="" disabled>Assign to...</option>
                          {dedupeUsersByEmail(users.filter(u => ['manager','team_leader','tutor'].includes(u.role))).map((user) => (
                            <option key={user.uid} value={user.email}>
                              {getUserDisplayName(user)} ({user.role})
                            </option>
                          ))}
                        </select>
                      )}
                      {lead.status === 'assigned' && (
                        <button
                          onClick={() => handleRevokeLead(lead.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors ml-2"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderJobApplications = () => {
    const filteredJobs = filterData(jobApplications, 'jobTitle');
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredJobs.length === 0 ? (
            <div className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No job applications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredJobs.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {app.applicantName} • {app.applicantEmail}
                      </p>
                      {app.applicantPhone && (
                        <p className="text-sm text-gray-500 mb-2">{app.applicantPhone}</p>
                      )}
                      {app.experience && (
                        <p className="text-sm text-gray-500 mb-2">Experience: {app.experience}</p>
                      )}
                      {app.skills && app.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {app.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {app.skills.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              +{app.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Applied: {new Date(app.submittedAt?.toDate?.() || app.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedItem(app)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {app.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateStatus('job_applications', app.id, 'reviewed')}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('job_applications', app.id, 'rejected')}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {app.status === 'reviewed' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateStatus('job_applications', app.id, 'shortlisted')}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('job_applications', app.id, 'rejected')}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {app.status === 'shortlisted' && (
                        <button
                          onClick={() => handleUpdateStatus('job_applications', app.id, 'hired')}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Hire
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem('job_applications', app.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderApplications = () => {
    const filteredApps = filterData(applications, 'name');
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Tutor & Partnership Applications</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredApps.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredApps.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{app.name || 'N/A'}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.email}</p>
                      <p className="text-sm text-gray-500">Type: {app.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedItem(app)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {app.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateStatus('applications', app.id, 'approved')}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('applications', app.id, 'rejected')}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    const filteredEvents = filterData(eventRegistrations, 'eventTitle');
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Event Registrations</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No event registrations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEvents.map((reg) => (
                <div key={reg.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{reg.eventTitle}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                          {reg.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reg.name} • {reg.email}</p>
                      <p className="text-sm text-gray-500">Type: {reg.eventType}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedItem(reg)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {reg.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateStatus('event_registrations', reg.id, 'approved')}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('event_registrations', reg.id, 'rejected')}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'leads':
        return (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Create New User (Any Role)</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateUser}>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={newUser.displayName}
                    onChange={handleNewUserChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleNewUserChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Confirm password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleNewUserChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="manager">Manager</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="tutor">Tutor</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="vertical_head">Vertical Head</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={userCreateLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {userCreateLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
                {userCreateError && (
                  <div className="col-span-2 text-red-600 mt-2">{userCreateError}</div>
                )}
                {userCreateSuccess && (
                  <div className="col-span-2 text-green-600 mt-2">{userCreateSuccess}</div>
                )}
              </form>
            </div>
            {renderLeads()}
          </>
        );
      case 'applications':
        return renderApplications();
      case 'events':
        return renderEvents();
      case 'jobs':
        return renderJobApplications();
      default:
        return renderOverview();
    }
  };

  // Helper function to get display name from email if displayName is missing
  const getUserDisplayName = (user: any) => {
    if (user.displayName && user.displayName.trim() !== '') return user.displayName;
    if (user.email) return user.email.split('@')[0].split('.')[0];
    return 'User';
  };

  // Helper to deduplicate users by email
  const dedupeUsersByEmail = (users: any[]) => {
    const seen = new Set();
    return users.filter(u => {
      if (seen.has(u.email)) return false;
      seen.add(u.email);
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage leads, applications, events, and system operations
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'submittedAt' || key === 'registrationDate') return null;
                  // Special handling for arrays of objects (e.g., history)
                  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                    return (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <div className="mt-1 overflow-x-auto">
                          <table className="min-w-full text-xs border mt-2">
                            <thead>
                              <tr>
                                {Object.keys(value[0]).map((col) => (
                                  <th key={col} className="px-2 py-1 border-b text-left font-semibold">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {value.map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((cell, cidx) => (
                                    <td key={cidx} className="px-2 py-1 border-b">
                                      {cell instanceof Date || cell?.toDate ? new Date(cell?.toDate?.() || cell).toLocaleString() : String(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="mt-1">
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : typeof value === 'string' && value.length > 100 ? (
                          <p className="text-gray-900 text-sm leading-relaxed">{value}</p>
                        ) : (
                          <p className="text-gray-900">{String(value)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;