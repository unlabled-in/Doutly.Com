import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  UserCheck,
  Calendar,
  BookOpen,
  Settings,
  BarChart3,
  Filter,
  Search,
  Eye,
  ArrowRight,
  Mail,
  Phone,
  Building,
  Award,
  Star,
  XCircle
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { EmailService } from '../../lib/emailService';
import BackButton from '../../components/BackButton';

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
  type: 'tutor_application' | 'partnership_application' | 'event_partnership';
  name?: string;
  organizationName?: string;
  contactName?: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  skills?: string[];
  experience?: string;
  bio?: string;
  partnershipType?: string;
  eventType?: string;
  message?: string;
  reviewNotes?: string;
}

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventTitle: string;
  eventType: string;
  registrationDate: any;
  status: 'pending' | 'approved' | 'rejected';
  institution?: string;
  additionalInfo?: string;
  rejectionReason?: string;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
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
    const registrationsQuery = query(collection(db, 'event_registrations'), orderBy('registrationDate', 'desc'));
    const unsubscribeRegistrations = onSnapshot(registrationsQuery, (snapshot) => {
      const registrationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventRegistration[];
      setEventRegistrations(registrationsData);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeApplications();
      unsubscribeRegistrations();
    };
  }, []);

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    setActionLoading(applicationId);
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await updateDoc(doc(db, 'applications', applicationId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: userProfile?.displayName,
        reviewNotes: notes || '',
        updatedAt: new Date()
      });

      // Send email notification
      const applicantName = application.name || application.contactName || 'Applicant';
      const applicationType = application.type === 'tutor_application' ? 'tutor' : 'partnership';
      
      if (action === 'approve') {
        await EmailService.sendApprovalEmail(application.email, applicantName, applicationType as 'tutor' | 'partnership');
      } else {
        await EmailService.sendRejectionEmail(application.email, applicantName, applicationType as 'tutor' | 'partnership', notes);
      }

      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEventRegistrationAction = async (registrationId: string, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(registrationId);
    try {
      const registration = eventRegistrations.find(reg => reg.id === registrationId);
      if (!registration) return;

      await updateDoc(doc(db, 'event_registrations', registrationId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: userProfile?.displayName,
        approvalDate: action === 'approve' ? new Date() : null,
        rejectionReason: action === 'reject' ? reason : null,
        updatedAt: new Date()
      });

      // Send email notification
      if (action === 'approve') {
        await EmailService.sendEventRegistrationApproval(registration.email, registration.name, registration.eventTitle);
      }

      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating event registration:', error);
    } finally {
      setActionLoading(null);
    }
  };

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
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'team_leader': return 'bg-purple-100 text-purple-800';
      case 'tutor': return 'bg-green-100 text-green-800';
      case 'freelancer': return 'bg-orange-100 text-orange-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate user statistics by role
  const userStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    team_leader: users.filter(u => u.role === 'team_leader').length,
    vertical_head: users.filter(u => u.role === 'vertical_head').length,
    tutor: users.filter(u => u.role === 'tutor').length,
    freelancer: users.filter(u => u.role === 'freelancer').length,
    bda: users.filter(u => u.role === 'bda').length,
    sales: users.filter(u => u.role === 'sales').length,
    student: users.filter(u => u.role === 'student').length
  };

  const stats = [
    {
      label: 'Total Users',
      value: userStats.total,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Pending Applications',
      value: applications.filter(a => a.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      label: 'Event Registrations',
      value: eventRegistrations.filter(r => r.status === 'pending').length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      label: 'Active Users',
      value: users.filter(u => u.isActive).length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100'
    }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = searchTerm === '' || 
      (app.name && app.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.contactName && app.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredRegistrations = eventRegistrations.filter(reg => {
    const matchesFilter = filter === 'all' || reg.status === filter;
    const matchesSearch = searchTerm === '' || 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, applications, and system settings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
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
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'applications', label: 'Applications', icon: UserCheck },
                { id: 'events', label: 'Event Registrations', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
                
                {/* User Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">User Distribution</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Students</span>
                        <span className="font-medium">{userStats.student}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tutors</span>
                        <span className="font-medium">{userStats.tutor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Freelancers</span>
                        <span className="font-medium">{userStats.freelancer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Staff</span>
                        <span className="font-medium">{userStats.admin + userStats.manager + userStats.team_leader + userStats.vertical_head + userStats.bda + userStats.sales}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Application Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-medium text-yellow-600">{applications.filter(a => a.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Approved</span>
                        <span className="font-medium text-green-600">{applications.filter(a => a.status === 'approved').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rejected</span>
                        <span className="font-medium text-red-600">{applications.filter(a => a.status === 'rejected').length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Event Registrations</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-medium text-yellow-600">{eventRegistrations.filter(r => r.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Approved</span>
                        <span className="font-medium text-green-600">{eventRegistrations.filter(r => r.status === 'approved').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rejected</span>
                        <span className="font-medium text-red-600">{eventRegistrations.filter(r => r.status === 'rejected').length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link 
                    to="/admin/registrations"
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Manage Events</h4>
                        <p className="text-sm text-gray-600">Review registrations</p>
                      </div>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={() => setActiveTab('applications')}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Review Applications</h4>
                        <p className="text-sm text-gray-600">{applications.filter(a => a.status === 'pending').length} pending</p>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">User Management</h4>
                        <p className="text-sm text-gray-600">{userStats.total} total users</p>
                      </div>
                    </div>
                  </button>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-6 w-6 text-orange-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">System Settings</h4>
                        <p className="text-sm text-gray-600">Configure platform</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
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
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.filter(user => 
                          searchTerm === '' || 
                          user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.institution || 'Not specified'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt?.toDate?.() || user.createdAt).toLocaleDateString()}
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Applications</h2>
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
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.name || application.contactName || application.organizationName}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {application.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{application.email}</p>
                          {application.phone && <p className="text-gray-600 mb-2">{application.phone}</p>}
                          {application.bio && <p className="text-gray-600 mb-2">{application.bio}</p>}
                          {application.message && <p className="text-gray-600 mb-2">{application.message}</p>}
                          {application.skills && application.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {application.skills.map((skill, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(application.submittedAt?.toDate?.() || application.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedItem(application)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'approve')}
                                disabled={actionLoading === application.id}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === application.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                disabled={actionLoading === application.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === application.id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Event Registrations</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search registrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredRegistrations.map((registration) => (
                    <div key={registration.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{registration.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                              {registration.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{registration.email}</p>
                          {registration.phone && <p className="text-gray-600 mb-2">{registration.phone}</p>}
                          <p className="font-medium text-gray-900 mb-1">{registration.eventTitle}</p>
                          <p className="text-gray-600 mb-2">Event Type: {registration.eventType}</p>
                          {registration.institution && <p className="text-gray-600 mb-2">Institution: {registration.institution}</p>}
                          {registration.additionalInfo && <p className="text-gray-600 mb-2">Additional Info: {registration.additionalInfo}</p>}
                          <p className="text-sm text-gray-500">
                            Registered: {new Date(registration.registrationDate?.toDate?.() || registration.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedItem(registration)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {registration.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleEventRegistrationAction(registration.id, 'approve')}
                                disabled={actionLoading === registration.id}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === registration.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleEventRegistrationAction(registration.id, 'reject')}
                                disabled={actionLoading === registration.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === registration.id ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.name || selectedItem.contactName || selectedItem.organizationName || 'Details'}
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Display all available information */}
                <div className="space-y-4">
                  {Object.entries(selectedItem).map(([key, value]) => {
                    if (key === 'id' || key === 'uid' || !value) return null;
                    
                    let displayValue = value;
                    if (value && typeof value === 'object' && value.toDate) {
                      displayValue = new Date(value.toDate()).toLocaleDateString();
                    } else if (Array.isArray(value)) {
                      displayValue = value.join(', ');
                    }
                    
                    return (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </label>
                        <p className="text-gray-900">{String(displayValue)}</p>
                      </div>
                    );
                  })}
                </div>
                
                {selectedItem.status === 'pending' && (
                  <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                    <button
                      onClick={() => {
                        if (selectedItem.eventTitle) {
                          handleEventRegistrationAction(selectedItem.id, 'approve');
                        } else {
                          handleApplicationAction(selectedItem.id, 'approve');
                        }
                      }}
                      disabled={actionLoading === selectedItem.id}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedItem.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        if (selectedItem.eventTitle) {
                          handleEventRegistrationAction(selectedItem.id, 'reject');
                        } else {
                          handleApplicationAction(selectedItem.id, 'reject');
                        }
                      }}
                      disabled={actionLoading === selectedItem.id}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === selectedItem.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;