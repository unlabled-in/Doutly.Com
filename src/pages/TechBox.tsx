import React, { useState } from 'react';
import { 
  Code, 
  Lightbulb, 
  Users, 
  Rocket, 
  Send, 
  CheckCircle,
  Star,
  Award,
  Target,
  Zap,
  BookOpen,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { LeadService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { sanitizeInput } from '../lib/validation';

const TechBox: React.FC = () => {
  const { userProfile } = useAuth();
  const { error, setError, clearError, handleAsyncError } = useErrorHandler();
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    techStack: '',
    projectType: 'web_development',
    timeline: '',
    budget: '',
    experience: '',
    specificHelp: '',
    urgencyLevel: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const projectTypes = [
    { value: 'web_development', label: 'Web Development' },
    { value: 'mobile_app', label: 'Mobile App Development' },
    { value: 'data_science', label: 'Data Science & Analytics' },
    { value: 'machine_learning', label: 'Machine Learning & AI' },
    { value: 'blockchain', label: 'Blockchain Development' },
    { value: 'game_development', label: 'Game Development' },
    { value: 'desktop_app', label: 'Desktop Application' },
    { value: 'api_development', label: 'API Development' },
    { value: 'devops', label: 'DevOps & Cloud' },
    { value: 'other', label: 'Other' }
  ];

  const services = [
    {
      icon: Code,
      title: 'Code Review & Optimization',
      description: 'Get your code reviewed by experts and learn best practices for optimization.',
      features: ['Performance optimization', 'Security audit', 'Code quality improvement', 'Best practices guidance']
    },
    {
      icon: Lightbulb,
      title: 'Project Consultation',
      description: 'Get strategic guidance on your project architecture and technology choices.',
      features: ['Technology stack selection', 'Architecture planning', 'Scalability advice', 'Cost optimization']
    },
    {
      icon: Rocket,
      title: 'MVP Development',
      description: 'Build your minimum viable product with expert guidance and mentorship.',
      features: ['Rapid prototyping', 'Feature prioritization', 'Development roadmap', 'Launch strategy']
    },
    {
      icon: Users,
      title: 'Team Mentorship',
      description: 'Get ongoing mentorship for your development team and project management.',
      features: ['Team training', 'Process improvement', 'Technical leadership', 'Career guidance']
    }
  ];

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TECH-${timestamp}-${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const validateForm = (): boolean => {
    if (!formData.projectTitle.trim()) {
      setError('Please enter a project title');
      return false;
    }
    if (!formData.projectDescription.trim()) {
      setError('Please describe your project');
      return false;
    }
    if (formData.projectDescription.trim().length < 50) {
      setError('Project description must be at least 50 characters long');
      return false;
    }
    if (!formData.specificHelp.trim()) {
      setError('Please specify what help you need');
      return false;
    }
    if (formData.specificHelp.trim().length < 20) {
      setError('Specific help description must be at least 20 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      setError('Please sign in to submit a tech consultation request');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await handleAsyncError(async () => {
      const newTicketNumber = generateTicketNumber();
      
      const techRequestData = {
        ticketNumber: newTicketNumber,
        type: 'tech_consultation' as const,
        studentId: userProfile.uid,
        studentName: userProfile.displayName,
        studentEmail: userProfile.email,
        studentPhone: userProfile.phone || '',
        doubtDescription: `${formData.projectTitle} - ${formData.specificHelp}`,
        subject: `Tech Consultation - ${formData.projectType.replace('_', ' ')}`,
        projectTitle: sanitizeInput(formData.projectTitle),
        projectDescription: sanitizeInput(formData.projectDescription),
        techStack: sanitizeInput(formData.techStack),
        projectType: formData.projectType,
        timeline: formData.timeline,
        budget: formData.budget,
        experience: formData.experience,
        specificHelp: sanitizeInput(formData.specificHelp),
        urgencyLevel: formData.urgencyLevel as 'low' | 'medium' | 'high' | 'urgent',
        status: 'open' as const,
        priority: (formData.urgencyLevel === 'urgent' ? 'high' : 
                  formData.urgencyLevel === 'high' ? 'medium' : 'low') as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: null,
        assignedBy: null,
        notes: [],
        source: 'Tech Box',
        value: 0,
        conversionProbability: 70,
        history: [{
          action: 'created',
          timestamp: new Date(),
          by: userProfile.displayName,
          note: 'Tech consultation request created'
        }]
      };

      await LeadService.create(techRequestData, userProfile.uid);
      return newTicketNumber;
    }, 'Failed to submit tech consultation request. Please try again.');

    if (result) {
      setTicketNumber(result);
      setSuccess(true);
      
      setFormData({
        projectTitle: '',
        projectDescription: '',
        techStack: '',
        projectType: 'web_development',
        timeline: '',
        budget: '',
        experience: '',
        specificHelp: '',
        urgencyLevel: 'medium'
      });

      setTimeout(() => setSuccess(false), 5000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <Code className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Tech Box</h1>
            <p className="text-xl text-gray-600 mt-2 max-w-3xl mx-auto">
              Get expert technical guidance for your projects. From code reviews to architecture planning, 
              our tech experts are here to help you build better software.
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Tech consultation request submitted successfully!</span>
            </div>
            <p className="mt-1 text-sm">
              Your ticket number is: <span className="font-bold">{ticketNumber}</span>
            </p>
            <p className="mt-1 text-sm">Our tech experts will review your request and get back to you within 24 hours.</p>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Tech Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <service.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Tech Consultation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="projectTitle" className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="projectTitle"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter your project title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="projectType" className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Type *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  >
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Description * (minimum 50 characters)
                  </label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-colors"
                    placeholder="Describe your project, its goals, and current status in detail..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.projectDescription.length}/50 characters minimum
                  </p>
                </div>

                <div>
                  <label htmlFor="techStack" className="block text-sm font-semibold text-gray-900 mb-2">
                    Technology Stack
                  </label>
                  <input
                    type="text"
                    id="techStack"
                    name="techStack"
                    value={formData.techStack}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="e.g., React, Node.js, MongoDB, Python, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-semibold text-gray-900 mb-2">
                      Project Timeline
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select timeline</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="2-3 months">2-3 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="ongoing">Ongoing project</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="budget" className="block text-sm font-semibold text-gray-900 mb-2">
                      Budget Range (₹)
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Select budget</option>
                      <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                      <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                      <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                      <option value="₹1,00,000+">₹1,00,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-semibold text-gray-900 mb-2">
                    Your Experience Level
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner (0-1 years)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3+ years)</option>
                    <option value="expert">Expert (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="specificHelp" className="block text-sm font-semibold text-gray-900 mb-2">
                    What specific help do you need? * (minimum 20 characters)
                  </label>
                  <textarea
                    id="specificHelp"
                    name="specificHelp"
                    value={formData.specificHelp}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-colors"
                    placeholder="Describe the specific areas where you need guidance..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.specificHelp.length}/20 characters minimum
                  </p>
                </div>

                <div>
                  <label htmlFor="urgencyLevel" className="block text-sm font-semibold text-gray-900 mb-2">
                    Urgency Level
                  </label>
                  <select
                    id="urgencyLevel"
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="low">Low - Can wait a week</option>
                    <option value="medium">Medium - Need help within 2-3 days</option>
                    <option value="high">High - Need help within 24 hours</option>
                    <option value="urgent">Urgent - Need help immediately</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Submitting Request..." />
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Submit Tech Consultation Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rahul Sharma',
                project: 'E-commerce Platform',
                result: 'Launched successfully with 10K+ users',
                image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150'
              },
              {
                name: 'Priya Patel',
                project: 'Mobile Banking App',
                result: 'Secured ₹50L funding from investors',
                image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150'
              },
              {
                name: 'Arjun Kumar',
                project: 'AI Chatbot Platform',
                result: 'Acquired by major tech company',
                image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150'
              }
            ].map((story, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={story.image} 
                    alt={`Success story: ${story.name} - ${story.project}`}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                    width="48"
                    height="48"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.project}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-green-600 font-medium text-sm">{story.result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechBox;