import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar, 
  Tag, 
  Trophy,
  Save,
  X,
  Search,
  Filter,
  Clock,
  User,
  Globe,
  Lock,
  Users,
  Award,
  Target,
  Code
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { sanitizeInput } from '../lib/validation';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  thumbnail?: string;
  visibility: 'public' | 'private';
  status: 'draft' | 'published' | 'ongoing' | 'completed';
  type: 'hackathon' | 'competition' | 'networking';
  startDate?: any;
  endDate?: any;
  registrationDeadline?: any;
  maxParticipants?: number;
  currentParticipants: number;
  prizes: string[];
  requirements: string[];
  authorId: string;
  authorName: string;
  createdAt: any;
  updatedAt: any;
  views: number;
  registrations: number;
}

const HackathonPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateHackathon, setShowCreateHackathon] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [hackathonForm, setHackathonForm] = useState({
    title: '',
    description: '',
    content: '',
    tags: [] as string[],
    thumbnail: '',
    visibility: 'public' as 'public' | 'private',
    status: 'draft' as 'draft' | 'published' | 'ongoing' | 'completed',
    type: 'hackathon' as 'hackathon' | 'competition' | 'networking',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 100,
    prizes: [] as string[],
    requirements: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [currentPrize, setCurrentPrize] = useState('');
  const [currentRequirement, setCurrentRequirement] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) return;

    // Subscribe to hackathons created by this user or all if admin
    const hackathonsQuery = userProfile.role === 'admin' 
      ? query(collection(db, 'hackathons'), orderBy('createdAt', 'desc'))
      : query(
          collection(db, 'hackathons'),
          where('authorId', '==', userProfile.uid),
          orderBy('createdAt', 'desc')
        );

    const unsubscribe = onSnapshot(hackathonsQuery, (snapshot) => {
      const hackathonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hackathon[];
      setHackathons(hackathonsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const resetForm = () => {
    setHackathonForm({
      title: '',
      description: '',
      content: '',
      tags: [],
      thumbnail: '',
      visibility: 'public',
      status: 'draft',
      type: 'hackathon',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: 100,
      prizes: [],
      requirements: []
    });
    setCurrentTag('');
    setCurrentPrize('');
    setCurrentRequirement('');
    setEditingHackathon(null);
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    try {
      const hackathonData = {
        ...hackathonForm,
        title: sanitizeInput(hackathonForm.title),
        description: sanitizeInput(hackathonForm.description),
        content: sanitizeInput(hackathonForm.content),
        tags: Array.isArray(hackathonForm.tags) ? hackathonForm.tags.map(sanitizeInput) : [],
        thumbnail: sanitizeInput(hackathonForm.thumbnail || ''),
        prizes: Array.isArray(hackathonForm.prizes) ? hackathonForm.prizes.map(sanitizeInput) : [],
        requirements: Array.isArray(hackathonForm.requirements) ? hackathonForm.requirements.map(sanitizeInput) : [],
        authorId: userProfile.uid,
        authorName: userProfile.displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        registrations: 0,
        currentParticipants: 0,
        startDate: hackathonForm.startDate ? new Date(hackathonForm.startDate) : null,
        endDate: hackathonForm.endDate ? new Date(hackathonForm.endDate) : null,
        registrationDeadline: hackathonForm.registrationDeadline ? new Date(hackathonForm.registrationDeadline) : null
      };

      await addDoc(collection(db, 'hackathons'), hackathonData);
      resetForm();
      setShowCreateHackathon(false);
    } catch (error) {
      console.error('Error creating hackathon:', error);
      alert('Error creating hackathon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHackathon) return;

    setLoading(true);
    try {
      const updateData = {
        ...hackathonForm,
        title: sanitizeInput(hackathonForm.title),
        description: sanitizeInput(hackathonForm.description),
        content: sanitizeInput(hackathonForm.content),
        tags: Array.isArray(hackathonForm.tags) ? hackathonForm.tags.map(sanitizeInput) : [],
        thumbnail: sanitizeInput(hackathonForm.thumbnail || ''),
        prizes: Array.isArray(hackathonForm.prizes) ? hackathonForm.prizes.map(sanitizeInput) : [],
        requirements: Array.isArray(hackathonForm.requirements) ? hackathonForm.requirements.map(sanitizeInput) : [],
        updatedAt: new Date(),
        startDate: hackathonForm.startDate ? new Date(hackathonForm.startDate) : null,
        endDate: hackathonForm.endDate ? new Date(hackathonForm.endDate) : null,
        registrationDeadline: hackathonForm.registrationDeadline ? new Date(hackathonForm.registrationDeadline) : null
      };

      await updateDoc(doc(db, 'hackathons', editingHackathon.id), updateData);
      resetForm();
      setShowCreateHackathon(false);
    } catch (error) {
      console.error('Error updating hackathon:', error);
      alert('Error updating hackathon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;

    try {
      await deleteDoc(doc(db, 'hackathons', hackathonId));
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      alert('Error deleting hackathon. Please try again.');
    }
  };

  const handleEditHackathon = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon);
    setHackathonForm({
      title: hackathon.title,
      description: hackathon.description,
      content: hackathon.content,
      tags: hackathon.tags,
      thumbnail: hackathon.thumbnail || '',
      visibility: hackathon.visibility,
      status: hackathon.status,
      type: hackathon.type,
      startDate: hackathon.startDate ? new Date(hackathon.startDate.toDate()).toISOString().slice(0, 16) : '',
      endDate: hackathon.endDate ? new Date(hackathon.endDate.toDate()).toISOString().slice(0, 16) : '',
      registrationDeadline: hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline.toDate()).toISOString().slice(0, 16) : '',
      maxParticipants: hackathon.maxParticipants || 100,
      prizes: hackathon.prizes,
      requirements: hackathon.requirements
    });
    setShowCreateHackathon(true);
  };

  const addTag = () => {
    if (currentTag.trim() && !hackathonForm.tags.includes(currentTag.trim())) {
      setHackathonForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setHackathonForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addPrize = () => {
    if (currentPrize.trim() && !hackathonForm.prizes.includes(currentPrize.trim())) {
      setHackathonForm(prev => ({
        ...prev,
        prizes: [...prev.prizes, currentPrize.trim()]
      }));
      setCurrentPrize('');
    }
  };

  const removePrize = (prize: string) => {
    setHackathonForm(prev => ({
      ...prev,
      prizes: prev.prizes.filter(p => p !== prize)
    }));
  };

  const addRequirement = () => {
    if (currentRequirement.trim() && !hackathonForm.requirements.includes(currentRequirement.trim())) {
      setHackathonForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setHackathonForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }));
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hackathon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'public' ? Globe : Lock;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hackathon Management</h1>
              <p className="text-gray-600 mt-2">
                Create and manage hackathons, coding competitions, and tech events
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateHackathon(true);
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Hackathon</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{hackathons.length}</p>
                <p className="text-sm text-gray-600">Total Hackathons</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {hackathons.filter(h => h.status === 'ongoing').length}
                </p>
                <p className="text-sm text-gray-600">Ongoing</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {hackathons.reduce((sum, hackathon) => sum + (hackathon.registrations || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Registrations</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {hackathons.filter(h => h.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
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
                  placeholder="Search hackathons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredHackathons.length} of {hackathons.length} hackathons
            </div>
          </div>
        </div>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <LoadingSpinner text="Loading hackathons..." />
            </div>
          ) : filteredHackathons.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hackathons yet</h3>
              <p className="text-gray-600 mb-6">Create your first hackathon to get started</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateHackathon(true);
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Create Your First Hackathon
              </button>
            </div>
          ) : (
            filteredHackathons.map((hackathon) => {
              const VisibilityIcon = getVisibilityIcon(hackathon.visibility);
              return (
                <div key={hackathon.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {hackathon.thumbnail && (
                    <img 
                      src={hackathon.thumbnail} 
                      alt={`Hackathon: ${hackathon.title}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      width="400"
                      height="192"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <VisibilityIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{hackathon.visibility}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {hackathon.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {hackathon.description}
                    </p>
                    
                    {hackathon.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hackathon.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {hackathon.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            +{hackathon.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {hackathon.startDate && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Starts: {new Date(hackathon.startDate.toDate()).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        <span>{hackathon.currentParticipants}/{hackathon.maxParticipants || 'Unlimited'} participants</span>
                      </div>
                      {hackathon.prizes.length > 0 && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Trophy className="h-3 w-3" />
                          <span>{hackathon.prizes.length} prizes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditHackathon(hackathon)}
                        className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteHackathon(hackathon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create/Edit Hackathon Modal */}
        {showCreateHackathon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingHackathon ? 'Edit Hackathon' : 'Create New Hackathon'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateHackathon(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={editingHackathon ? handleUpdateHackathon : handleCreateHackathon} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={hackathonForm.title}
                    onChange={(e) => setHackathonForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter hackathon title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={hackathonForm.description}
                    onChange={(e) => setHackathonForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    placeholder="Brief description of your hackathon"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={hackathonForm.content}
                    onChange={(e) => setHackathonForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    placeholder="Detailed hackathon information, rules, and guidelines..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={hackathonForm.type}
                    onChange={(e) => setHackathonForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="competition">Competition</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={hackathonForm.startDate}
                      onChange={(e) => setHackathonForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={hackathonForm.endDate}
                      onChange={(e) => setHackathonForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={hackathonForm.registrationDeadline}
                      onChange={(e) => setHackathonForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={hackathonForm.maxParticipants}
                    onChange={(e) => setHackathonForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add tags"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {hackathonForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hackathonForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prizes</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentPrize}
                      onChange={(e) => setCurrentPrize(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrize())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add prizes"
                    />
                    <button
                      type="button"
                      onClick={addPrize}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {hackathonForm.prizes.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {hackathonForm.prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm text-gray-900">{prize}</span>
                          <button
                            type="button"
                            onClick={() => removePrize(prize)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentRequirement}
                      onChange={(e) => setCurrentRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add requirements"
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {hackathonForm.requirements.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {hackathonForm.requirements.map((requirement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm text-gray-900">{requirement}</span>
                          <button
                            type="button"
                            onClick={() => removeRequirement(requirement)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={hackathonForm.thumbnail}
                    onChange={(e) => setHackathonForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <select
                      value={hackathonForm.visibility}
                      onChange={(e) => setHackathonForm(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={hackathonForm.status}
                      onChange={(e) => setHackathonForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'ongoing' | 'completed' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateHackathon(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Saving..." />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{editingHackathon ? 'Update Hackathon' : 'Create Hackathon'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonPage;