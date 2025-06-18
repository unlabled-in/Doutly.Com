import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  IndianRupee,
  Target,
  Award,
  Phone,
  Mail,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit
} from 'lucide-react';
import { LeadService } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Lead {
  id: string;
  ticketNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  subject: string;
  status: 'new' | 'contacted' | 'interested' | 'demo_scheduled' | 'demo_completed' | 'negotiation' | 'bought' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: string;
  value: number;
  createdAt: any;
  assignedTo?: string;
  lastContactDate?: any;
  nextFollowUp?: any;
  notes: string[];
  conversionProbability: number;
}

const BDADashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!userProfile?.email) return;

    // Subscribe to leads assigned to this BDA
    const unsubscribe = LeadService.getByAssignedTo(userProfile.email, (leadsData) => {
      setLeads(leadsData);
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
        lead.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  }, [leads, filter, searchTerm]);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      await LeadService.update(leadId, {
        status: newStatus,
        lastContactDate: new Date(),
        updatedAt: new Date()
      }, userProfile?.uid);
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-purple-100 text-purple-800';
      case 'demo_scheduled': return 'bg-orange-100 text-orange-800';
      case 'demo_completed': return 'bg-indigo-100 text-indigo-800';
      case 'negotiation': return 'bg-pink-100 text-pink-800';
      case 'bought': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
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
  const conversions = leads.filter(l => l.status === 'bought').length;
  const totalRevenue = leads.filter(l => l.status === 'bought').reduce((sum, l) => sum + (l.value || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((conversions / totalLeads) * 100) : 0;

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
      label: 'Conversions',
      value: conversions,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+8%'
    },
    {
      label: 'Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+15%'
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: Target,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: '+5%'
    }
  ];

  // Generate charts data from real leads
  const conversionData = [
    { stage: 'New', count: leads.filter(l => l.status === 'new').length },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { stage: 'Interested', count: leads.filter(l => l.status === 'interested').length },
    { stage: 'Demo', count: leads.filter(l => ['demo_scheduled', 'demo_completed'].includes(l.status)).length },
    { stage: 'Negotiation', count: leads.filter(l => l.status === 'negotiation').length },
    { stage: 'Bought', count: leads.filter(l => l.status === 'bought').length }
  ];

  const sourceData = [
    { name: 'Website', value: leads.filter(l => l.source === 'Website').length, color: '#3b82f6' },
    { name: 'Referral', value: leads.filter(l => l.source === 'Referral').length, color: '#10b981' },
    { name: 'Social Media', value: leads.filter(l => l.source === 'Social Media').length, color: '#f59e0b' },
    { name: 'Others', value: leads.filter(l => !['Website', 'Referral', 'Social Media'].includes(l.source)).length, color: '#8b5cf6' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">BDA Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your leads and track your sales performance
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Leads</h2>
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
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="bought">Bought</option>
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
                            <h3 className="font-semibold text-gray-900 mb-1">{lead.studentName}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {lead.subject} • ₹{(lead.value || 0).toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>📧 {lead.studentEmail}</span>
                              {lead.studentPhone && <span>📞 {lead.studentPhone}</span>}
                              <span>🎯 {lead.conversionProbability || 0}% likely</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="interested">Interested</option>
                              <option value="demo_scheduled">Demo Scheduled</option>
                              <option value="demo_completed">Demo Completed</option>
                              <option value="negotiation">Negotiation</option>
                              <option value="bought">Bought</option>
                              <option value="lost">Lost</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month Target</span>
                  <span className="font-semibold text-blue-600">₹2,00,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Achieved</span>
                  <span className="font-semibold text-green-600">₹{totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((totalRevenue / 200000) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {Math.min(Math.round((totalRevenue / 200000) * 100), 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Make Call</span>
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Demo</span>
                </button>
              </div>
            </div>

            {/* Today's Follow-ups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Follow-ups</h3>
              <div className="space-y-3">
                {leads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp?.toDate?.() || l.nextFollowUp).toDateString() === new Date().toDateString()).map((lead) => (
                  <div key={lead.id} className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 text-sm">{lead.studentName}</h4>
                    <p className="text-xs text-gray-600">{lead.subject}</p>
                    <p className="text-xs text-yellow-600 mt-1">Follow-up due</p>
                  </div>
                ))}
                {leads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp?.toDate?.() || l.nextFollowUp).toDateString() === new Date().toDateString()).length === 0 && (
                  <p className="text-sm text-gray-500">No follow-ups scheduled for today</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Student Name</label>
                    <p className="text-gray-900">{selectedLead.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedLead.studentEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedLead.studentPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-gray-900">{selectedLead.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Value</label>
                    <p className="text-gray-900">₹{(selectedLead.value || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Source</label>
                    <p className="text-gray-900">{selectedLead.source}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)} ml-2`}>
                    {selectedLead.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <div className="mt-1">
                    {selectedLead.notes && selectedLead.notes.length > 0 ? (
                      selectedLead.notes.map((note, index) => (
                        <p key={index} className="text-gray-600 text-sm">• {note}</p>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No notes available</p>
                    )}
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

export default BDADashboard;