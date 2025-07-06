import { z } from 'zod';

// Enhanced validation schemas with security measures
export const userProfileSchema = z.object({
  uid: z.string().min(1, 'User ID is required').max(128),
  email: z.string().email('Invalid email format').max(254),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  role: z.enum(['student', 'freelancer', 'tutor', 'team_leader', 'manager', 'vertical_head', 'admin', 'bda', 'sales']),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  institution: z.string().max(200).optional(),
  createdAt: z.date(),
  ticketNumbers: z.array(z.string().max(50)).max(100).optional(),
  teamId: z.string().max(50).optional(),
  assignedLeads: z.number().min(0).max(10000).optional(),
  convertedLeads: z.number().min(0).max(10000).optional(),
  totalEarnings: z.number().min(0).max(10000000).optional(),
});

export const leadSchema = z.object({
  ticketNumber: z.string().min(1, 'Ticket number is required').max(50),
  type: z.string().min(1, 'Type is required').max(50),
  studentId: z.string().min(1, 'Student ID is required').max(128),
  studentName: z.string().min(2, 'Student name must be at least 2 characters').max(100),
  studentEmail: z.string().email('Invalid email format').max(254),
  studentPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
  doubtDescription: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  subject: z.string().min(1, 'Subject is required').max(200),
  tutorType: z.enum(['instant', 'scheduled']).optional(),
  scheduledDate: z.string().max(50).optional(),
  scheduledTime: z.string().max(50).optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedTo: z.string().max(254).optional(),
  assignedBy: z.string().max(100).optional(),
  notes: z.array(z.string().max(1000)).max(50).default([]),
  source: z.string().max(100).default('Website'),
  value: z.number().min(0).max(1000000).default(0),
  conversionProbability: z.number().min(0).max(100).default(50),
  history: z.array(z.object({
    action: z.string().max(100),
    timestamp: z.date(),
    by: z.string().max(100),
    note: z.string().max(500)
  })).max(100).default([])
});

export const applicationSchema = z.object({
  type: z.enum(['tutor_application', 'partnership_application', 'event_partnership']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(200).optional(),
  email: z.string().email('Invalid email format').max(254),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  submittedAt: z.date(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  experience: z.string().max(1000).optional(),
  hourlyRate: z.string().max(50).optional(),
  bio: z.string().max(2000).optional(),
  partnershipType: z.string().max(100).optional(),
  eventType: z.string().max(100).optional(),
  targetAudience: z.string().max(200).optional(),
  estimatedAttendees: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export const eventRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format').max(254),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
  eventId: z.string().min(1, 'Event ID is required').max(128),
  eventTitle: z.string().min(1, 'Event title is required').max(200),
  eventType: z.string().min(1, 'Event type is required').max(100),
  registrationDate: z.date(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  institution: z.string().max(200).optional(),
  additionalInfo: z.string().max(1000).optional()
});

export const jobApplicationSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  jobId: z.string().min(1, 'Job ID is required').max(128),
  applicantName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  applicantEmail: z.string().email('Invalid email format').max(254),
  applicantPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(5000),
  resumeLink: z.string().url('Invalid URL format').max(500).optional(),
  experience: z.string().max(1000).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).default('pending'),
  submittedAt: z.date(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export const hackathonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  content: z.string().min(50, 'Content must be at least 50 characters').max(10000),
  tags: z.array(z.string().max(50)).max(20),
  thumbnail: z.string().url('Invalid URL format').max(500).optional(),
  visibility: z.enum(['public', 'private']),
  status: z.enum(['draft', 'published', 'ongoing', 'completed']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  registrationDeadline: z.date().optional(),
  maxParticipants: z.number().min(1).max(10000).optional(),
  prizes: z.array(z.string().max(200)).max(10),
  requirements: z.array(z.string().max(500)).max(20),
  authorId: z.string().max(128),
  authorName: z.string().max(100),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  department: z.string().min(1, 'Department is required').max(100),
  location: z.string().min(1, 'Location is required').max(100),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  experience: z.string().max(100),
  salary: z.string().max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  requirements: z.array(z.string().max(500)).max(20),
  benefits: z.array(z.string().max(200)).max(20),
  posted: z.string().max(50),
  status: z.enum(['active', 'inactive', 'closed']).default('active'),
  authorId: z.string().max(128),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 10000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().substring(0, 254);
};

export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^\d+\-\s()]/g, '').trim().substring(0, 20);
};

export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return url.substring(0, 500);
  } catch {
    return '';
  }
};

// Validation helper functions with enhanced security
export const validateAndSanitizeUser = (userData: any) => {
  const sanitized = {
    ...userData,
    displayName: sanitizeInput(userData.displayName || ''),
    email: sanitizeEmail(userData.email || ''),
    phone: userData.phone ? sanitizePhone(userData.phone) : undefined,
    institution: userData.institution ? sanitizeInput(userData.institution) : undefined,
    skills: Array.isArray(userData.skills) ? userData.skills.map((s: any) => sanitizeInput(s)).filter(Boolean).slice(0, 20) : undefined,
  };
  
  return userProfileSchema.parse(sanitized);
};

export const validateAndSanitizeLead = (leadData: any) => {
  const sanitized = {
    ...leadData,
    studentName: sanitizeInput(leadData.studentName || ''),
    studentEmail: sanitizeEmail(leadData.studentEmail || ''),
    studentPhone: leadData.studentPhone ? sanitizePhone(leadData.studentPhone) : undefined,
    doubtDescription: sanitizeInput(leadData.doubtDescription || ''),
    subject: sanitizeInput(leadData.subject || ''),
    assignedTo: leadData.assignedTo ? sanitizeEmail(leadData.assignedTo) : undefined,
    assignedBy: leadData.assignedBy ? sanitizeInput(leadData.assignedBy) : undefined,
    notes: Array.isArray(leadData.notes) ? leadData.notes.map((n: any) => sanitizeInput(n)).filter(Boolean).slice(0, 50) : [],
  };
  
  return leadSchema.parse(sanitized);
};

export const validateAndSanitizeApplication = (appData: any) => {
  const sanitized = {
    ...appData,
    name: appData.name ? sanitizeInput(appData.name) : undefined,
    organizationName: appData.organizationName ? sanitizeInput(appData.organizationName) : undefined,
    email: sanitizeEmail(appData.email || ''),
    phone: appData.phone ? sanitizePhone(appData.phone) : undefined,
    bio: appData.bio ? sanitizeInput(appData.bio) : undefined,
    message: appData.message ? sanitizeInput(appData.message) : undefined,
    skills: Array.isArray(appData.skills) ? appData.skills.map((s: any) => sanitizeInput(s)).filter(Boolean).slice(0, 20) : undefined,
  };
  
  return applicationSchema.parse(sanitized);
};

export const validateAndSanitizeEventRegistration = (regData: any) => {
  const sanitized = {
    ...regData,
    name: sanitizeInput(regData.name || ''),
    email: sanitizeEmail(regData.email || ''),
    phone: regData.phone ? sanitizePhone(regData.phone) : undefined,
    eventTitle: sanitizeInput(regData.eventTitle || ''),
    eventType: sanitizeInput(regData.eventType || ''),
    institution: regData.institution ? sanitizeInput(regData.institution) : undefined,
    additionalInfo: regData.additionalInfo ? sanitizeInput(regData.additionalInfo) : undefined,
  };
  
  return eventRegistrationSchema.parse(sanitized);
};

export const validateAndSanitizeJobApplication = (appData: any) => {
  const sanitized = {
    ...appData,
    applicantName: sanitizeInput(appData.applicantName || ''),
    applicantEmail: sanitizeEmail(appData.applicantEmail || ''),
    applicantPhone: appData.applicantPhone ? sanitizePhone(appData.applicantPhone) : undefined,
    coverLetter: sanitizeInput(appData.coverLetter || ''),
    resumeLink: appData.resumeLink ? sanitizeUrl(appData.resumeLink) : undefined,
    experience: appData.experience ? sanitizeInput(appData.experience) : undefined,
    skills: Array.isArray(appData.skills) ? appData.skills.map((s: any) => sanitizeInput(s)).filter(Boolean).slice(0, 20) : undefined,
  };
  
  return jobApplicationSchema.parse(sanitized);
};

export const validateAndSanitizeHackathon = (hackathonData: any) => {
  const sanitized = {
    ...hackathonData,
    title: sanitizeInput(hackathonData.title || ''),
    description: sanitizeInput(hackathonData.description || ''),
    content: sanitizeInput(hackathonData.content || ''),
    tags: Array.isArray(hackathonData.tags) ? hackathonData.tags.map((t: any) => sanitizeInput(t)).filter(Boolean).slice(0, 20) : [],
    thumbnail: hackathonData.thumbnail ? sanitizeUrl(hackathonData.thumbnail) : undefined,
    prizes: Array.isArray(hackathonData.prizes) ? hackathonData.prizes.map((p: any) => sanitizeInput(p)).filter(Boolean).slice(0, 10) : [],
    requirements: Array.isArray(hackathonData.requirements) ? hackathonData.requirements.map((r: any) => sanitizeInput(r)).filter(Boolean).slice(0, 20) : [],
    authorName: sanitizeInput(hackathonData.authorName || ''),
  };
  
  return hackathonSchema.parse(sanitized);
};

export const validateAndSanitizeJob = (jobData: any) => {
  const sanitized = {
    ...jobData,
    title: sanitizeInput(jobData.title || ''),
    department: sanitizeInput(jobData.department || ''),
    location: sanitizeInput(jobData.location || ''),
    experience: sanitizeInput(jobData.experience || ''),
    salary: sanitizeInput(jobData.salary || ''),
    description: sanitizeInput(jobData.description || ''),
    requirements: Array.isArray(jobData.requirements) ? jobData.requirements.map((r: any) => sanitizeInput(r)).filter(Boolean).slice(0, 20) : [],
    benefits: Array.isArray(jobData.benefits) ? jobData.benefits.map((b: any) => sanitizeInput(b)).filter(Boolean).slice(0, 20) : [],
    posted: sanitizeInput(jobData.posted || ''),
  };
  
  return jobSchema.parse(sanitized);
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};

// Content Security Policy helper
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};