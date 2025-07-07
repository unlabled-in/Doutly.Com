import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar, 
  Tag, 
  Image as ImageIcon,
  Save,
  X,
  Search,
  Filter,
  Clock,
  User,
  Globe,
  Lock
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { sanitizeInput } from '../lib/validation';

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  thumbnail?: string;
  visibility: 'public' | 'private';
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: any;
  authorId: string;
  authorName: string;
  createdAt: any;
  updatedAt: any;
  views: number;
  likes: number;
}

const CreatorPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    content: '',
    tags: [] as string[],
    thumbnail: '',
    visibility: 'public' as 'public' | 'private',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    publishDate: ''
  });
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) return;

    // Subscribe to posts created by this user
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const resetForm = () => {
    setPostForm({
      title: '',
      description: '',
      content: '',
      tags: [],
      thumbnail: '',
      visibility: 'public',
      status: 'draft',
      publishDate: ''
    });
    setCurrentTag('');
    setEditingPost(null);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    try {
      const postData = {
        ...postForm,
        title: sanitizeInput(postForm.title),
        description: sanitizeInput(postForm.description),
        content: sanitizeInput(postForm.content),
        tags: Array.isArray(postForm.tags) ? postForm.tags.map(sanitizeInput) : [],
        thumbnail: sanitizeInput(postForm.thumbnail || ''),
        authorId: userProfile.uid,
        authorName: userProfile.displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
        publishDate: postForm.publishDate ? new Date(postForm.publishDate) : null
      };

      await addDoc(collection(db, 'posts'), postData);
      resetForm();
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setLoading(true);
    try {
      const updateData = {
        ...postForm,
        title: sanitizeInput(postForm.title),
        description: sanitizeInput(postForm.description),
        content: sanitizeInput(postForm.content),
        tags: Array.isArray(postForm.tags) ? postForm.tags.map(sanitizeInput) : [],
        thumbnail: sanitizeInput(postForm.thumbnail || ''),
        updatedAt: new Date(),
        publishDate: postForm.publishDate ? new Date(postForm.publishDate) : null
      };

      await updateDoc(doc(db, 'posts', editingPost.id), updateData);
      resetForm();
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      description: post.description,
      content: post.content,
      tags: post.tags,
      thumbnail: post.thumbnail || '',
      visibility: post.visibility,
      status: post.status,
      publishDate: post.publishDate ? new Date(post.publishDate.toDate()).toISOString().slice(0, 16) : ''
    });
    setShowCreatePost(true);
  };

  const addTag = () => {
    if (currentTag.trim() && !postForm.tags.includes(currentTag.trim())) {
      setPostForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPostForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Create and manage your posts, articles, and content
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreatePost(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter(p => p.status === 'published').length}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.reduce((sum, post) => sum + (post.views || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter(p => p.status === 'draft').length}
                </p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Edit className="h-6 w-6 text-orange-600" />
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
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <LoadingSpinner text="Loading posts..." />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Edit className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Create your first post to get started</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreatePost(true);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const VisibilityIcon = getVisibilityIcon(post.visibility);
              return (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {post.thumbnail && (
                    <img 
                      src={post.thumbnail} 
                      alt={`Post: ${post.title}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      width="400"
                      height="192"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <VisibilityIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{post.visibility}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.description}
                    </p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(post.createdAt?.toDate?.() || post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
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

        {/* Create/Edit Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingPost ? 'Edit Post' : 'Create New Post'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={postForm.description}
                    onChange={(e) => setPostForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Brief description of your post"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Write your post content here..."
                    required
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add tags"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {postForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={postForm.thumbnail}
                    onChange={(e) => setPostForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                    <select
                      value={postForm.visibility}
                      onChange={(e) => setPostForm(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={postForm.status}
                      onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Publish Now</option>
                      <option value="scheduled">Schedule</option>
                    </select>
                  </div>

                  {postForm.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                      <input
                        type="datetime-local"
                        value={postForm.publishDate}
                        onChange={(e) => setPostForm(prev => ({ ...prev, publishDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePost(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Saving..." />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{editingPost ? 'Update Post' : 'Create Post'}</span>
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

export default CreatorPage;