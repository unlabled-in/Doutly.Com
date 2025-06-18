import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Upload, 
  Linkedin, 
  Award,
  Clock,
  DollarSign,
  CheckCircle,
  Star,
  Users,
  Send
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import BackButton from '../components/BackButton';

const BecomeTutor: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: [] as string[],
    experience: '',
    education: '',
    linkedin: '',
    bio: '',
    hourlyRate: '',
    availability: [] as string[],
    languages: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');

  const expertiseOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Programming', 'Web Development', 'Data Science', 'Machine Learning',
    'English', 'History', 'Economics', 'Business', 'Marketing', 'Design',
    'Statistics', 'Engineering', 'Accounting', 'Finance'
  ];

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  const languageOptions = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi',
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.expertise.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        ...formData,
        type: 'tutor_application',
        status: 'pending',
        submittedAt: new Date(),
        rating: 0,
        totalSessions: 0,
        earnings: 0
      };

      await addDoc(collection(db, 'applications'), applicationData);
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        expertise: [],
        experience: '',
        education: '',
        linkedin: '',
        bio: '',
        hourlyRate: '',
        availability: [],
        languages: []
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Pay',
      description: 'Earn ₹500-2000/hour based on your expertise'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Work when you want, where you want'
    },
    {
      icon: Users,
      title: 'Global Reach',
      description: 'Teach students from across India'
    },
    {
      icon: Award,
      title: 'Professional Growth',
      description: 'Build your reputation and expertise'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Become a Tutor</h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Share your knowledge and earn money by helping students achieve their goals. 
              Join our community of expert tutors today.
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Application submitted successfully!</span>
            </div>
            <p className="mt-1 text-sm">
              We'll review your application and get back to you within 2-3 business days.
            </p>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Become a Tutor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tutor Application</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-900 mb-2">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Linkedin className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Areas of Expertise *
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add your expertise areas"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {expertiseOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.expertise.includes(option)}
                        onChange={() => handleMultiSelect('expertise', option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {formData.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience and Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experience" className="block text-sm font-semibold text-gray-900 mb-2">
                    Teaching Experience *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Hourly Rate (₹) *
                  </label>
                  <div className="relative">
                    <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                      min="500"
                      max="5000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-semibold text-gray-900 mb-2">
                  Education Background *
                </label>
                <textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe your educational background, degrees, certifications..."
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
                  Short Bio *
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Tell us about yourself, your teaching style, and what makes you a great tutor..."
                  required
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Availability *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availabilityOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(option)}
                        onChange={() => handleMultiSelect('availability', option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Languages Spoken
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languageOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(option)}
                        onChange={() => handleMultiSelect('languages', option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Application Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600 text-sm">Submit your application with all required information</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review</h3>
              <p className="text-gray-600 text-sm">Our team reviews your application and qualifications</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Interview</h3>
              <p className="text-gray-600 text-sm">Brief interview to assess teaching skills and fit</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Teaching</h3>
              <p className="text-gray-600 text-sm">Get approved and start earning by helping students</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeTutor;