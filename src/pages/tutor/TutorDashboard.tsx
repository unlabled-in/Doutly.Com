import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Clock, 
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, updateDoc, doc } from 'firebase/firestore';
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

const TutorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.email) return;

    const q = query(
      collection(db, 'leads'),
      where('assignedTo', '==', userProfile.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      setAssignedLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
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
      label: 'Assigned Tasks',
      value: assignedLeads.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'In Progress',
      value: assignedLeads.filter(l => l.status === 'in_progress').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      label: 'Completed',
      value: assignedLeads.filter(l => l.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Rating',
      value: '4.9',
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Manage your assigned tasks and sessions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Assigned Tasks</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading tasks...</p>
                  </div>
                ) : assignedLeads.length === 0 ? (
                  <div className="p-6 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tasks assigned yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {assignedLeads.map((lead) => (
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
                              Student: {lead.studentName} • {lead.studentEmail}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {lead.doubtDescription}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {lead.status === 'assigned' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'in_progress')}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                Start Work
                              </button>
                            )}
                            {lead.status === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateStatus(lead.id, 'resolved')}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                              >
                                Mark Complete
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Summary</h2>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{userProfile?.displayName}</h3>
                <p className="text-sm text-gray-600 mb-2">Subject Expert</p>
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">4.9</span>
                  <span className="text-sm text-gray-600">({assignedLeads.filter(l => l.status === 'resolved').length} reviews)</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-green-600">
                    {assignedLeads.length > 0 ? Math.round((assignedLeads.filter(l => l.status === 'resolved').length / assignedLeads.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-semibold text-blue-600">2.3 hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Student Satisfaction</span>
                  <span className="font-semibold text-purple-600">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Schedule New Session
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  View All Students
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Update Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;