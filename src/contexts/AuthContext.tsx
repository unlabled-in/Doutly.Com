import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { DatabaseService, UserService, StandardizedUser } from '../lib/database';

export interface UserProfile extends StandardizedUser {}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Enhanced role-based email detection with security
const getRoleFromEmail = (email: string): UserProfile['role'] => {
  if (!email || typeof email !== 'string') return 'student';
  
  const sanitizedEmail = email.toLowerCase().trim();
  const domain = sanitizedEmail.split('@')[1];
  
  if (domain !== 'doutly.com') return 'student';
  
  const prefix = sanitizedEmail.split('@')[0];
  
  // Check for exact role matches
  if (prefix === 'admin') return 'admin';
  if (prefix === 'verticalhead' || prefix.includes('verticalhead')) return 'vertical_head';
  if (prefix === 'manager' || prefix.includes('manager')) return 'manager';
  if (prefix === 'teamlead' || prefix === 'teamleader' || prefix.includes('teamlead')) return 'team_leader';
  if (prefix === 'tutor' || prefix.includes('tutor')) return 'tutor';
  if (prefix === 'freelancer' || prefix.includes('freelancer')) return 'freelancer';
  
  // Check for role suffixes (name.role@doutly.com)
  const parts = prefix.split('.');
  if (parts.length > 1) {
    const rolePart = parts[parts.length - 1];
    switch (rolePart) {
      case 'admin':
        return 'admin';
      case 'vh':
      case 'verticalhead':
        return 'vertical_head';
      case 'manager':
        return 'manager';
      case 'tl':
      case 'teamlead':
      case 'teamleader':
        return 'team_leader';
      case 'tutor':
        return 'tutor';
      case 'freelancer':
        return 'freelancer';
      default:
        return 'student';
    }
  }
  
  return 'student';
};

// Get dashboard path based on role
const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'vertical_head':
      return '/vh-dashboard';
    case 'manager':
      return '/manager-dashboard';
    case 'team_leader':
      return '/tl-dashboard';
    case 'tutor':
      return '/tutor-dashboard';
    case 'freelancer':
      return '/freelancer-dashboard';
    default:
      return '/student-dashboard';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectedRef = useRef(false);
  const isInitialLoad = useRef(true);
  const lastRedirectPath = useRef<string>('');

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      // Enhanced validation
      if (!email || !password || !profileData.displayName) {
        throw new Error('Missing required fields');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: profileData.displayName
      });

      // Determine role based on email with enhanced security
      const detectedRole = getRoleFromEmail(email);
      const finalRole = profileData.role || detectedRole;

      const profile: UserProfile = DatabaseService.standardizeUser({
        uid: user.uid,
        email: user.email!,
        displayName: profileData.displayName!,
        role: finalRole,
        phone: profileData.phone,
        skills: profileData.skills,
        institution: profileData.institution,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
        profileComplete: !!(profileData.displayName && profileData.phone),
        ...profileData
      });

      await UserService.create(profile, user.uid);
      setUserProfile(profile);

      // Set redirect flag and navigate
      redirectedRef.current = true;
      const dashboardPath = getDashboardPath(finalRole);
      lastRedirectPath.current = dashboardPath;
      setTimeout(() => {
        window.location.href = dashboardPath;
      }, 100);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      await signInWithEmailAndPassword(auth, email, password);
      // User profile update and redirection will be handled in onAuthStateChanged
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      redirectedRef.current = false;
      lastRedirectPath.current = '';
      window.location.href = '/';
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!currentUser || !userProfile) {
        throw new Error('No user logged in');
      }

      const updatedData = {
        ...data,
        updatedAt: new Date(),
        profileComplete: !!(data.displayName || userProfile.displayName) && 
                        !!(data.phone || userProfile.phone)
      };

      await UserService.update(currentUser.uid, updatedData, currentUser.uid);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const refreshUserProfile = async () => {
    try {
      if (!currentUser) return;
      
      const userData = await UserService.get(currentUser.uid);
      if (userData) {
        setUserProfile(userData);
      }
    } catch (error: any) {
      console.warn('Error refreshing user profile:', error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          let userDoc = await UserService.get(user.uid);
          
          if (userDoc) {
            // Update role based on email if it's a doutly.com email
            const detectedRole = getRoleFromEmail(user.email!);
            if (user.email!.endsWith('@doutly.com') && userDoc.role !== detectedRole) {
              const updatedProfile = { ...userDoc, role: detectedRole };
              try {
                await UserService.update(user.uid, { 
                  role: detectedRole,
                  lastLoginAt: new Date()
                }, user.uid);
                setUserProfile(updatedProfile);
                userDoc = updatedProfile;
              } catch (updateError) {
                console.warn('Failed to update user role:', updateError);
                // Update lastLoginAt separately
                try {
                  await UserService.update(user.uid, { lastLoginAt: new Date() }, user.uid);
                } catch (loginUpdateError) {
                  console.warn('Failed to update last login time:', loginUpdateError);
                }
                setUserProfile(userDoc);
              }
            } else {
              // Update lastLoginAt for existing users
              try {
                await UserService.update(user.uid, { lastLoginAt: new Date() }, user.uid);
                setUserProfile({ ...userDoc, lastLoginAt: new Date() });
                userDoc = { ...userDoc, lastLoginAt: new Date() };
              } catch (updateError) {
                console.warn('Failed to update last login time:', updateError);
                setUserProfile(userDoc);
              }
            }

            // Auto-redirect to dashboard with enhanced security
            const currentPath = window.location.pathname;
            const dashboardPath = getDashboardPath(userDoc.role);
            
            if ((currentPath === '/signin' || currentPath === '/signup' || currentPath === '/unauthorized') && 
                !isInitialLoad.current && 
                !redirectedRef.current && 
                lastRedirectPath.current !== dashboardPath) {
              
              redirectedRef.current = true;
              lastRedirectPath.current = dashboardPath;
              
              setTimeout(() => {
                window.location.href = dashboardPath;
                // Reset redirect flag after navigation
                setTimeout(() => {
                  redirectedRef.current = false;
                }, 2000);
              }, 100);
            }
          } else {
            // Create user profile if it doesn't exist with enhanced validation
            const profile: UserProfile = DatabaseService.standardizeUser({
              uid: user.uid,
              email: user.email!,
              displayName: user.displayName || '',
              role: getRoleFromEmail(user.email!),
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date(),
              isActive: true,
              profileComplete: false
            });
            
            try {
              await UserService.create(profile, user.uid);
              setUserProfile(profile);

              // Redirect to appropriate dashboard for new users
              if (!isInitialLoad.current && !redirectedRef.current) {
                redirectedRef.current = true;
                const dashboardPath = getDashboardPath(profile.role);
                lastRedirectPath.current = dashboardPath;
                setTimeout(() => {
                  window.location.href = dashboardPath;
                  setTimeout(() => {
                    redirectedRef.current = false;
                  }, 2000);
                }, 100);
              }
            } catch (createError) {
              console.error('Failed to create user profile:', createError);
              setUserProfile(null);
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        redirectedRef.current = false;
        lastRedirectPath.current = '';
      }
      
      setLoading(false);
      isInitialLoad.current = false;
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};