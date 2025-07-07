import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Code, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Star,
  Clock,
  Target,
  Lightbulb,
  Award,
  TrendingUp
} from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: BookOpen,
      title: 'Schedule a Tutor',
      description: 'Get instant help or schedule personalized tutoring sessions with expert educators.',
      features: [
        'Instant doubt resolution',
        '24/7 tutor availability',
        'Subject matter experts',
        'Flexible scheduling'
      ],
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      link: '/schedule-tutor'
    },
    {
      icon: Code,
      title: 'Tech Box',
      description: 'Access comprehensive project guidance and technical mentorship for your ideas.',
      features: [
        'Project development guidance',
        'Code review and optimization',
        'Technology stack consultation',
        'Career mentorship'
      ],
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      link: '/tech-box'
    },
    {
      icon: Calendar,
      title: 'Events Portal',
      description: 'Join workshops, hackathons, and educational events from top institutions.',
      features: [
        'Industry workshops',
        'Hackathon competitions',
        'Networking events',
        'Skill development sessions'
      ],
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      link: '/events'
    },
    {
      icon: Users,
      title: 'Become a Tutor',
      description: 'Transform your expertise into income by joining our community of educators.',
      features: [
        'Flexible working hours',
        'Competitive compensation',
        'Professional development',
        'Global student reach'
      ],
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      link: '/become-tutor'
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'Tailored educational experiences designed for individual learning styles and goals.'
    },
    {
      icon: Lightbulb,
      title: 'Expert Guidance',
      description: 'Learn from industry professionals and experienced educators with proven track records.'
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'All our tutors and content are rigorously vetted to ensure the highest educational standards.'
    },
    {
      icon: TrendingUp,
      title: 'Measurable Progress',
      description: 'Track your learning journey with detailed analytics and progress reports.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      content: 'The tutoring sessions helped me understand complex algorithms. The personalized approach made all the difference.',
      rating: 5,
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Freelance Developer',
      content: 'Tech Box provided invaluable guidance for my startup project. The mentorship was exactly what I needed.',
      rating: 5,
      image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Emily Watson',
      role: 'Data Science Student',
      content: 'The events and workshops expanded my network and skills significantly. Highly recommend to all students.',
      rating: 5,
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="text-blue-600">Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive educational solutions designed to accelerate your learning journey 
            and professional growth through expert guidance and innovative technology.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={index} className={`${service.color} border-2 rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-start space-x-6">
                <div className={`p-4 bg-white rounded-xl shadow-sm`}>
                  <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link 
                    to={service.link}
                    className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Doutly?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional educational experiences that drive real results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from students and professionals who've transformed their learning with Doutly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.image} 
                    alt={`Testimonial from ${testimonial.name}`}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                    width="40"
                    height="40"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of learners who are already accelerating their growth with Doutly's comprehensive services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Started Today
            </Link>
            <Link 
              to="/schedule-tutor"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Schedule a Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;