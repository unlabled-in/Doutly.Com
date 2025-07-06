import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Filter,
  Search,
  ExternalLink,
  Star,
  Tag,
  Send,
  CheckCircle
} from 'lucide-react';
import { ApplicationService, EventRegistrationService, HackathonService } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';

const Events: React.FC = () => {
  const { userProfile } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [registrationData, setRegistrationData] = useState({
    name: userProfile?.displayName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    institution: userProfile?.institution || '',
    additionalInfo: ''
  });
  const [partnerData, setPartnerData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    eventType: '',
    description: '',
    expectedAttendees: '',
    budget: '',
    website: '',
    partnershipType: 'event_hosting'
  });

  // Static events data
  const staticEvents = [
    {
      id: 'web-dev-bootcamp-2024',
      title: 'Web Development Bootcamp',
      description: 'Learn modern web development with React, Node.js, and MongoDB. Perfect for beginners and intermediate developers.',
      date: '2024-12-15',
      time: '10:00 AM',
      duration: '6 hours',
      type: 'Workshop',
      category: 'Technology',
      institution: 'Tech University',
      location: 'Online',
      attendees: 150,
      maxAttendees: 200,
      price: 'Free',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['React', 'Node.js', 'MongoDB', 'JavaScript']
    },
    {
      id: 'career-fair-2024',
      title: 'Career Fair 2024',
      description: 'Connect with top employers and explore career opportunities in tech, finance, and consulting.',
      date: '2024-12-25',
      time: '11:00 AM',
      duration: '4 hours',
      type: 'Networking',
      category: 'Career',
      institution: 'Multiple Partners',
      location: 'Convention Center',
      attendees: 500,
      maxAttendees: 1000,
      price: 'Free',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Networking', 'Jobs', 'Career', 'Recruitment']
    },
    {
      id: 'data-science-workshop-2024',
      title: 'Data Science Workshop',
      description: 'Master data analysis, visualization, and machine learning with hands-on projects.',
      date: '2024-12-28',
      time: '2:00 PM',
      duration: '5 hours',
      type: 'Workshop',
      category: 'Data Science',
      institution: 'Data Institute',
      location: 'Online',
      attendees: 120,
      maxAttendees: 150,
      price: '$50',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/3861943/pexels-photo-3861943.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Python', 'Pandas', 'Visualization', 'Statistics']
    }
  ];

  useEffect(() => {
    // Subscribe to hackathons from database
    const unsubscribeHackathons = HackathonService.subscribe([], (hackathonsData) => {
      // Filter published hackathons
      const publishedHackathons = hackathonsData
        .filter(h => h.status === 'published' || h.status === 'ongoing')
        .map(h => ({
          id: h.id,
          title: h.title,
          description: h.description,
          date: h.startDate ? new Date(h.startDate.toDate()).toISOString().split('T')[0] : '2024-12-20',
          time: h.startDate ? new Date(h.startDate.toDate()).toLocaleTimeString() : '9:00 AM',
          duration: h.endDate && h.startDate ? 
            Math.ceil((new Date(h.endDate.toDate()).getTime() - new Date(h.startDate.toDate()).getTime()) / (1000 * 60 * 60)) + ' hours' : 
            '48 hours',
          type: 'Competition',
          category: 'Hackathon',
          institution: 'Doutly',
          location: 'Hybrid',
          attendees: h.currentParticipants || 0,
          maxAttendees: h.maxParticipants || 500,
          price: 'Free',
          rating: 4.9,
          image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
          tags: h.tags || ['Hackathon', 'Competition', 'Innovation']
        }));
      
      setHackathons(publishedHackathons);
    });

    // Combine static events with hackathons
    setEvents([...staticEvents]);

    return () => {
      unsubscribeHackathons();
    };
  }, []);

  // Combine all events
  const allEvents = [...events, ...hackathons];

  const filteredEvents = allEvents.filter(event => {
    const matchesFilter = filter === 'all' || event.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRegister = (event: any) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const registrationDoc = {
        ...registrationData,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventType: selectedEvent.type,
        registrationDate: new Date(),
        status: 'pending'
      };

      await EventRegistrationService.create(registrationDoc, userProfile?.uid);
      
      setShowRegistrationForm(false);
      setSelectedEvent(null);
      setRegistrationData({
        name: userProfile?.displayName || '',
        email: userProfile?.email || '',
        phone: userProfile?.phone || '',
        institution: userProfile?.institution || '',
        additionalInfo: ''
      });
      
      alert('Registration submitted successfully! You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Error submitting registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const partnershipDoc = {
        ...partnerData,
        type: 'event_partnership',
        status: 'pending',
        submittedAt: new Date(),
        priority: 'medium',
        message: partnerData.description
      };

      await ApplicationService.create(partnershipDoc, userProfile?.uid);
      
      setShowPartnerForm(false);
      setPartnerData({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        eventType: '',
        description: '',
        expectedAttendees: '',
        budget: '',
        website: '',
        partnershipType: 'event_hosting'
      });
      
      alert('Partnership request submitted successfully! Our team will review and contact you within 24-48 hours.');
    } catch (error) {
      console.error('Error submitting partnership request:', error);
      alert('Error submitting partnership request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'competition': return 'bg-red-100 text-red-800';
      case 'networking': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join workshops, hackathons, and networking events hosted by top institutions and industry experts.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="workshop">Workshops</option>
                <option value="competition">Competitions</option>
                <option value="networking">Networking</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredEvents.length} of {allEvents.length} events
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {event.price}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">{event.category}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{event.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.time} • {event.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees}/{event.maxAttendees} registered</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {event.tags.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      +{event.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Hosted by</p>
                    <p className="text-sm font-medium text-gray-900">{event.institution}</p>
                  </div>
                  <button 
                    onClick={() => handleRegister(event)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Register</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Register for Event</h3>
                  <button
                    onClick={() => setShowRegistrationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedEvent.title}</p>
              </div>
              <form onSubmit={handleRegistrationSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution/Organization</label>
                  <input
                    type="text"
                    value={registrationData.institution}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <textarea
                    value={registrationData.additionalInfo}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requirements or questions..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Partner Form Modal */}
        {showPartnerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Host an Event Partnership</h3>
                  <button
                    onClick={() => setShowPartnerForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Partner with Doutly to host your event</p>
              </div>
              <form onSubmit={handlePartnerSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      value={partnerData.organizationName}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, organizationName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                    <input
                      type="text"
                      value={partnerData.contactName}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, contactName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={partnerData.email}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={partnerData.phone}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                    <select
                      value={partnerData.eventType}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, eventType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select event type</option>
                      <option value="workshop">Workshop</option>
                      <option value="competition">Competition</option>
                      <option value="networking">Networking Event</option>
                      <option value="conference">Conference</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
                    <select
                      value={partnerData.expectedAttendees}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, expectedAttendees: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select range</option>
                      <option value="50-100">50-100</option>
                      <option value="100-250">100-250</option>
                      <option value="250-500">250-500</option>
                      <option value="500-1000">500-1000</option>
                      <option value="1000+">1000+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={partnerData.website}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Description *</label>
                  <textarea
                    value={partnerData.description}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your event, objectives, and target audience..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                  <select
                    value={partnerData.budget}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                    <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                    <option value="₹5,00,000+">₹5,00,000+</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPartnerForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Submitting..." />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Partnership Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Want to Host an Event?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Partner with Doutly to reach thousands of students and professionals. 
            Host workshops, competitions, and networking events on our platform.
          </p>
          <button 
            onClick={() => setShowPartnerForm(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Become a Partner
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;