import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-pulse">
          <GraduationCap className="h-8 w-8" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse delay-1000">
          <Star className="h-6 w-6" />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-pulse delay-2000">
          <Heart className="h-7 w-7" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Doutly
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              India's leading education platform connecting students, freelancers, and institutions through quality education and professional growth opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/services" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Our Services
              </Link>
              <Link to="/schedule-tutor" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Schedule a Tutor
              </Link>
              <Link to="/tech-box" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Tech Box
              </Link>
              <Link to="/events" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Events
              </Link>
              <Link to="/become-tutor" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Become a Tutor
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Resources</h3>
            <div className="space-y-3">
              <Link to="/about" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                About Us
              </Link>
              <Link to="/careers" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Careers
              </Link>
              <Link to="/become-partner" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Partner With Us
              </Link>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Help Center
              </a>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 transform">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <span>contact@doutly.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Phone className="h-5 w-5 text-green-400" />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-400" />
                </div>
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Stay Updated</h4>
              <div className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">Students Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Expert Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">100+</div>
              <div className="text-gray-400">Cities Covered</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Doutly. All rights reserved. Made with <Heart className="inline h-4 w-4 text-red-500" /> in India.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;