import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogIn, UserPlus, Bell, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDashboardPath = () => {
    if (!userProfile) return '/';
    
    switch (userProfile.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'vertical_head':
        return '/vh-dashboard';
      case 'manager':
        return '/manager-dashboard';
      case 'team_leader':
        return '/tl-dashboard';
      case 'tutor':
        return '/tutor-dashboard';
      case 'freelancer':
        return '/freelancer-dashboard';
      case 'bda':
        return '/bda-dashboard';
      case 'sales':
        return '/sales-dashboard';
      default:
        return '/student-dashboard';
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Doutly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              Events
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/careers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
              Careers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
                <Link 
                  to={getDashboardPath()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{userProfile?.displayName}</p>
                      <p className="text-sm text-gray-600">{userProfile?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/signin"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/signup"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                Services
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                Events
              </Link>
              <Link to="/careers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                Careers
              </Link>
              
              {currentUser ? (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  <Link 
                    to={getDashboardPath()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 font-medium py-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                  <Link 
                    to="/signin"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;