import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, GraduationCap, BookOpen, Users, Code, Lightbulb, Target, Award, Zap, Rocket, Brain, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    institution: '',
    skills: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        displayName: formData.displayName,
        role: 'student' as const, // Only students can sign up
        phone: formData.phone || undefined,
        institution: formData.institution || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined
      };

      await signUp(formData.email, formData.password, profileData);
      // Navigation will be handled by AuthContext
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced 3D Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary 3D floating elements with enhanced animations */}
        <div className="absolute top-16 left-8 animate-float-3d">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl shadow-2xl transform rotate-12 hover:rotate-45 transition-transform duration-700">
              <GraduationCap className="h-10 w-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-24 right-16 animate-float-3d delay-1000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl transform -rotate-12 hover:rotate-12 transition-transform duration-700">
              <Code className="h-7 w-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-28 left-16 animate-float-3d delay-2000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl transform rotate-45 hover:-rotate-12 transition-transform duration-700">
              <BookOpen className="h-8 w-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-36 left-1/3 animate-float-3d delay-500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg transform hover:scale-125 transition-transform duration-500">
              <Lightbulb className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-36 right-12 animate-float-3d delay-1500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-xl transform -rotate-45 hover:rotate-90 transition-transform duration-700">
              <Users className="h-7 w-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-52 right-1/4 animate-float-3d delay-3000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-lg transform rotate-12 hover:-rotate-45 transition-transform duration-500">
              <Target className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-52 left-1/4 animate-float-3d delay-1200">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-xl transform rotate-30 hover:-rotate-30 transition-transform duration-700">
              <Award className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-72 left-12 animate-float-3d delay-1500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-500">
              <UserPlus className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Additional 3D elements */}
        <div className="absolute top-20 right-1/3 animate-float-3d delay-4000">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl shadow-xl transform -rotate-15 hover:rotate-45 transition-transform duration-700">
              <Rocket className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-20 right-1/3 animate-float-3d delay-2500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-xl transform rotate-45 hover:-rotate-45 transition-transform duration-700">
              <Brain className="h-7 w-7 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-80 left-16 animate-float-3d delay-3500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-lg transform rotate-60 hover:-rotate-30 transition-transform duration-500">
              <Zap className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-80 right-16 animate-float-3d delay-4500">
          <div className="relative transform-gpu perspective-1000">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full shadow-lg transform hover:scale-125 transition-transform duration-500">
              <Heart className="h-5 w-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 animate-pulse delay-1000">
          <div className="w-3 h-3 bg-purple-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-3/4 right-1/3 animate-pulse delay-2000">
          <div className="w-2 h-2 bg-blue-400 rounded-full opacity-50"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-pulse delay-3000">
          <div className="w-4 h-4 bg-green-400 rounded-full opacity-70"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-4000">
          <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform duration-300 animate-bounce-gentle">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gray-900 animate-slide-up">Join as a Student</h2>
          <p className="mt-3 text-lg text-gray-600 animate-slide-up delay-200">
            Start your learning journey with Doutly
          </p>
        </div>

        <form className="mt-8 space-y-6 animate-slide-up delay-300" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Full Name */}
            <div className="group">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-300 transform hover:scale-105"
                placeholder="Enter your full name"
                required
              />
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-300 transform hover:scale-105"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone */}
            <div className="group">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-300 transform hover:scale-105"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Institution */}
            <div className="group">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                School/College (Optional)
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                value={formData.institution}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-300 transform hover:scale-105"
                placeholder="Enter your school/college"
              />
            </div>

            {/* Skills */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Interest (Optional)
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 transform hover:scale-105"
                  placeholder="Add subjects you're interested in"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-fade-in">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1 animate-scale-in"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-300 transform hover:scale-105"
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 group-hover:border-purple-300 transform hover:scale-105"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserPlus className="h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
            </span>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Student Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Sign in here
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
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float-3d {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotateX(0deg) rotateY(0deg); 
          }
          25% { 
            transform: translateY(-25px) translateX(15px) rotateX(10deg) rotateY(10deg); 
          }
          50% { 
            transform: translateY(-15px) translateX(-10px) rotateX(-5deg) rotateY(15deg); 
          }
          75% { 
            transform: translateY(-20px) translateX(20px) rotateX(15deg) rotateY(-10deg); 
          }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
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
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-float-3d {
          animation: float-3d 8s ease-in-out infinite;
        }
        .animate-float-3d.delay-500 {
          animation-delay: 0.5s;
        }
        .animate-float-3d.delay-1000 {
          animation-delay: 1s;
        }
        .animate-float-3d.delay-1200 {
          animation-delay: 1.2s;
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
        .animate-float-3d.delay-4500 {
          animation-delay: 4.5s;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 4s ease-in-out infinite;
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

export default SignUp;