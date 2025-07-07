import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Mail,
  Phone,
  Building,
  Award
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import BackButton from '../../components/BackButton';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventTitle: string;
  eventType: string;
  registrationDate: any;
  status: 'pending' | 'approved' | 'rejected';
  institution?: string;
  additionalInfo?: string;
}

const RegistrationManagement: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    // In a real implementation, you would fetch from Firebase
    setLoading(true);
    const registrationsRef = collection(db, 'registrations');
    const q = query(registrationsRef, orderBy('registrationDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRegistrations: Registration[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Registration[];
      setRegistrations(fetchedRegistrations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = registrations;

    if (filter !== 'all') {
      filtered = filtered.filter(reg => reg.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRegistrations(filtered);
  }, [registrations, filter, searchTerm]);

  const handleStatusUpdate = async (registrationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // In a real implementation, update Firebase
      const registrationRef = doc(db, 'registrations', registrationId);
      await updateDoc(registrationRef, { status: newStatus });
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: newStatus }
            : reg
        )
      );
    } catch (error) {
      console.error('Error updating registration status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'competition': return 'bg-red-100 text-red-800';
      case 'networking': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      label: 'Total Registrations',
      value: registrations.length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Pending Review',
      value: registrations.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      label: 'Approved',
      value: registrations.filter(r => r.status === 'approved').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Rejected',
      value: registrations.filter(r => r.status === 'rejected').length,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton to="/admin-dashboard" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Registration Management</h1>
          <p className="text-gray-600 mt-2">
            Manage event registrations and approve participants
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search registrations..."
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
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredRegistrations.length} of {registrations.length} registrations
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading registrations...</p>
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No registrations found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                          <div className="text-sm text-gray-500">{registration.email}</div>
                          {registration.phone && (
                            <div className="text-sm text-gray-500">{registration.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{registration.eventTitle}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(registration.eventType)}`}>
                            {registration.eventType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.registrationDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRegistration(registration)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {registration.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(registration.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(registration.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registration Detail Modal */}
        {selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Registration Details</h3>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedRegistration.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedRegistration.email}</p>
                  </div>
                  {selectedRegistration.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedRegistration.phone}</p>
                    </div>
                  )}
                  {selectedRegistration.institution && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Institution</label>
                      <p className="text-gray-900">{selectedRegistration.institution}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Event</label>
                  <p className="text-gray-900">{selectedRegistration.eventTitle}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(selectedRegistration.eventType)} mt-1`}>
                    {selectedRegistration.eventType}
                  </span>
                </div>
                {selectedRegistration.additionalInfo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Additional Information</label>
                    <p className="text-gray-900">{selectedRegistration.additionalInfo}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRegistration.status)} ml-2`}>
                    {selectedRegistration.status}
                  </span>
                </div>
                {selectedRegistration.status === 'pending' && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedRegistration.id, 'approved');
                        setSelectedRegistration(null);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedRegistration.id, 'rejected');
                        setSelectedRegistration(null);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationManagement;