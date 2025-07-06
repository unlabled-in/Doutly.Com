import React, { useState } from 'react';
import { Calendar, Clock, User, BookOpen, Send, CheckCircle } from 'lucide-react';
import { LeadService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { sanitizeInput } from '../lib/validation';

const ScheduleTutor: React.FC = () => {
  const { userProfile } = useAuth();
  const { error, setError, clearError, handleAsyncError } = useErrorHandler();
  const [formData, setFormData] = useState({
    doubtDescription: '',
    subject: '',
    tutorType: 'instant',
    scheduledDate: '',
    scheduledTime: '',
    urgencyLevel: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Programming', 'Web Development', 'Data Science', 'Machine Learning',
    'English', 'History', 'Economics', 'Business Studies', 'Accounting',
    'Statistics', 'Engineering', 'Other'
  ];

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${timestamp}-${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const validateForm = (): boolean => {
    if (!formData.doubtDescription.trim()) {
      setError('Please describe your doubt or question');
      return false;
    }
    if (formData.doubtDescription.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }
    if (!formData.subject) {
      setError('Please select a subject');
      return false;
    }
    if (formData.tutorType === 'scheduled') {
      if (!formData.scheduledDate) {
        setError('Please select a date for your scheduled session');
        return false;
      }
      if (!formData.scheduledTime) {
        setError('Please select a time for your scheduled session');
        return false;
      }
      const selectedDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      if (selectedDate <= new Date()) {
        setError('Scheduled date and time must be in the future');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      setError('Please sign in to submit a tutor request');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await handleAsyncError(async () => {
      const newTicketNumber = generateTicketNumber();
      
      const leadData = {
        ticketNumber: newTicketNumber,
        type: 'tutor_request' as const,
        studentId: userProfile.uid,
        studentName: userProfile.displayName,
        studentEmail: userProfile.email,
        studentPhone: userProfile.phone || '',
        doubtDescription: sanitizeInput(formData.doubtDescription),
        subject: sanitizeInput(formData.subject),
        tutorType: formData.tutorType as 'instant' | 'scheduled',
        scheduledDate: formData.scheduledDate || null,
        scheduledTime: formData.scheduledTime || null,
        urgencyLevel: formData.urgencyLevel as 'low' | 'medium' | 'high' | 'urgent',
        status: 'open' as const,
        priority: (formData.urgencyLevel === 'urgent' ? 'high' : 
                  formData.urgencyLevel === 'high' ? 'medium' : 'low') as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: null,
        assignedBy: null,
        notes: [],
        source: 'Website',
        value: 0,
        conversionProbability: 50,
        history: [{
          action: 'created',
          timestamp: new Date(),
          by: userProfile.displayName,
          note: 'Ticket created by student'
        }]
      };

      await LeadService.create(leadData, userProfile.uid);
      return newTicketNumber;
    }, 'Failed to submit tutor request. Please try again.');

    if (result) {
      setTicketNumber(result);
      setSuccess(true);
      
      setFormData({
        doubtDescription: '',
        subject: '',
        tutorType: 'instant',
        scheduledDate: '',
        scheduledTime: '',
        urgencyLevel: 'medium'
      });

      setTimeout(() => setSuccess(false), 5000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule a Tutor</h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Get personalized help from expert tutors. Choose between instant support or schedule a session at your convenience.
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Request submitted successfully!</span>
            </div>
            <p className="mt-1 text-sm">
              Your ticket number is: <span className="font-bold">{ticketNumber}</span>
            </p>
            <p className="mt-1 text-sm">We'll connect you with a tutor shortly. Check your email for updates.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="doubtDescription" className="block text-sm font-semibold text-gray-900 mb-2">
                Describe Your Doubt or Question *
              </label>
              <textarea
                id="doubtDescription"
                name="doubtDescription"
                value={formData.doubtDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                placeholder="Please provide a detailed description of what you need help with..."
                required
                aria-describedby="doubtDescription-help"
              />
              <p id="doubtDescription-help" className="mt-1 text-sm text-gray-500">
                The more details you provide, the better we can match you with the right tutor.
              </p>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                How would you like to connect? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="tutorType"
                    value="instant"
                    checked={formData.tutorType === 'instant'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all ${
                    formData.tutorType === 'instant' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Clock className={`h-6 w-6 ${
                        formData.tutorType === 'instant' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">Instant Help</h3>
                        <p className="text-sm text-gray-600">Connect with available tutors now</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="tutorType"
                    value="scheduled"
                    checked={formData.tutorType === 'scheduled'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-all ${
                    formData.tutorType === 'scheduled' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Calendar className={`h-6 w-6 ${
                        formData.tutorType === 'scheduled' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">Schedule Session</h3>
                        <p className="text-sm text-gray-600">Book for a specific time</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {formData.tutorType === 'scheduled' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg animate-fade-in">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required={formData.tutorType === 'scheduled'}
                  />
                </div>
                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-semibold text-gray-900 mb-2">
                    Preferred Time *
                  </label>
                  <input
                    type="time"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required={formData.tutorType === 'scheduled'}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="urgencyLevel" className="block text-sm font-semibold text-gray-900 mb-2">
                Urgency Level
              </label>
              <select
                id="urgencyLevel"
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="low">Low - Can wait a few days</option>
                <option value="medium">Medium - Need help within 24 hours</option>
                <option value="high">High - Need help today</option>
                <option value="urgent">Urgent - Need help immediately</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Submitting Request..." />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Tutor Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Expert Tutors</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Our tutors are verified experts with proven track records in their subjects.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Quick Response</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Get connected with tutors within minutes for instant help or scheduled sessions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Personalized Learning</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Every session is tailored to your specific needs and learning style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTutor;