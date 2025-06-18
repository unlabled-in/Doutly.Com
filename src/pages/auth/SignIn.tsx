import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, GraduationCap, BookOpen, Users, Code, Lightbulb, Zap, Target, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      navigate('/student-dashboard'); // Will be redirected based on role by auth context
    } catch (err: any) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced 3D Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary 3D floating elements with enhanced animations */}
        <div className="absolute top-20 left-10 animate-float-3d">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-2xl transform rotate-12 hover:rotate-45 transition-transform duration-700">
              <GraduationCap className="h-8 w-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-32 right-20 animate-float-3d delay-1000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-xl transform -rotate-12 hover:rotate-12 transition-transform duration-700">
              <Code className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-32 left-20 animate-float-3d delay-2000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl transform rotate-45 hover:-rotate-12 transition-transform duration-700">
              <BookOpen className="h-7 w-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-40 left-1/2 animate-float-3d delay-500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg transform hover:scale-125 transition-transform duration-500">
              <Lightbulb className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-40 right-10 animate-float-3d delay-1500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-xl transform -rotate-45 hover:rotate-90 transition-transform duration-700">
              <Users className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-60 right-1/3 animate-float-3d delay-3000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-lg transform rotate-12 hover:-rotate-45 transition-transform duration-500">
              <LogIn className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Additional 3D elements */}
        <div className="absolute top-16 left-1/4 animate-float-3d delay-4000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-500">
              <Zap className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-16 right-1/4 animate-float-3d delay-2500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-xl transform rotate-30 hover:-rotate-30 transition-transform duration-700">
              <Target className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-80 right-16 animate-float-3d delay-3500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl shadow-xl transform -rotate-30 hover:rotate-45 transition-transform duration-700">
              <Award className="h-7 w-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 animate-pulse delay-1000">
          <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-3/4 right-1/3 animate-pulse delay-2000">
          <div className="w-3 h-3 bg-purple-400 rounded-full opacity-50"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-pulse delay-3000">
          <div className="w-1 h-1 bg-green-400 rounded-full opacity-70"></div>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300 animate-bounce-gentle">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gray-900 animate-slide-up">Welcome back</h2>
          <p className="mt-3 text-lg text-gray-600 animate-slide-up delay-200">
            Sign in to your Doutly account
          </p>
        </div>

        <form className="mt-8 space-y-6 animate-slide-up delay-300" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300 transform hover:scale-105"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-300 transform hover:scale-105"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
            </span>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes float-3d {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotateX(0deg) rotateY(0deg); 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotateX(5deg) rotateY(5deg); 
          }
          50% { 
            transform: translateY(-10px) translateX(-5px) rotateX(-3deg) rotateY(10deg); 
          }
          75% { 
            transform: translateY(-15px) translateX(15px) rotateX(8deg) rotateY(-5deg); 
          }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-slide-up.delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-slide-up.delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-float-3d {
          animation: float-3d 6s ease-in-out infinite;
        }
        .animate-float-3d.delay-500 {
          animation-delay: 0.5s;
        }
        .animate-float-3d.delay-1000 {
          animation-delay: 1s;
        }
        .animate-float-3d.delay-1500 {
          animation-delay: 1.5s;
        }
        .animate-float-3d.delay-2000 {
          animation-delay: 2s;
        }
        .animate-float-3d.delay-2500 {
          animation-delay: 2.5s;
        }
        .animate-float-3d.delay-3000 {
          animation-delay: 3s;
        }
        .animate-float-3d.delay-3500 {
          animation-delay: 3.5s;
        }
        .animate-float-3d.delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-gpu {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default SignIn;