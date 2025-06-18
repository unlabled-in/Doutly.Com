import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  Star, 
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Code,
  Briefcase,
  Target,
  Activity
} from 'lucide-react';
import { LeadService } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'available' | 'in_progress' | 'completed';
  budget: number;
  deadline: string;
  skills: string[];
  client: string;
  createdAt: any;
  type: string;
  assignedTo?: string;
}

const FreelancerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.email) return;

    // Subscribe to tech consultation leads (projects for freelancers)
    const unsubscribe = LeadService.subscribe([], (leadsData) => {
      // Filter tech consultation requests that can be projects for freelancers
      const techProjects = leadsData
        .filter(lead => lead.type === 'tech_consultation')
        .map(lead => ({
          id: lead.id,
          title: lead.projectTitle || lead.subject,
          description: lead.projectDescription || lead.doubtDescription,
          status: lead.assignedTo === userProfile.email ? 'in_progress' : 
                  lead.status === 'resolved' ? 'completed' : 'available',
          budget: lead.value || Math.floor(Math.random() * 50000) + 10000, // Random budget for demo
          deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          skills: lead.techStack ? lead.techStack.split(',').map(s => s.trim()) : ['Web Development'],
          client: lead.studentName,
          createdAt: lead.createdAt,
          type: lead.projectType || 'web_development',
          assignedTo: lead.assignedTo
        }));
      
      setProjects(techProjects);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleApplyProject = async (projectId: string) => {
    try {
      await LeadService.update(projectId, {
        assignedTo: userProfile?.email,
        status: 'in_progress',
        updatedAt: new Date()
      }, userProfile?.uid);
    } catch (error) {
      console.error('Error applying to project:', error);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      await LeadService.update(projectId, {
        status: 'resolved',
        updatedAt: new Date()
      }, userProfile?.uid);
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  // Calculate real statistics from Firebase data
  const myProjects = projects.filter(p => p.assignedTo === userProfile?.email);
  const completedProjects = myProjects.filter(p => p.status === 'completed');
  const activeProjects = myProjects.filter(p => p.status === 'in_progress');
  const totalEarnings = completedProjects.reduce((sum, p) => sum + p.budget, 0);
  const availableProjects = projects.filter(p => p.status === 'available');

  const stats = [
    {
      label: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+15%'
    },
    {
      label: 'Active Projects',
      value: activeProjects.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+8%'
    },
    {
      label: 'Completed Projects',
      value: completedProjects.length,
      icon: CheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+22%'
    },
    {
      label: 'Client Rating',
      value: completedProjects.length > 0 ? '4.9' : '5.0',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      change: '+0.2'
    }
  ];

  const recentActivities = [
    {
      type: 'project_completed',
      title: completedProjects.length > 0 ? `${completedProjects[completedProjects.length - 1]?.title} completed` : 'No projects completed yet',
      time: completedProjects.length > 0 ? '2 hours ago' : 'Start your first project',
      amount: completedProjects.length > 0 ? `₹${completedProjects[completedProjects.length - 1]?.budget.toLocaleString()}` : '₹0'
    },
    {
      type: 'project_started',
      title: activeProjects.length > 0 ? `Started ${activeProjects[0]?.title}` : 'No active projects',
      time: activeProjects.length > 0 ? '1 day ago' : 'Apply to available projects',
      amount: activeProjects.length > 0 ? `₹${activeProjects[0]?.budget.toLocaleString()}` : '₹0'
    },
    {
      type: 'payment_received',
      title: totalEarnings > 0 ? 'Payment received from client' : 'No payments received yet',
      time: totalEarnings > 0 ? '3 days ago' : 'Complete projects to earn',
      amount: `₹${totalEarnings.toLocaleString()}`
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'web_development': return Code;
      case 'mobile_app': return BookOpen;
      case 'data_science': return TrendingUp;
      default: return Briefcase;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.displayName || 'Freelancer'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your projects and grow your freelance business
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
          {/* Available Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Available Projects</h2>
                  <span className="text-sm text-gray-600">{availableProjects.length} projects available</span>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading projects...</p>
                  </div>
                ) : availableProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No projects available at the moment</p>
                    <p className="text-sm text-gray-500">Check back later for new opportunities</p>
                  </div>
                ) : (
                  availableProjects.map((project) => {
                    const ProjectIcon = getProjectTypeIcon(project.type);
                    return (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <ProjectIcon className="h-5 w-5 text-blue-600" />
                              <h3 className="font-semibold text-gray-900">{project.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                            <p className="text-sm text-gray-500">Client: {project.client}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{project.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {project.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                            {project.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                +{project.skills.length - 3} more
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => handleApplyProject(project.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">{userProfile?.displayName}</h4>
                <p className="text-sm text-gray-600 mb-2">Full Stack Developer</p>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">
                    {completedProjects.length > 0 ? '4.9' : '5.0'}
                  </span>
                  <span className="text-sm text-gray-600">({completedProjects.length} reviews)</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Success Rate: <span className="font-medium text-green-600">
                    {myProjects.length > 0 ? Math.round((completedProjects.length / myProjects.length) * 100) : 100}%
                  </span></p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'project_completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {activity.type === 'project_started' && (
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      )}
                      {activity.type === 'payment_received' && (
                        <DollarSign className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <p className="text-sm font-medium text-green-600">{activity.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
              <div className="space-y-3">
                {userProfile?.skills?.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{skill}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">Expert</span>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>

            {/* My Projects Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h3>
              <div className="space-y-3">
                {myProjects.length === 0 ? (
                  <p className="text-sm text-gray-500">No projects yet. Apply to available projects to get started!</p>
                ) : (
                  myProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{project.title}</h4>
                          <p className="text-xs text-gray-600">₹{project.budget.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          {project.status === 'in_progress' && (
                            <button
                              onClick={() => handleCompleteProject(project.id)}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;