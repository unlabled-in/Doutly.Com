import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: any;
}

export class NotificationService {
  // Create a new notification
  static async create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        read: false,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Subscribe to user notifications
  static subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Notification[];
        
        callback(notifications);
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      callback([]);
      return () => {};
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      // Note: In a real implementation, you'd use a batch write
      // For now, we'll handle this on the client side
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Create system notifications for different events
  static async createLeadAssignedNotification(userId: string, leadData: any): Promise<void> {
    await this.create({
      userId,
      title: 'New Lead Assigned',
      message: `You have been assigned a new lead: ${leadData.subject}`,
      type: 'info',
      actionUrl: '/tutor-dashboard',
      metadata: { leadId: leadData.id, type: 'lead_assigned' }
    });
  }

  static async createApplicationStatusNotification(userId: string, status: string, type: string): Promise<void> {
    const statusMessages = {
      approved: `Your ${type} application has been approved! 🎉`,
      rejected: `Your ${type} application has been reviewed. Please check your email for details.`,
      reviewed: `Your ${type} application is under review.`
    };

    await this.create({
      userId,
      title: 'Application Update',
      message: statusMessages[status as keyof typeof statusMessages] || 'Your application status has been updated.',
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
      metadata: { type: 'application_status', applicationStatus: status }
    });
  }

  static async createEventRegistrationNotification(userId: string, eventTitle: string, status: string): Promise<void> {
    const statusMessages = {
      approved: `Your registration for "${eventTitle}" has been approved! 🎉`,
      rejected: `Your registration for "${eventTitle}" was not approved. Please check your email for details.`
    };

    await this.create({
      userId,
      title: 'Event Registration Update',
      message: statusMessages[status as keyof typeof statusMessages] || 'Your event registration status has been updated.',
      type: status === 'approved' ? 'success' : 'error',
      actionUrl: '/events',
      metadata: { type: 'event_registration', eventTitle, status }
    });
  }

  static async createJobApplicationNotification(userId: string, jobTitle: string, status: string): Promise<void> {
    const statusMessages = {
      reviewed: `Your application for "${jobTitle}" is being reviewed.`,
      shortlisted: `Congratulations! You've been shortlisted for "${jobTitle}" 🎉`,
      hired: `Amazing! You've been selected for "${jobTitle}" 🎉`,
      rejected: `Thank you for your interest in "${jobTitle}". Please check your email for feedback.`
    };

    await this.create({
      userId,
      title: 'Job Application Update',
      message: statusMessages[status as keyof typeof statusMessages] || 'Your job application status has been updated.',
      type: status === 'shortlisted' || status === 'hired' ? 'success' : status === 'rejected' ? 'error' : 'info',
      actionUrl: '/careers',
      metadata: { type: 'job_application', jobTitle, status }
    });
  }
}