import React, { useState } from 'react';
import { 
  Building, 
  Mail, 
  Phone, 
  Users, 
  Calendar, 
  Send,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  Globe,
  Target,
  IndianRupee
} from 'lucide-react';
import { ApplicationService } from '../lib/database';
import { EmailService } from '../lib/emailService';
import { NotificationService } from '../lib/notificationService';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';
import { sanitizeInput } from '../lib/validation';

const BecomePartner: React.FC = () => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    eventType: '',
    targetAudience: '',
    estimatedAttendees: '',
    eventFrequency: '',
    budget: '',
    message: '',
    partnershipType: 'event_hosting'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const eventTypes = [
    'Workshop', 'Hackathon', 'Competition', 'Networking Event', 
    'Conference', 'Seminar', 'Bootcamp', 'Career Fair', 'Tech Talk', 'Other'
  ];

  const audienceTypes = [
    'Engineering Students', 'MBA Students', 'School Students', 'Working Professionals', 
    'Developers', 'Designers', 'Data Scientists', 'Entrepreneurs', 'Mixed Audience'
  ];

  const budgetRanges = [
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹2,50,000',
    '₹2,50,000 - ₹5,00,000',
    '₹5,00,000 - ₹10,00,000',
    '₹10,00,000+'
  ];

  const partnershipTypes = [
    { 
      value: 'event_hosting', 
      label: 'Event Hosting', 
      description: 'Host workshops, hackathons, and educational events',
      icon: Calendar
    },
    { 
      value: 'content_creation', 
      label: 'Content Creation', 
      description: 'Create educational content and courses',
      icon: Award
    },
    { 
      value: 'mentorship', 
      label: 'Mentorship Program', 
      description: 'Provide mentorship and guidance to students',
      icon: Users
    },
    { 
      value: 'recruitment', 
      label: 'Recruitment Partner', 
      description: 'Connect with talented students for hiring',
      icon: Building
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: 'Reach 1M+ Students',
      description: 'Access our community of over 1 million active students and professionals across India'
    },
    {
      icon: TrendingUp,
      title: 'Brand Visibility',
      description: 'Increase your brand awareness and establish thought leadership in the education sector'
    },
    {
      icon: Award,
      title: 'Quality Audience',
      description: 'Connect with motivated learners from top institutions like IITs, IIMs, and NITs'
    },
    {
      icon: Globe,
      title: 'Pan-India Reach',
      description: 'Expand your reach across 100+ cities in India with our extensive network'
    }
  ];

  const successStories = [
    {
      company: 'TechMahindra',
      event: 'AI/ML Workshop Series',
      impact: '5,000+ participants, 200+ job offers',
      icon: Building
    },
    {
      company: 'Flipkart',
      event: 'E-commerce Hackathon',
      impact: '10,000+ registrations, 50+ internships',
      icon: Target
    },
    {
      company: 'Infosys',
      event: 'Campus Connect Program',
      impact: '15,000+ students reached, 300+ placements',
      icon: Star
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const partnershipData = {
        ...formData,
        organizationName: sanitizeInput(formData.organizationName),
        contactName: sanitizeInput(formData.contactName),
        email: sanitizeInput(formData.email),
        website: sanitizeInput(formData.website),
        eventType: sanitizeInput(formData.eventType),
        targetAudience: sanitizeInput(formData.targetAudience),
        message: sanitizeInput(formData.message),
        type: 'partnership_application',
        status: 'pending',
        submittedAt: new Date(),
        priority: formData.budget.includes('10,00,000+') ? 'high' : 
                 formData.budget.includes('5,00,000') ? 'medium' : 'low'
      };

      await ApplicationService.create(partnershipData, userProfile?.uid);
      
      // Send confirmation email
      await EmailService.sendPartnershipApplicationConfirmation(
        formData.email,
        formData.contactName,
        formData.organizationName
      );

      // Create notification for user
      if (userProfile?.uid) {
        await NotificationService.create({
          userId: userProfile.uid,
          title: 'Partnership Application Submitted',
          message: `Your partnership application for ${formData.organizationName} has been submitted successfully.`,
          type: 'success',
          actionUrl: '/become-partner'
        });
      }
      
      setSuccess(true);
      setFormData({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        eventType: '',
        targetAudience: '',
        estimatedAttendees: '',
        eventFrequency: '',
        budget: '',
        message: '',
        partnershipType: 'event_hosting'
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting partnership application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Become a Partner</h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Partner with Doutly to reach over 1 million students across India. 
              Host events, create content, and grow your brand with our community.
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Partnership application submitted successfully!</span>
            </div>
            <p className="mt-1 text-sm">
              Our partnership team will review your application and get back to you within 24-48 hours.
            </p>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Partner with Doutly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                  <benefit.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <story.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{story.company}</h3>
                <p className="text-sm text-gray-600 mb-2">{story.event}</p>
                <p className="text-xs text-green-600 font-medium">{story.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Application Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Partnership Application</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Partnership Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Partnership Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnershipTypes.map((type) => (
                    <label key={type.value} className="relative">
                      <input
                        type="radio"
                        name="partnershipType"
                        value={type.value}
                        checked={formData.partnershipType === type.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.partnershipType === type.value 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <type.icon className={`h-6 w-6 ${
                            formData.partnershipType === type.value ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{type.label}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Organization Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Organization Name *
                  </label>
                  <div className="relative">
                    <Building className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      id="organizationName"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter contact person name"
                    required
                  />
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter email address"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-gray-900 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://yourcompany.com"
                />
              </div>

              {/* Event Details (if event hosting) */}
              {formData.partnershipType === 'event_hosting' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="eventType" className="block text-sm font-semibold text-gray-900 mb-2">
                        Event Type *
                      </label>
                      <select
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select event type</option>
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="targetAudience" className="block text-sm font-semibold text-gray-900 mb-2">
                        Target Audience *
                      </label>
                      <select
                        id="targetAudience"
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select target audience</option>
                        {audienceTypes.map((audience) => (
                          <option key={audience} value={audience}>{audience}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="estimatedAttendees" className="block text-sm font-semibold text-gray-900 mb-2">
                        Estimated Attendees *
                      </label>
                      <div className="relative">
                        <Users className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <select
                          id="estimatedAttendees"
                          name="estimatedAttendees"
                          value={formData.estimatedAttendees}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        >
                          <option value="">Select range</option>
                          <option value="100-500">100-500</option>
                          <option value="500-1000">500-1000</option>
                          <option value="1000-2500">1000-2500</option>
                          <option value="2500-5000">2500-5000</option>
                          <option value="5000+">5000+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="eventFrequency" className="block text-sm font-semibold text-gray-900 mb-2">
                        Event Frequency
                      </label>
                      <div className="relative">
                        <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <select
                          id="eventFrequency"
                          name="eventFrequency"
                          value={formData.eventFrequency}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select frequency</option>
                          <option value="one-time">One-time event</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="bi-annual">Bi-annual</option>
                          <option value="annual">Annual</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-semibold text-gray-900 mb-2">
                      Event Budget *
                    </label>
                    <div className="relative">
                      <IndianRupee className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      >
                        <option value="">Select budget range</option>
                        {budgetRanges.map((range) => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  Tell us about your partnership goals *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="Describe your partnership goals, what you hope to achieve, and how you'd like to collaborate with Doutly..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Partnership Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomePartner;