// Enhanced Email service with updated contact information and job application emails
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'doutly4@gmail.com';
  private static readonly SUPPORT_EMAIL = 'doutly4@gmail.com';
  private static readonly PHONE = '8088887775';
  
  // In a real application, you would integrate with an email service like SendGrid, Mailgun, etc.
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Email sent:', {
        to: emailData.to,
        subject: emailData.subject,
        from: emailData.from || this.FROM_EMAIL
      });
      
      // In production, replace this with actual email service integration
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  static async sendJobApplicationConfirmation(email: string, name: string, jobTitle: string): Promise<boolean> {
    const subject = `Application Received - ${jobTitle} Position at Doutly`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Thank You for Your Application!</h2>
          <p style="color: #e0e7ff; margin: 0; font-size: 18px;">
            We've received your application for the ${jobTitle} position.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin: 0 0 15px 0;">What's Next:</h3>
          <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
            <li>Our HR team will review your application within 5-7 business days</li>
            <li>If your profile matches our requirements, we'll contact you for the next steps</li>
            <li>Please keep an eye on your email for updates</li>
            <li>Feel free to reach out if you have any questions</li>
          </ul>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1d4ed8; margin: 0 0 15px 0;">Application Details:</h3>
          <p style="color: #374151; margin: 0;">
            <strong>Position:</strong> ${jobTitle}<br>
            <strong>Applicant:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Application Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, feel free to contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendPartnershipApplicationConfirmation(email: string, name: string, organizationName: string): Promise<boolean> {
    const subject = `Partnership Application Received - ${organizationName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Partnership Application Received!</h2>
          <p style="color: #d1fae5; margin: 0; font-size: 18px;">
            Thank you for your interest in partnering with Doutly.
          </p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin: 0 0 15px 0;">What's Next:</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li>Our partnership team will review your application within 24-48 hours</li>
            <li>We'll schedule a call to discuss collaboration opportunities</li>
            <li>Our team will prepare a customized partnership proposal</li>
            <li>We'll work together to create amazing educational experiences</li>
          </ul>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1d4ed8; margin: 0 0 15px 0;">Application Details:</h3>
          <p style="color: #374151; margin: 0;">
            <strong>Organization:</strong> ${organizationName}<br>
            <strong>Contact Person:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Application Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #374151; margin: 0;">
            We're excited about the possibility of working together to impact education in India!
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendApprovalEmail(email: string, name: string, type: 'tutor' | 'partnership'): Promise<boolean> {
    const subject = type === 'tutor' 
      ? '🎉 Your Tutor Application has been Approved!' 
      : '🎉 Your Partnership Request has been Approved!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Congratulations, ${name}!</h2>
          <p style="color: #e0e7ff; margin: 0; font-size: 18px;">
            ${type === 'tutor' 
              ? 'Your tutor application has been approved. Welcome to the Doutly family!' 
              : 'Your partnership request has been approved. We look forward to collaborating with you!'
            }
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin: 0 0 15px 0;">Next Steps:</h3>
          <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
            ${type === 'tutor' 
              ? `
                <li>Log in to your dashboard to start accepting students</li>
                <li>Complete your profile with additional details</li>
                <li>Set your availability and preferred subjects</li>
                <li>Start earning by helping students achieve their goals</li>
              `
              : `
                <li>Our partnership team will contact you within 24 hours</li>
                <li>We'll discuss collaboration details and next steps</li>
                <li>Prepare your event/partnership materials</li>
                <li>Get ready to reach thousands of students</li>
              `
            }
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://doutly.com/signin" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            ${type === 'tutor' ? 'Access Your Dashboard' : 'Get Started'}
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, feel free to contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendRejectionEmail(email: string, name: string, type: 'tutor' | 'partnership', reason?: string): Promise<boolean> {
    const subject = type === 'tutor' 
      ? 'Update on Your Tutor Application' 
      : 'Update on Your Partnership Request';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0 0 15px 0;">Application Update</h2>
          <p style="color: #374151; margin: 0;">
            Dear ${name},<br><br>
            Thank you for your interest in ${type === 'tutor' ? 'becoming a tutor' : 'partnering'} with Doutly. 
            After careful review, we are unable to approve your application at this time.
          </p>
        </div>
        
        ${reason ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Feedback:</h3>
            <p style="color: #6b7280; margin: 0;">${reason}</p>
          </div>
        ` : ''}
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1d4ed8; margin: 0 0 15px 0;">Don't Give Up!</h3>
          <p style="color: #374151; margin: 0;">
            We encourage you to reapply in the future. Consider gaining more experience or addressing the feedback provided above.
            We're always looking for passionate individuals to join our community.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, feel free to contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendEventRegistrationApproval(email: string, name: string, eventTitle: string): Promise<boolean> {
    const subject = `🎉 Your registration for ${eventTitle} has been approved!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Registration Approved!</h2>
          <p style="color: #d1fae5; margin: 0; font-size: 18px;">
            You're all set for ${eventTitle}
          </p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin: 0 0 15px 0;">What's Next:</h3>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li>You'll receive event details and joining instructions 24 hours before the event</li>
            <li>Make sure to mark your calendar</li>
            <li>Prepare any materials mentioned in the event description</li>
            <li>Join our event community for updates and networking</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://doutly.com/events" 
             style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            View Event Details
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendTeamInviteEmail(email: string, name: string, role: string, tempPassword: string): Promise<boolean> {
    const subject = `Welcome to Doutly Team - Your ${role} Account is Ready!`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 10px 0;">Welcome to the Team, ${name}!</h2>
          <p style="color: #e0e7ff; margin: 0; font-size: 18px;">
            Your ${role} account has been created successfully.
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin: 0 0 15px 0;">Your Login Credentials:</h3>
          <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          <p style="color: #dc2626; font-size: 14px; margin: 10px 0 0 0;">
            ⚠️ Please change your password after your first login for security.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://doutly.com/signin" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Login to Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendEventRegistrationRejection(email: string, name: string, eventTitle: string, reason?: string): Promise<boolean> {
    const subject = `Update on your registration for ${eventTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Doutly</h1>
          <p style="color: #6b7280; margin: 5px 0;">Education Reimagined</p>
        </div>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin: 0 0 15px 0;">Registration Update</h2>
          <p style="color: #374151; margin: 0;">
            Dear ${name},<br><br>
            Thank you for your interest in ${eventTitle}. Unfortunately, we are unable to approve your registration at this time.
          </p>
        </div>
        
        ${reason ? `
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 10px 0;">Reason:</h3>
            <p style="color: #6b7280; margin: 0;">${reason}</p>
          </div>
        ` : ''}
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1d4ed8; margin: 0 0 15px 0;">Stay Connected!</h3>
          <p style="color: #374151; margin: 0;">
            Don't worry! We have many more exciting events coming up. Keep an eye on our events page for future opportunities.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://doutly.com/events" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Browse Other Events
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>If you have any questions, contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a></p>
          <p>Or call us at ${this.PHONE}</p>
          <p style="margin: 10px 0 0 0;">© 2024 Doutly. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}