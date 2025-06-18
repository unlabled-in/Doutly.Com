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
  Edit,
  BarChart3
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

const SalesDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!userProfile?.email) return;

    // Fetch leads assigned to this sales person
    const leadsQuery = query(
      collection(db, 'leads'),
      where('assignedTo', '==', userProfile.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
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
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        lastContactDate: new Date(),
        updatedAt: new Date()
      });
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

  const stats = [
    {
      label: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+15%'
    },
    {
      label: 'Sales Closed',
      value: leads.filter(l => l.status === 'bought').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+22%'
    },
    {
      label: 'Revenue',
      value: `₹${leads.filter(l => l.status === 'bought').reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+18%'
    },
    {
      label: 'Conversion Rate',
      value: `${leads.length > 0 ? Math.round((leads.filter(l => l.status === 'bought').length / leads.length) * 100) : 0}%`,
      icon: Target,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: '+7%'
    }
  ];

  // Generate monthly data from real leads
  const monthlyData = leads.reduce((acc, lead) => {
    const month = new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.leads += 1;
      if (lead.status === 'bought') {
        existing.sales += lead.value || 0;
      }
    } else {
      acc.push({ 
        month, 
        leads: 1, 
        sales: lead.status === 'bought' ? (lead.value || 0) : 0 
      });
    }
    return acc;
  }, [] as { month: string; sales: number; leads: number }[]).slice(-6);

  const courseData = leads.reduce((acc, lead) => {
    if (lead.status === 'bought') {
      const existing = acc.find(item => item.course === lead.subject);
      if (existing) {
        existing.sales += 1;
        existing.revenue += lead.value || 0;
      } else {
        acc.push({ 
          course: lead.subject, 
          sales: 1, 
          revenue: lead.value || 0 
        });
      }
    }
    return acc;
  }, [] as { course: string; sales: number; revenue: number }[]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your sales performance and manage customer relationships
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
                  <h2 className="text-xl font-semibold text-gray-900">Sales Pipeline</h2>
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
                      <option value="interested">Interested</option>
                      <option value="demo_completed">Demo Completed</option>
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
            {/* Sales Target */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Target</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="font-semibold text-blue-600">₹3,00,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Achieved</span>
                  <span className="font-semibold text-green-600">₹{leads.filter(l => l.status === 'bought').reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((leads.filter(l => l.status === 'bought').reduce((sum, l) => sum + (l.value || 0), 0) / 300000) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">
                    {Math.min(Math.round((leads.filter(l => l.status === 'bought').reduce((sum, l) => sum + (l.value || 0), 0) / 300000) * 100), 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Courses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Courses</h3>
              <div className="space-y-3">
                {courseData.slice(0, 4).map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{course.course}</h4>
                      <p className="text-xs text-gray-600">{course.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">₹{course.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {courseData.length === 0 && (
                  <p className="text-sm text-gray-500">No sales data available</p>
                )}
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
                  <span>Send Proposal</span>
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === 'sales' ? `₹${value.toLocaleString()}` : value, name === 'sales' ? 'Revenue' : 'Leads']} />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="sales" />
                <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} name="leads" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? `₹${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Sales']} />
                <Bar dataKey="revenue" fill="#8b5cf6" name="revenue" />
              </BarChart>
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
                    <label className="text-sm font-medium text-gray-700">Course</label>
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

export default SalesDashboard;