import { z } from 'zod';

// User validation schemas
const userProfileSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['student', 'freelancer', 'tutor', 'team_leader', 'manager', 'vertical_head', 'admin', 'bda', 'sales']),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  institution: z.string().optional(),
  createdAt: z.date(),
  ticketNumbers: z.array(z.string()).optional(),
  teamId: z.string().optional(),
  assignedLeads: z.number().optional(),
  convertedLeads: z.number().optional(),
  totalEarnings: z.number().optional(),
});

// Lead validation schema
const leadSchema = z.object({
  ticketNumber: z.string().min(1, 'Ticket number is required'),
  type: z.string().min(1, 'Type is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  studentEmail: z.string().email('Invalid email format'),
  studentPhone: z.string().optional(),
  doubtDescription: z.string().min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(1, 'Subject is required'),
  tutorType: z.enum(['instant', 'scheduled']).optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedTo: z.string().optional(),
  assignedBy: z.string().optional(),
  notes: z.array(z.string()).default([]),
  source: z.string().default('Website'),
  value: z.number().default(0),
  conversionProbability: z.number().min(0).max(100).default(50),
  history: z.array(z.object({
    action: z.string(),
    timestamp: z.date(),
    by: z.string(),
    note: z.string()
  })).default([])
});

// Application validation schema
const applicationSchema = z.object({
  type: z.enum(['tutor_application', 'partnership_application']),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  submittedAt: z.date(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  hourlyRate: z.string().optional(),
  bio: z.string().optional(),
  partnershipType: z.string().optional(),
  eventType: z.string().optional(),
  targetAudience: z.string().optional(),
  estimatedAttendees: z.string().optional(),
  message: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Event registration validation schema
const eventRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  eventId: z.string().min(1, 'Event ID is required'),
  eventTitle: z.string().min(1, 'Event title is required'),
  eventType: z.string().min(1, 'Event type is required'),
  registrationDate: z.date(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  institution: z.string().optional(),
  additionalInfo: z.string().optional()
});

// Input sanitization functions
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+\-\s()]/g, '').trim();
};

// Validation helper functions
export const validateAndSanitizeUser = (userData: any) => {
  const sanitized = {
    ...userData,
    displayName: sanitizeInput(userData.displayName),
    email: sanitizeEmail(userData.email),
    phone: userData.phone ? sanitizePhone(userData.phone) : undefined,
    institution: userData.institution ? sanitizeInput(userData.institution) : undefined,
  };
  
  return userProfileSchema.parse(sanitized);
};

export const validateAndSanitizeLead = (leadData: any) => {
  const sanitized = {
    ...leadData,
    studentName: sanitizeInput(leadData.studentName),
    studentEmail: sanitizeEmail(leadData.studentEmail),
    studentPhone: leadData.studentPhone ? sanitizePhone(leadData.studentPhone) : undefined,
    doubtDescription: sanitizeInput(leadData.doubtDescription),
    subject: sanitizeInput(leadData.subject),
  };
  
  return leadSchema.parse(sanitized);
};

export const validateAndSanitizeApplication = (appData: any) => {
  const sanitized = {
    ...appData,
    name: appData.name ? sanitizeInput(appData.name) : undefined,
    organizationName: appData.organizationName ? sanitizeInput(appData.organizationName) : undefined,
    email: sanitizeEmail(appData.email),
    phone: appData.phone ? sanitizePhone(appData.phone) : undefined,
    bio: appData.bio ? sanitizeInput(appData.bio) : undefined,
    message: appData.message ? sanitizeInput(appData.message) : undefined,
  };
  
  return applicationSchema.parse(sanitized);
};

export const validateAndSanitizeEventRegistration = (regData: any) => {
  const sanitized = {
    ...regData,
    name: sanitizeInput(regData.name),
    email: sanitizeEmail(regData.email),
    phone: regData.phone ? sanitizePhone(regData.phone) : undefined,
    eventTitle: sanitizeInput(regData.eventTitle),
    eventType: sanitizeInput(regData.eventType),
    institution: regData.institution ? sanitizeInput(regData.institution) : undefined,
    additionalInfo: regData.additionalInfo ? sanitizeInput(regData.additionalInfo) : undefined,
  };
  
  return eventRegistrationSchema.parse(sanitized);
};