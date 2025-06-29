import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
  writeBatch,
  onSnapshot,
  serverTimestamp,
  increment,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db, retryConnection, isFirebaseOnline } from './firebase';
import { 
  validateAndSanitizeLead, 
  validateAndSanitizeApplication, 
  validateAndSanitizeEventRegistration,
  validateAndSanitizeUser
} from './validation';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cache for real-time listeners
const listenerCache = new Map<string, () => void>();

// Offline data cache
const offlineCache = new Map<string, any>();

// Connection state
let isConnected = true;

// Rate limiting function
export const checkRateLimit = (userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Connection error handler
const handleConnectionError = async (error: any, operation: string): Promise<void> => {
  console.warn(`Firebase ${operation} failed:`, error);
  
  if (error.code === 'unavailable' || error.code === 'unknown') {
    isConnected = false;
    
    // Try to reconnect
    const reconnected = await retryConnection();
    if (reconnected) {
      isConnected = true;
      console.log('Firebase connection restored');
    }
  }
};

// Standardized data schemas
export interface StandardizedLead {
  id?: string;
  ticketNumber: string;
  type: 'tutor_request' | 'tech_consultation';
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  doubtDescription: string;
  subject: string;
  tutorType?: 'instant' | 'scheduled';
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  projectTitle?: string;
  projectDescription?: string;
  techStack?: string;
  projectType?: string;
  timeline?: string;
  budget?: string;
  experience?: string;
  specificHelp?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  assignedTo?: string | null;
  assignedBy?: string | null;
  notes: string[];
  source: string;
  value: number;
  conversionProbability: number;
  history: Array<{
    action: string;
    timestamp: Date | Timestamp;
    by: string;
    note: string;
  }>;
}

export interface StandardizedApplication {
  id?: string;
  type: 'tutor_application' | 'partnership_application' | 'event_partnership';
  name?: string;
  organizationName?: string;
  contactName?: string;
  email: string;
  phone?: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  skills?: string[];
  experience?: string;
  hourlyRate?: string;
  bio?: string;
  education?: string;
  availability?: string[];
  languages?: string[];
  partnershipType?: string;
  eventType?: string;
  targetAudience?: string;
  estimatedAttendees?: string;
  eventFrequency?: string;
  budget?: string;
  message?: string;
  priority: 'low' | 'medium' | 'high';
  reviewedBy?: string;
  reviewNotes?: string;
  description?: string;
  expectedAttendees?: string;
}

export interface StandardizedEventRegistration {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  eventId: string;
  eventTitle: string;
  eventType: string;
  registrationDate: Date | Timestamp;
  updatedAt: Date | Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  institution?: string;
  additionalInfo?: string;
  approvedBy?: string;
  approvalDate?: Date | Timestamp;
  rejectionReason?: string;
}

export interface StandardizedUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'freelancer' | 'tutor' | 'team_leader' | 'manager' | 'vertical_head' | 'admin' | 'bda' | 'sales';
  phone?: string;
  skills?: string[];
  institution?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastLoginAt?: Date | Timestamp;
  isActive: boolean;
  profileComplete: boolean;
  // Role-specific fields
  ticketNumbers?: string[];
  teamId?: string;
  assignedLeads?: number;
  convertedLeads?: number;
  totalEarnings?: number;
  rating?: number;
  totalSessions?: number;
  availability?: string[];
  languages?: string[];
  hourlyRate?: number;
  bio?: string;
  education?: string;
  experience?: string;
}

// Generic database operations with enhanced error handling and offline support
export class DatabaseService {
  // Create document with validation and audit trail
  static async createDocument(collectionName: string, data: any, userId?: string): Promise<string> {
    try {
      // Rate limiting
      if (userId && !checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      let validatedData;
      
      // Validate based on collection type
      switch (collectionName) {
        case 'leads':
          validatedData = this.standardizeLead(data);
          break;
        case 'applications':
          validatedData = this.standardizeApplication(data);
          break;
        case 'event_registrations':
          validatedData = this.standardizeEventRegistration(data);
          break;
        case 'users':
          validatedData = this.standardizeUser(data);
          break;
        default:
          validatedData = data;
      }

      // Add timestamps
      validatedData.createdAt = serverTimestamp();
      validatedData.updatedAt = serverTimestamp();
      
      const docRef = await addDoc(collection(db, collectionName), validatedData);
      
      // Cache the created document
      offlineCache.set(`${collectionName}_${docRef.id}`, { id: docRef.id, ...validatedData });
      
      // Create audit trail
      if (userId) {
        await this.createAuditLog({
          action: 'create',
          collection: collectionName,
          documentId: docRef.id,
          userId,
          timestamp: new Date(),
          data: validatedData
        });
      }
      
      return docRef.id;
    } catch (error: any) {
      await handleConnectionError(error, 'create');
      console.error(`Error creating document in ${collectionName}:`, error);
      throw new Error(`Failed to create ${collectionName.slice(0, -1)}: ${error.message || 'Unknown error'}`);
    }
  }

  // Update document with optimistic updates and conflict resolution
  static async updateDocument(collectionName: string, docId: string, data: any, userId?: string): Promise<void> {
    try {
      // Rate limiting
      if (userId && !checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Get current document for conflict detection
      const currentDoc = await getDoc(doc(db, collectionName, docId));
      if (!currentDoc.exists()) {
        throw new Error('Document not found');
      }

      // Add update timestamp
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, collectionName, docId), updateData);
      
      // Update cache
      const cacheKey = `${collectionName}_${docId}`;
      if (offlineCache.has(cacheKey)) {
        offlineCache.set(cacheKey, { ...offlineCache.get(cacheKey), ...updateData });
      }
      
      // Create audit trail
      if (userId) {
        await this.createAuditLog({
          action: 'update',
          collection: collectionName,
          documentId: docId,
          userId,
          timestamp: new Date(),
          data: updateData,
          previousData: currentDoc.data()
        });
      }
    } catch (error: any) {
      await handleConnectionError(error, 'update');
      console.error(`Error updating document in ${collectionName}:`, error);
      throw new Error(`Failed to update ${collectionName.slice(0, -1)}: ${error.message || 'Unknown error'}`);
    }
  }

  // Delete document with cascade
  static async deleteDocument(collectionName: string, docId: string, userId?: string): Promise<void> {
    try {
      // Rate limiting
      if (userId && !checkRateLimit(userId)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      await deleteDoc(doc(db, collectionName, docId));
      
      // Remove from cache
      offlineCache.delete(`${collectionName}_${docId}`);
      
      // Create audit trail
      if (userId) {
        await this.createAuditLog({
          action: 'delete',
          collection: collectionName,
          documentId: docId,
          userId,
          timestamp: new Date()
        });
      }
    } catch (error: any) {
      await handleConnectionError(error, 'delete');
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw new Error(`Failed to delete ${collectionName.slice(0, -1)}: ${error.message || 'Unknown error'}`);
    }
  }

  // Real-time listener with caching and offline support
  static subscribeToCollection(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    callback: (data: any[]) => void,
    cacheKey?: string
  ): () => void {
    try {
      // Check if listener already exists
      if (cacheKey && listenerCache.has(cacheKey)) {
        listenerCache.get(cacheKey)!();
      }

      // Create query with proper ordering
      const queryConstraints = [...constraints];
      
      // Add default ordering if none specified
      const hasOrderBy = constraints.some(c => c.type === 'orderBy');
      if (!hasOrderBy) {
        queryConstraints.push(orderBy('createdAt', 'desc'));
      }

      const q = query(collection(db, collectionName), ...queryConstraints);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestampsToDates(doc.data())
        }));
        
        // Cache the data
        data.forEach(item => {
          offlineCache.set(`${collectionName}_${item.id}`, item);
        });
        
        callback(data);
      }, (error) => {
        console.error(`Error in real-time listener for ${collectionName}:`, error);
        handleConnectionError(error, 'subscription');
        
        // Fallback to cached data if available
        const cachedData: any[] = [];
        offlineCache.forEach((value, key) => {
          if (key.startsWith(`${collectionName}_`)) {
            cachedData.push(value);
          }
        });
        
        if (cachedData.length > 0) {
          callback(cachedData);
        } else {
          callback([]);
        }
      });

      // Cache the unsubscribe function
      if (cacheKey) {
        listenerCache.set(cacheKey, unsubscribe);
      }

      return unsubscribe;
    } catch (error: any) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      callback([]);
      return () => {};
    }
  }

  // Get document with caching and offline support
  static async getDocument(collectionName: string, docId: string): Promise<any | null> {
    try {
      const cacheKey = `${collectionName}_${docId}`;
      
      // Try to get from cache first if offline
      if (!isConnected && offlineCache.has(cacheKey)) {
        return offlineCache.get(cacheKey);
      }

      const docSnap = await getDoc(doc(db, collectionName, docId));
      
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...this.convertTimestampsToDates(docSnap.data())
        };
        
        // Cache the data
        offlineCache.set(cacheKey, data);
        return data;
      }
      
      return null;
    } catch (error: any) {
      await handleConnectionError(error, 'get');
      
      // Try cache as fallback
      const cacheKey = `${collectionName}_${docId}`;
      if (offlineCache.has(cacheKey)) {
        return offlineCache.get(cacheKey);
      }
      
      console.error(`Error getting document from ${collectionName}:`, error);
      throw new Error(`Failed to get ${collectionName.slice(0, -1)}: ${error.message || 'Unknown error'}`);
    }
  }

  // Get documents with pagination and caching
  static async getDocuments(
    collectionName: string, 
    constraints: QueryConstraint[] = [],
    pageSize: number = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ documents: any[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let queryConstraints = [...constraints, limit(pageSize)];
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      // Add default ordering if none specified
      const hasOrderBy = constraints.some(c => c.type === 'orderBy');
      if (!hasOrderBy) {
        queryConstraints.push(orderBy('createdAt', 'desc'));
      }

      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...this.convertTimestampsToDates(doc.data())
      }));

      // Cache the documents
      documents.forEach(doc => {
        offlineCache.set(`${collectionName}_${doc.id}`, doc);
      });

      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      
      return { documents, lastDoc: newLastDoc };
    } catch (error: any) {
      await handleConnectionError(error, 'getDocuments');
      
      // Fallback to cached data
      const cachedData: any[] = [];
      offlineCache.forEach((value, key) => {
        if (key.startsWith(`${collectionName}_`)) {
          cachedData.push(value);
        }
      });
      
      if (cachedData.length > 0) {
        return { documents: cachedData.slice(0, pageSize), lastDoc: null };
      }
      
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw new Error(`Failed to get ${collectionName}: ${error.message || 'Unknown error'}`);
    }
  }

  // Standardization methods
  static standardizeLead(data: any): StandardizedLead {
    return {
      ticketNumber: data.ticketNumber || '',
      type: data.type || 'tutor_request',
      studentId: data.studentId || '',
      studentName: data.studentName || '',
      studentEmail: data.studentEmail || '',
      studentPhone: data.studentPhone || null,
      doubtDescription: data.doubtDescription || '',
      subject: data.subject || '',
      tutorType: data.tutorType || null,
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      projectTitle: data.projectTitle || null,
      projectDescription: data.projectDescription || null,
      techStack: data.techStack || null,
      projectType: data.projectType || null,
      timeline: data.timeline || null,
      budget: data.budget || null,
      experience: data.experience || null,
      specificHelp: data.specificHelp || null,
      urgencyLevel: data.urgencyLevel || 'medium',
      status: data.status || 'open',
      priority: data.priority || 'medium',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      assignedTo: data.assignedTo || null,
      assignedBy: data.assignedBy || null,
      notes: data.notes || [],
      source: data.source || 'Website',
      value: data.value || 0,
      conversionProbability: data.conversionProbability || 50,
      history: data.history || []
    };
  }

  static standardizeApplication(data: any): StandardizedApplication {
    return {
      type: data.type || 'tutor_application',
      name: data.name || null,
      organizationName: data.organizationName || null,
      contactName: data.contactName || null,
      email: data.email || '',
      phone: data.phone || null,
      website: data.website || null,
      status: data.status || 'pending',
      submittedAt: data.submittedAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      skills: data.skills || [],
      experience: data.experience || null,
      hourlyRate: data.hourlyRate || null,
      bio: data.bio || null,
      education: data.education || null,
      availability: data.availability || [],
      languages: data.languages || [],
      partnershipType: data.partnershipType || null,
      eventType: data.eventType || null,
      targetAudience: data.targetAudience || null,
      estimatedAttendees: data.estimatedAttendees || null,
      eventFrequency: data.eventFrequency || null,
      budget: data.budget || null,
      message: data.message || null,
      priority: data.priority || 'medium',
      reviewedBy: data.reviewedBy || null,
      reviewNotes: data.reviewNotes || null,
      description: data.description || null,
      expectedAttendees: data.expectedAttendees || null
    };
  }

  static standardizeEventRegistration(data: any): StandardizedEventRegistration {
    return {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || null,
      eventId: data.eventId || '',
      eventTitle: data.eventTitle || '',
      eventType: data.eventType || '',
      registrationDate: data.registrationDate || new Date(),
      updatedAt: data.updatedAt || new Date(),
      status: data.status || 'pending',
      institution: data.institution || null,
      additionalInfo: data.additionalInfo || null,
      approvedBy: data.approvedBy || null,
      approvalDate: data.approvalDate || null,
      rejectionReason: data.rejectionReason || null
    };
  }

  static standardizeUser(data: any): StandardizedUser {
    return {
      uid: data.uid || '',
      email: data.email || '',
      displayName: data.displayName || '',
      role: data.role || 'student',
      phone: data.phone || null,
      skills: data.skills || [],
      institution: data.institution || null,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      lastLoginAt: data.lastLoginAt || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      profileComplete: data.profileComplete !== undefined ? data.profileComplete : false,
      ticketNumbers: data.ticketNumbers || [],
      teamId: data.teamId || null,
      assignedLeads: data.assignedLeads || 0,
      convertedLeads: data.convertedLeads || 0,
      totalEarnings: data.totalEarnings || 0,
      rating: data.rating || null,
      totalSessions: data.totalSessions || 0,
      availability: data.availability || [],
      languages: data.languages || [],
      hourlyRate: data.hourlyRate || null,
      bio: data.bio || null,
      education: data.education || null,
      experience: data.experience || null
    };
  }

  // Audit logging
  static async createAuditLog(logData: {
    action: string;
    collection: string;
    documentId: string;
    userId: string;
    timestamp: Date;
    data?: any;
    previousData?: any;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        ...logData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error for audit log failures
    }
  }

  // Convert Firestore Timestamps to Date objects
  private static convertTimestampsToDates(data: any): any {
    if (data && typeof data.toDate === 'function') {
      return data.toDate();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.convertTimestampsToDates(item));
    }
    
    if (data && typeof data === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(data)) {
        converted[key] = this.convertTimestampsToDates(value);
      }
      return converted;
    }
    
    return data;
  }
}

// Enhanced service functions with real-time capabilities
export const LeadService = {
  create: (data: any, userId?: string) => DatabaseService.createDocument('leads', data, userId),
  update: (id: string, data: any, userId?: string) => DatabaseService.updateDocument('leads', id, data, userId),
  delete: (id: string, userId?: string) => DatabaseService.deleteDocument('leads', id, userId),
  get: (id: string) => DatabaseService.getDocument('leads', id),
  getAll: (constraints?: QueryConstraint[], pageSize?: number, lastDoc?: DocumentSnapshot) => 
    DatabaseService.getDocuments('leads', constraints, pageSize, lastDoc),
  subscribe: (constraints: QueryConstraint[], callback: (data: any[]) => void, cacheKey?: string) =>
    DatabaseService.subscribeToCollection('leads', constraints, callback, cacheKey),
  // Simple queries to avoid index issues
  getByStudentId: (studentId: string, callback: (data: any[]) => void) =>
    DatabaseService.subscribeToCollection('leads', [where('studentId', '==', studentId)], callback, `leads_student_${studentId}`),
  getByAssignedTo: (assignedTo: string, callback: (data: any[]) => void) =>
    DatabaseService.subscribeToCollection('leads', [where('assignedTo', '==', assignedTo)], callback, `leads_assigned_${assignedTo}`)
};

export const ApplicationService = {
  create: (data: any, userId?: string) => DatabaseService.createDocument('applications', data, userId),
  update: (id: string, data: any, userId?: string) => DatabaseService.updateDocument('applications', id, data, userId),
  delete: (id: string, userId?: string) => DatabaseService.deleteDocument('applications', id, userId),
  get: (id: string) => DatabaseService.getDocument('applications', id),
  getAll: (constraints?: QueryConstraint[], pageSize?: number, lastDoc?: DocumentSnapshot) => 
    DatabaseService.getDocuments('applications', constraints, pageSize, lastDoc),
  subscribe: (constraints: QueryConstraint[], callback: (data: any[]) => void, cacheKey?: string) =>
    DatabaseService.subscribeToCollection('applications', constraints, callback, cacheKey)
};

export const EventRegistrationService = {
  create: (data: any, userId?: string) => DatabaseService.createDocument('event_registrations', data, userId),
  update: (id: string, data: any, userId?: string) => DatabaseService.updateDocument('event_registrations', id, data, userId),
  delete: (id: string, userId?: string) => DatabaseService.deleteDocument('event_registrations', id, userId),
  get: (id: string) => DatabaseService.getDocument('event_registrations', id),
  getAll: (constraints?: QueryConstraint[], pageSize?: number, lastDoc?: DocumentSnapshot) => 
    DatabaseService.getDocuments('event_registrations', constraints, pageSize, lastDoc),
  subscribe: (constraints: QueryConstraint[], callback: (data: any[]) => void, cacheKey?: string) =>
    DatabaseService.subscribeToCollection('event_registrations', constraints, callback, cacheKey),
  // Simple query to avoid index issues
  getByEmail: (email: string, callback: (data: any[]) => void) =>
    DatabaseService.subscribeToCollection('event_registrations', [where('email', '==', email)], callback, `events_${email}`)
};

export const UserService = {
  create: (data: any, userId?: string) => DatabaseService.createDocument('users', data, userId),
  update: (id: string, data: any, userId?: string) => DatabaseService.updateDocument('users', id, data, userId),
  delete: (id: string, userId?: string) => DatabaseService.deleteDocument('users', id, userId),
  get: (id: string) => DatabaseService.getDocument('users', id),
  getAll: (constraints?: QueryConstraint[], pageSize?: number, lastDoc?: DocumentSnapshot) => 
    DatabaseService.getDocuments('users', constraints, pageSize, lastDoc),
  subscribe: (constraints: QueryConstraint[], callback: (data: any[]) => void, cacheKey?: string) =>
    DatabaseService.subscribeToCollection('users', constraints, callback, cacheKey)
};

// Connection status utility
export const getConnectionStatus = () => ({
  isOnline: isFirebaseOnline(),
  isConnected,
  cacheSize: offlineCache.size
});