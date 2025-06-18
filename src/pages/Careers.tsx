import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  TrendingUp,
  Heart,
  Coffee,
  Zap,
  Shield,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

const Careers: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '$80,000 - $120,000',
      description: 'Join our engineering team to build scalable web applications using React, Node.js, and cloud technologies.',
      requirements: [
        'Strong experience with React and Node.js',
        'Experience with cloud platforms (AWS/GCP)',
        'Knowledge of database design and optimization',
        'Excellent problem-solving skills'
      ],
      benefits: ['Health Insurance', 'Remote Work', 'Stock Options', 'Learning Budget'],
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Hybrid',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '$70,000 - $100,000',
      description: 'Lead product strategy and work with cross-functional teams to deliver exceptional user experiences.',
      requirements: [
        'Experience in product management',
        'Strong analytical and communication skills',
        'Understanding of user research and data analysis',
        'Experience with agile methodologies'
      ],
      benefits: ['Health Insurance', 'Flexible Hours', 'Professional Development', 'Team Retreats'],
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Contract',
      experience: '2-3 years',
      salary: '$60,000 - $85,000',
      description: 'Create beautiful and intuitive user interfaces for our educational platform.',
      requirements: [
        'Proficiency in Figma and design systems',
        'Strong portfolio of web and mobile designs',
        'Understanding of user-centered design principles',
        'Experience with prototyping and user testing'
      ],
      benefits: ['Flexible Schedule', 'Creative Freedom', 'Latest Design Tools', 'Portfolio Projects'],
      posted: '3 days ago'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '3-6 years',
      salary: '$85,000 - $130,000',
      description: 'Build and maintain our cloud infrastructure, ensuring scalability and reliability.',
      requirements: [
        'Experience with AWS/GCP and containerization',
        'Knowledge of CI/CD pipelines and automation',
        'Strong scripting skills (Python, Bash)',
        'Experience with monitoring and logging tools'
      ],
      benefits: ['Health Insurance', 'Remote Work', 'Conference Budget', 'Certification Support'],
      posted: '5 days ago'
    },
    {
      id: 5,
      title: 'Content Marketing Manager',
      department: 'Marketing',
      location: 'Hybrid',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '$55,000 - $75,000',
      description: 'Develop and execute content strategies to engage our community of students and educators.',
      requirements: [
        'Strong writing and editing skills',
        'Experience with content management systems',
        'Knowledge of SEO and social media marketing',
        'Analytics and data-driven mindset'
      ],
      benefits: ['Health Insurance', 'Creative Projects', 'Marketing Tools', 'Growth Opportunities'],
      posted: '1 week ago'
    },
    {
      id: 6,
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      experience: '1-3 years',
      salary: '$50,000 - $70,000',
      description: 'Help our users succeed by providing exceptional support and building lasting relationships.',
      requirements: [
        'Excellent communication and interpersonal skills',
        'Experience in customer-facing roles',
        'Problem-solving and empathy',
        'Familiarity with CRM tools'
      ],
      benefits: ['Health Insurance', 'Remote Work', 'Customer Impact', 'Career Growth'],
      posted: '4 days ago'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance and wellness programs'
    },
    {
      icon: Coffee,
      title: 'Flexible Work',
      description: 'Remote-first culture with flexible working hours'
    },
    {
      icon: TrendingUp,
      title: 'Growth Opportunities',
      description: 'Continuous learning and career advancement paths'
    },
    {
      icon: Users,
      title: 'Great Team',
      description: 'Work with passionate and talented individuals'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Work on cutting-edge educational technology'
    },
    {
      icon: Shield,
      title: 'Job Security',
      description: 'Stable company with strong growth trajectory'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.department.toLowerCase() === filter.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize education technology. We're looking for passionate individuals 
            who want to make a difference in how people learn and grow.
          </p>
        </div>

        {/* Company Values */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Work at Doutly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="product">Product</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="customer success">Customer Success</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredJobs.length} open positions
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
                      {job.type}
                    </span>
                    <span className="text-sm text-gray-500">{job.posted}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{job.experience}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {job.requirements.slice(0, 2).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 lg:mt-0 lg:ml-6">
                  <button className="w-full lg:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <span>Apply Now</span>
                
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Don't See the Right Role?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals. Send us your resume and let us know 
            how you'd like to contribute to revolutionizing education.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Send Your Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Careers;