import React, { useState, useEffect } from 'react';
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
  Delete
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';
import { UserService } from '../../lib/database';

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

const TeamLeaderDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Remove mock tutors array
  // const tutors = [
  //   { name: 'Emily Davis', email: 'emily.tutor@doutly.com', subject: 'Mathematics' },
  //   { name: 'John Wilson', email: 'john.tutor@doutly.com', subject: 'Physics' },
  //   { name: 'Sarah Miller', email: 'sarah.tutor@doutly.com', subject: 'Computer Science' },
  //   { name: 'Mark Johnson', email: 'mark.tutor@doutly.com', subject: 'Chemistry' },
  // ];

  useEffect(() => {
    if (!userProfile?.email) return;

    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      // Only show leads assigned to this team leader
      const tlLeads = leadsData.filter(lead => lead.assignedTo === userProfile?.email);
      setLeads(tlLeads);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    let filtered = leads;

    if (filter !== 'all') {
      filtered = filtered.filter(lead => lead.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  }, [leads, filter, searchTerm]);

  useEffect(() => {
    // Fetch users for assignment dropdown
    const unsubscribeUsers = UserService.subscribe([], (usersData) => {
      setUsers(usersData);
    });
    return () => {
      unsubscribeUsers();
    };
  }, []);

  const handleAssignLead = async (leadId: string, assignTo: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        assignedTo: assignTo,
        assignedBy: userProfile?.displayName,
        status: 'in_progress',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error assigning lead:', error);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: status,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRevokeLead = async (leadId: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        assignedTo: null,
        assignedBy: null,
        status: 'open',
        updatedAt: new Date()
      });
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

  // Remove hardcoded stats for performance metrics and team lists
  // const stats = [
  //   {
  //     label: 'Assigned to Me',
  //     value: leads.filter(l => l.assignedTo === userProfile?.email).length,
  //     icon: Users,
  //     color: 'text-blue-600',
  //     bg: 'bg-blue-100'
  //   },
  //   {
  //     label: 'In Progress',
  //     value: leads.filter(l => l.status === 'in_progress').length,
  //     icon: Clock,
  //     color: 'text-yellow-600',
  //     bg: 'bg-yellow-100'
  //   },
  //   {
  //     label: 'Resolved Today',
  //     value: leads.filter(l => l.status === 'resolved').length,
  //     icon: CheckCircle,
  //     color: 'text-green-600',
  //     bg: 'bg-green-100'
  //   },
  //   {
  //     label: 'Team Performance',
  //     value: '91%',
  //     icon: TrendingUp,
  //     color: 'text-purple-600',
  //     bg: 'bg-purple-100'
  //   }
  // ];

  // Helper function to get display name from email if displayName is missing
  const getUserDisplayName = (user) => {
    if (user.displayName && user.displayName.trim() !== '') return user.displayName;
    if (user.email) return user.email.split('@')[0].split('.')[0];
    return 'User';
  };

  // Helper to deduplicate users by email
  const dedupeUsersByEmail = (users) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Team Leader Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your team and delegate tasks to tutors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Remove hardcoded stats for performance metrics and team lists */}
          {/* {stats.map((stat, index) => (
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
          ))} */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
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
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                                {lead.priority}
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
                              onClick={() => setSelectedLead(lead)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {lead.status === 'assigned' && (
                              <>
                                <select
                                  onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign to tutor...</option>
                                  {dedupeUsersByEmail(users.filter(u => u.role === 'tutor')).length === 0 ? (
                                    <option disabled>No tutors available</option>
                                  ) : (
                                    dedupeUsersByEmail(users.filter(u => u.role === 'tutor')).map((user) => (
                                      <option key={user.uid} value={user.email}>
                                        {getUserDisplayName(user)} ({user.role})
                                      </option>
                                    ))
                                  )}
                                </select>
                                <button
                                  onClick={() => handleRevokeLead(lead.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors ml-2"
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                            {lead.status === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'resolved')}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                              >
                                Mark Resolved
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
          </div>

          {/* Team Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tutors</h3>
              <div className="space-y-3">
                {dedupeUsersByEmail(users.filter(u => u.role === 'tutor')).length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No tutors assigned to this team leader yet.</p>
                  </div>
                ) : (
                  dedupeUsersByEmail(users.filter(u => u.role === 'tutor')).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{getUserDisplayName(user)}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-gray-500">Available</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolution Rate</span>
                  <span className="font-semibold text-green-600">91%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-semibold text-blue-600">3.1 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Satisfaction</span>
                  <span className="font-semibold text-purple-600">4.6/5</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Assign Bulk Tasks</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">View Team Report</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ticket Number</label>
                  <p className="font-mono text-blue-600">{selectedLead.ticketNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Student</label>
                  <p>{selectedLead.studentName} ({selectedLead.studentEmail})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p>{selectedLead.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-600">{selectedLead.doubtDescription}</p>
                </div>
                <div className="flex space-x-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedLead.priority)}`}>
                      {selectedLead.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;