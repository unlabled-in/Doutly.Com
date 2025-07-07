import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Lightbulb, 
  Calendar,
  CheckCircle,
  Star,
  GraduationCap,
  Code,
  UserCheck,
  Building,
  TrendingUp,
  Globe,
  Briefcase,
  Award,
  Target,
  Zap,
  Heart,
  Coffee,
  Shield,
  Rocket,
  Brain,
  Compass,
  Sparkles,
  Play,
  ChevronRight,
  MessageCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Schedule a Tutor',
      description: 'Get instant help or schedule sessions with expert tutors for your academic doubts.',
      color: 'from-blue-500 to-cyan-500',
      stats: '10K+ Sessions'
    },
    {
      icon: Code,
      title: 'Tech Box',
      description: 'Access project guidance, custom solutions, and technical mentorship for your ideas.',
      color: 'from-green-500 to-emerald-500',
      stats: '500+ Projects'
    },
    {
      icon: Calendar,
      title: 'Events Portal',
      description: 'Join workshops, hackathons, and educational events from top institutions.',
      color: 'from-purple-500 to-violet-500',
      stats: '100+ Events'
    },
    {
      icon: UserCheck,
      title: 'Turn to Tutor',
      description: 'Transform your expertise into income by becoming a tutor on our platform.',
      color: 'from-orange-500 to-red-500',
      stats: '1K+ Tutors'
    }
  ];

  const userTypes = [
    {
      icon: GraduationCap,
      title: 'Students',
      subtitle: 'Learn & Grow',
      description: 'Get expert guidance, solve doubts instantly, and access quality educational resources.',
      benefits: ['Instant doubt resolution', '24/7 tutor availability', 'Project guidance', 'Skill development'],
      gradient: 'from-blue-600 to-purple-600',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Users,
      title: 'Freelancers',
      subtitle: 'Work Smart, Earn More',
      description: 'Leverage your skills to help students while building a sustainable income stream.',
      benefits: ['Flexible working hours', 'Multiple income streams', 'Skill monetization', 'Professional growth'],
      gradient: 'from-green-600 to-teal-600',
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Building,
      title: 'Institutions',
      subtitle: 'Scale & Connect',
      description: 'Partner with us to extend your educational reach and impact more students.',
      benefits: ['Expanded reach', 'Event hosting', 'Student engagement', 'Brand visibility'],
      gradient: 'from-purple-600 to-pink-600',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  const events = [
    {
      title: 'Web Development Bootcamp',
      date: 'Dec 15, 2024',
      time: '10:00 AM',
      type: 'Workshop',
      institution: 'Tech University',
      attendees: 150,
      price: 'Free',
      image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'AI/ML Hackathon',
      date: 'Dec 20, 2024',
      time: '9:00 AM',
      type: 'Competition',
      institution: 'Innovation Hub',
      attendees: 300,
      price: '₹500',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'Career Fair 2024',
      date: 'Dec 25, 2024',
      time: '11:00 AM',
      type: 'Networking',
      institution: 'Multiple Partners',
      attendees: 500,
      price: 'Free',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const stats = [
    { label: 'Students Served', value: '1M+', icon: Users },
    { label: 'Expert Tutors', value: '10K+', icon: Award },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
    { label: 'Cities Covered', value: '100+', icon: Globe }
  ];

  return (
    <>
      <Helmet>
        <title>Doutly - Instant Doubt Solving, Tutoring, Events & Careers</title>
        <meta name="description" content="Doutly connects students, tutors, and institutions for instant doubt solving, project guidance, events, and career opportunities. Learn, teach, and grow with Doutly." />
        <link rel="canonical" href="https://doutly.com/" />
        <meta property="og:title" content="Doutly - Instant Doubt Solving, Tutoring, Events & Careers" />
        <meta property="og:description" content="Doutly connects students, tutors, and institutions for instant doubt solving, project guidance, events, and career opportunities." />
        <meta property="og:url" content="https://doutly.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Doutly - Instant Doubt Solving, Tutoring, Events & Careers" />
        <meta name="twitter:description" content="Doutly connects students, tutors, and institutions for instant doubt solving, project guidance, events, and career opportunities." />
        <meta name="twitter:image" content="/favicon.ico" />
      </Helmet>
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Hero Section with Enhanced Animations */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-32 overflow-hidden">
          {/* Enhanced Floating SVG Animations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Primary floating elements */}
            <div className="absolute top-20 left-10 animate-bounce">
              <GraduationCap className="h-8 w-8 text-blue-300 opacity-60" />
            </div>
            <div className="absolute top-32 right-20 animate-pulse">
              <Code className="h-6 w-6 text-green-300 opacity-60" />
            </div>
            <div className="absolute bottom-32 left-20 animate-bounce delay-300">
              <BookOpen className="h-7 w-7 text-purple-300 opacity-60" />
            </div>
            <div className="absolute top-40 left-1/2 animate-pulse delay-500">
              <Lightbulb className="h-5 w-5 text-yellow-300 opacity-60" />
            </div>
            <div className="absolute bottom-40 right-10 animate-bounce delay-700">
              <Users className="h-6 w-6 text-indigo-300 opacity-60" />
            </div>
            <div className="absolute top-60 right-1/3 animate-pulse delay-1000">
              <Target className="h-4 w-4 text-pink-300 opacity-60" />
            </div>
            
            {/* Additional floating elements */}
            <div className="absolute top-16 left-1/4 animate-bounce delay-1200">
              <Rocket className="h-5 w-5 text-red-300 opacity-50" />
            </div>
            <div className="absolute bottom-16 right-1/4 animate-pulse delay-1400">
              <Brain className="h-6 w-6 text-teal-300 opacity-50" />
            </div>
            <div className="absolute top-80 left-16 animate-bounce delay-1600">
              <Zap className="h-4 w-4 text-orange-300 opacity-50" />
            </div>
            <div className="absolute bottom-80 right-16 animate-pulse delay-1800">
              <Heart className="h-5 w-5 text-rose-300 opacity-50" />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium animate-fade-in-up">
                  <Sparkles className="h-4 w-4 mr-2" />
                  India's #1 Education Platform
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-gray-900 leading-tight animate-fade-in-up delay-200">
                  Education
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient-text">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-400">
                  Connecting students, freelancers, and institutions through quality education, 
                  mentorship, and professional growth opportunities across India.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-600">
                <Link 
                  to="/signup?role=student"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 transform hover:-translate-y-2 hover:scale-105"
                >
                  <span>Start Learning Today</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/signup?role=freelancer"
                  className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center space-x-3 transform hover:-translate-y-2 hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  <span>Become a Tutor</span>
                </Link>
              </div>

              <div className="pt-12 animate-fade-in-up delay-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center animate-counter" style={{animationDelay: `${index * 200}ms`}}>
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg mb-3">
                        <stat.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Modern Cards */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 animate-fade-in-up">
                Core <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
                Everything you need to succeed in your educational and professional journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative animate-fade-in-up" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl" 
                       style={{background: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`}}></div>
                  <div className="relative bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4 h-full">
                    <div className="space-y-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                        <div className="text-sm font-semibold text-blue-600">{feature.stats}</div>
                      </div>
                      <Link 
                        to={`/${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
                      >
                        Explore <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Types Section with Enhanced Design */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 animate-fade-in-up">
                Who We <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Serve</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
                A comprehensive platform that bridges the gap between learners and educators.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {userTypes.map((type, index) => (
                <div key={index} className="group animate-fade-in-up" style={{animationDelay: `${index * 200}ms`}}>
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-6">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                         style={{background: `linear-gradient(135deg, ${type.gradient.split(' ')[1]}, ${type.gradient.split(' ')[3]})`}}></div>
                    
                    <div className="relative p-8 space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 bg-gradient-to-r ${type.gradient} rounded-2xl`}>
                          <type.icon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{type.title}</h3>
                          <p className={`font-semibold bg-gradient-to-r ${type.gradient} bg-clip-text text-transparent`}>
                            {type.subtitle}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed">{type.description}</p>
                      
                      <div className="space-y-3">
                        {type.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <Link 
                        to="/signup"
                        className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${type.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        Get Started <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section with Modern Cards */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 animate-fade-in-up">
                Upcoming <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Events</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
                Join workshops, hackathons, and networking events hosted by top institutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <div key={index} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 animate-fade-in-up" style={{animationDelay: `${index * 200}ms`}}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={`Event: ${event.title}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      width="400"
                      height="192"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        {event.type}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {event.price}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-purple-500" />
                        <span>{event.institution}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span>{event.attendees} attending</span>
                      </div>
                    </div>

                    <Link 
                      to="/events"
                      className="inline-flex items-center w-full justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Register Now <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                to="/events"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up delay-600"
              >
                View All Events <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials with Enhanced Design */}
        <section className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 animate-fade-in-up">
                Success <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Stories</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-200">
                Hear from our community of students, tutors, and institutions across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
            </div>
          </div>
        </section>

        {/* CTA Section with Enhanced Design */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 animate-float">
              <Rocket className="h-12 w-12 text-white opacity-20" />
            </div>
            <div className="absolute bottom-20 right-20 animate-float delay-1000">
              <Sparkles className="h-10 w-10 text-white opacity-20" />
            </div>
            <div className="absolute top-1/2 left-1/4 animate-float delay-2000">
              <Zap className="h-8 w-8 text-white opacity-20" />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold text-white animate-fade-in-up">
                Ready to Transform Your Future?
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-fade-in-up delay-200">
                Join over 1 million students and educators who are already part of India's largest education community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-400">
                <Link 
                  to="/signup"
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  Start Your Journey Today
                </Link>
                <Link 
                  to="/schedule-tutor"
                  className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                >
                  Book a Free Session
                </Link>
              </div>

              <div className="pt-8 animate-fade-in-up delay-600">
                <p className="text-blue-100 text-sm">
                  ✨ No credit card required • 🚀 Get started in 2 minutes • 🎯 Join 1M+ learners
                </p>
              </div>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes gradient-text {
            0%, 100% {
              background-size: 200% 200%;
              background-position: left center;
            }
            50% {
              background-size: 200% 200%;
              background-position: right center;
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          @keyframes counter {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }
          
          .animate-fade-in-up.delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
            animation-fill-mode: forwards;
          }
          
          .animate-fade-in-up.delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
            animation-fill-mode: forwards;
          }
          
          .animate-fade-in-up.delay-600 {
            animation-delay: 0.6s;
            opacity: 0;
            animation-fill-mode: forwards;
          }
          
          .animate-fade-in-up.delay-800 {
            animation-delay: 0.8s;
            opacity: 0;
            animation-fill-mode: forwards;
          }
          
          .animate-gradient-text {
            background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient-text 3s ease infinite;
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-float.delay-1000 {
            animation-delay: 1s;
          }
          
          .animate-float.delay-2000 {
            animation-delay: 2s;
          }
          
          .animate-counter {
            animation: counter 0.8s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default LandingPage;