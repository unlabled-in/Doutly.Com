import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  Calendar, 
  User, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Award,
  Star,
  ArrowRight,
  Bell,
  MessageCircle,
  Play,
  Zap,
  Trophy,
  Activity
} from 'lucide-react';
import { LeadService, EventRegistrationService } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';
import AiTutorFloatingButton from '../../components/AiTutorFloatingButton';
import { validateAndSanitizeLead } from '../../lib/validation';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Lead {
  id: string;
  ticketNumber: string;
  studentId: string;
  subject: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  createdAt: any;
  assignedTo?: string;
  doubtDescription?: string;
  type: string;
  urgencyLevel: string;
}

interface EventRegistration {
  id: string;
  eventTitle: string;
  eventType: string;
  registrationDate: any;
  status: 'pending' | 'approved' | 'rejected';
}

const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.uid) return;

    // Subscribe to user's leads using the fixed service
    const unsubscribeLeads = LeadService.getByStudentId(userProfile.uid, (leadsData) => {
      setMyLeads(leadsData);
      setLoading(false);
    });

    // Subscribe to user's event registrations using the fixed service
    const unsubscribeRegistrations = EventRegistrationService.getByEmail(userProfile.email, (registrationsData) => {
      setMyRegistrations(registrationsData);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeRegistrations();
    };
  }, [userProfile]);

  // Handler for AI Tutor lead creation
  const handleAiTutorLead = async (question: string, aiAnswer: string) => {
    if (!userProfile) return;
    setLeadLoading(true);
    setLeadSuccess(null);
    setLeadError(null);
    try {
      // Generate a ticket number (simple random for now)
      const ticketNumber = 'AI-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      const leadData = {
        ticketNumber,
        type: 'tutor_request',
        studentId: userProfile.uid,
        studentName: userProfile.displayName,
        studentEmail: userProfile.email,
        studentPhone: userProfile.phone || '',
        doubtDescription: aiAnswer, // Save the AI-generated answer as the description
        subject: question.slice(0, 50) || 'AI Tutor Doubt',
        tutorType: 'instant',
        urgencyLevel: 'medium',
        status: 'open',
        priority: 'medium',
        createdAt: now,
        updatedAt: now,
        notes: [],
        source: 'AI Tutor',
        value: 0,
        conversionProbability: 50,
        history: [{ action: 'created', timestamp: now, by: userProfile.uid, note: 'Lead created from AI Tutor' }]
      };
      const validLead = validateAndSanitizeLead(leadData);
      await LeadService.create(validLead, userProfile.uid);
      setLeadSuccess('Your request has been submitted! A tutor will contact you soon.');
    } catch (err: any) {
      setLeadError('Failed to create lead. Please try again.');
      console.error(err);
    } finally {
      setLeadLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Schedule a Tutor',
      description: 'Get instant help or book a session',
      icon: BookOpen,
      href: '/schedule-tutor',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Tech Box',
      description: 'Access project guidance',
      icon: Code,
      href: '/tech-box',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Browse Events',
      description: 'Join workshops & hackathons',
      icon: Calendar,
      href: '/events',
      gradient: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Become a Tutor',
      description: 'Share your knowledge',
      icon: Users,
      href: '/become-tutor',
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  // Calculate real stats from actual data
  const completedSessions = myLeads.filter(l => l.status === 'resolved').length;
  const activeSessions = myLeads.filter(l => ['open', 'assigned', 'in_progress'].includes(l.status)).length;
  const totalSessions = myLeads.length;
  const learningScore = totalSessions > 0 ? (4.0 + (completedSessions / totalSessions) * 1.0).toFixed(1) : '4.0';

  const stats = [
    {
      label: 'Sessions Completed',
      value: completedSessions,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+12%',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Active Requests',
      value: activeSessions,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+5%',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Events Registered',
      value: myRegistrations.length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+8%',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Learning Score',
      value: learningScore,
      icon: Star,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: '+0.2',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentActivities = [
    {
      type: 'session_completed',
      title: `${completedSessions > 0 ? 'Latest session completed' : 'No sessions completed yet'}`,
      time: completedSessions > 0 ? '2 hours ago' : 'Start your first session',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      type: 'event_registered',
      title: `${myRegistrations.length > 0 ? 'Event registration submitted' : 'No events registered'}`,
      time: myRegistrations.length > 0 ? '1 day ago' : 'Browse available events',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      type: 'tutor_assigned',
      title: `${activeSessions > 0 ? 'Tutor assigned for active request' : 'No active requests'}`,
      time: activeSessions > 0 ? '2 days ago' : 'Schedule your first session',
      icon: Users,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Place the floating button at the root so it's always accessible */}
        <AiTutorFloatingButton onLeadCreated={handleAiTutorLead} />
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userProfile?.displayName?.split(' ')[0] || 'Student'}!</span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Continue your learning journey with Doutly ✨
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalSessions}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{completedSessions}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" 
                   style={{background: `linear-gradient(135deg, ${stat.gradient.split(' ')[1]}, ${stat.gradient.split(' ')[3]})`}}></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">{stat.change} this month</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" 
                       style={{background: `linear-gradient(135deg, ${action.gradient.split(' ')[1]}, ${action.gradient.split(' ')[3]})`}}></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-start space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.gradient} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* My Requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    My Requests
                  </h2>
                  <Link to="/schedule-tutor" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading requests...</p>
                  </div>
                ) : myLeads.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey by scheduling your first session</p>
                    <Link 
                      to="/schedule-tutor"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Schedule Your First Session
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {myLeads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                {lead.ticketNumber}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                {lead.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{lead.subject}</h3>
                            <p className="text-sm text-gray-600">
                              Created {new Date(lead.createdAt?.toDate?.() || lead.createdAt).toLocaleDateString()}
                            </p>
                            {lead.assignedTo && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                Assigned to: {lead.assignedTo}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {lead.status === 'resolved' && (
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            )}
                            {lead.status === 'in_progress' && (
                              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Summary</h3>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{userProfile?.displayName}</h4>
                <p className="text-sm text-gray-600 mb-2">{userProfile?.role === 'student' ? 'Student' : 'Freelancer'}</p>
                {userProfile?.institution && (
                  <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full inline-block">{userProfile.institution}</p>
                )}
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{completedSessions}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{learningScore}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 text-green-600 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Registrations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                My Events
              </h3>
              {myRegistrations.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">No events registered</p>
                  <Link 
                    to="/events"
                    className="inline-flex items-center text-blue-600 text-sm hover:text-blue-700 font-medium"
                  >
                    Browse Events
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRegistrations.slice(0, 3).map((registration) => (
                    <div key={registration.id} className="p-3 bg-purple-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 text-sm">{registration.eventTitle}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">{registration.eventType}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                          {registration.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link 
                    to="/events"
                    className="block text-center text-blue-600 text-sm hover:text-blue-700 font-medium mt-3"
                  >
                    View All Events
                  </Link>
                </div>
              )}
            </div>

            {/* Learning Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                Learning Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-bold text-gray-900">
                      {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <div className="text-lg font-bold text-purple-600">{totalSessions}</div>
                    <div className="text-xs text-gray-600">Total Sessions</div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <div className="text-lg font-bold text-orange-600">{completedSessions * 2}</div>
                    <div className="text-xs text-gray-600">Hours Learned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;