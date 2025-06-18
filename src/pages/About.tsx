import React from 'react';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Heart, 
  Lightbulb,
  TrendingUp,
  Shield,
  BookOpen,
  Code,
  Calendar,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from our educational content to our user experience.'
    },
    {
      icon: Heart,
      title: 'Empathy',
      description: 'We understand the challenges students face and create solutions with genuine care and understanding.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge educational technology and learning methods.'
    },
    {
      icon: Shield,
      title: 'Trust',
      description: 'We build trust through transparency, reliability, and consistent delivery of quality education.'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Former IIT Delhi graduate with 15+ years in EdTech. Passionate about democratizing quality education.'
    },
    {
      name: 'Priya Sharma',
      role: 'Chief Technology Officer',
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Ex-Google engineer specializing in scalable educational platforms and AI-driven learning systems.'
    },
    {
      name: 'Amit Patel',
      role: 'Head of Education',
      image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Former professor at IIM Bangalore with expertise in curriculum development and educational psychology.'
    },
    {
      name: 'Sneha Reddy',
      role: 'VP of Operations',
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Operations expert with experience scaling educational platforms across India and Southeast Asia.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize education in India'
    },
    {
      year: '2021',
      title: '10,000+ Students',
      description: 'Reached our first major milestone of serving 10,000 students'
    },
    {
      year: '2022',
      title: 'Series A Funding',
      description: 'Raised ₹50 crores to expand our platform and reach'
    },
    {
      year: '2023',
      title: 'Pan-India Expansion',
      description: 'Expanded to all major cities across India'
    },
    {
      year: '2024',
      title: '1M+ Users',
      description: 'Crossed 1 million registered users and 50,000+ successful placements'
    }
  ];

  const stats = [
    { label: 'Students Served', value: '1M+', icon: Users },
    { label: 'Expert Tutors', value: '10K+', icon: Award },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
    { label: 'Cities Covered', value: '100+', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        {/* Floating SVG Animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-bounce">
            <BookOpen className="h-8 w-8 text-blue-300 opacity-60" />
          </div>
          <div className="absolute top-32 right-20 animate-pulse">
            <Code className="h-6 w-6 text-green-300 opacity-60" />
          </div>
          <div className="absolute bottom-32 left-20 animate-bounce delay-300">
            <Users className="h-7 w-7 text-purple-300 opacity-60" />
          </div>
          <div className="absolute top-40 left-1/2 animate-pulse delay-500">
            <Lightbulb className="h-5 w-5 text-yellow-300 opacity-60" />
          </div>
          <div className="absolute bottom-40 right-10 animate-bounce delay-700">
            <Target className="h-6 w-6 text-indigo-300 opacity-60" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">Doutly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to democratize quality education and make learning accessible to every student in India and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To bridge the gap between students seeking knowledge and experts willing to share it, 
                creating a vibrant ecosystem where learning knows no boundaries.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that every student deserves access to quality education, personalized guidance, 
                and opportunities to grow both academically and professionally.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Students learning"
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl">
                <div className="text-3xl font-bold">1M+</div>
                <div className="text-sm">Students Empowered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Numbers that reflect our commitment to educational excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate educators and technologists working to transform education
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{member.name}</h3>
                <p className="text-blue-600 text-center font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed text-center">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to transform education
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Mission</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Be part of the educational revolution. Whether you're a student seeking knowledge or an expert ready to share, 
            there's a place for you in the Doutly community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/become-tutor"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Become a Tutor
              <Users className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;