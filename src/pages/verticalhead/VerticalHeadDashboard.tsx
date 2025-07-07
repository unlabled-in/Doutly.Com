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
  BarChart3
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';

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

const VerticalHeadDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Remove mock managers and teamLeaders arrays
  // const managers = [
  //   { name: 'Sarah Johnson', email: 'sarah.manager@doutly.com' },
  //   { name: 'Mike Chen', email: 'mike.manager@doutly.com' },
  //   { name: 'Lisa Wang', email: 'lisa.manager@doutly.com' },
  // ];

  // const teamLeaders = [
  //   { name: 'David Brown', email: 'david.tl@doutly.com' },
  //   { name: 'Emma Wilson', email: 'emma.tl@doutly.com' },
  //   { name: 'Alex Rodriguez', email: 'alex.tl@doutly.com' },
  // ];

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      // Filter leads assigned to this vertical head or available for assignment
      const vhLeads = leadsData.filter(lead => 
        lead.assignedTo === userProfile?.email || 
        (lead.status === 'assigned' && lead.assignedBy === 'Admin')
      );
      
      setLeads(vhLeads);
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

  const handleAssignLead = async (leadId: string, assignTo: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        assignedTo: assignTo,
        assignedBy: userProfile?.displayName,
        status: 'assigned',
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error assigning lead:', error);
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
  //     label: 'Total Leads',
  //     value: leads.length,
  //     icon: Users,
  //     color: 'text-blue-600',
  //     bg: 'bg-blue-100'
  //   },
  //   {
  //     label: 'Pending Assignment',
  //     value: leads.filter(l => l.status === 'assigned' && l.assignedBy === 'Admin').length,
  //     icon: AlertCircle,
  //     color: 'text-orange-600',
  //     bg: 'bg-orange-100'
  //   },
  //   {
  //     label: 'In Progress',
  //     value: leads.filter(l => l.status === 'in_progress').length,
  //     icon: Clock,
  //     color: 'text-yellow-600',
  //     bg: 'bg-yellow-100'
  //   },
  //   {
  //     label: 'Resolved',
  //     value: leads.filter(l => l.status === 'resolved').length,
  //     icon: CheckCircle,
  //     color: 'text-green-600',
  //     bg: 'bg-green-100'
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Vertical Head Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage lead distribution and oversee team performance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Remove all references to managers, teamLeaders, and hardcoded stats in the render */}
          {/* The stats grid is now empty as per the edit hint */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Lead Distribution</h2>
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
                            {(lead.status === 'assigned' && lead.assignedBy === 'Admin') && (
                              <select
                                onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                                defaultValue=""
                              >
                                <option value="" disabled>Assign to...</option>
                                {/* Remove mock managers and teamLeaders arrays */}
                                {/* The options for assignment are now empty as per the edit hint */}
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

          {/* Team Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Managers</h4>
                  {/* Remove mock managers and teamLeaders arrays */}
                  {/* The managers section is now empty as per the edit hint */}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Team Leaders</h4>
                  {/* Remove mock managers and teamLeaders arrays */}
                  {/* The team leaders section is now empty as per the edit hint */}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Efficiency</span>
                  <span className="font-semibold text-green-600">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Assignment Time</span>
                  <span className="font-semibold text-blue-600">1.2 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolution Rate</span>
                  <span className="font-semibold text-purple-600">92%</span>
                </div>
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

export default VerticalHeadDashboard;