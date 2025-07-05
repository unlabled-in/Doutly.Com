import React, { createContext, useContext, useEffect, useState } from 'react';
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

// Enhanced role-based email detection for Indian context
const getRoleFromEmail = (email: string): UserProfile['role'] => {
  const domain = email.split('@')[1];
  if (domain !== 'doutly.com') return 'student';
  
  const prefix = email.split('@')[0].toLowerCase();
  
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: profileData.displayName
      });

      // Determine role based on email
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
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      if (userCredential.user) {
        try {
          await UserService.update(userCredential.user.uid, {
            lastLoginAt: new Date()
          }, userCredential.user.uid);
        } catch (updateError) {
          console.warn('Failed to update last login time:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
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
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      if (!currentUser) return;
      
      const userData = await UserService.get(currentUser.uid);
      if (userData) {
        setUserProfile(userData);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await UserService.get(user.uid);
          if (userDoc) {
            // Update role based on email if it's a doutly.com email
            const detectedRole = getRoleFromEmail(user.email!);
            if (user.email!.endsWith('@doutly.com') && userDoc.role !== detectedRole) {
              const updatedProfile = { ...userDoc, role: detectedRole };
              try {
                await UserService.update(user.uid, { role: detectedRole }, user.uid);
                setUserProfile(updatedProfile);
              } catch (updateError) {
                console.warn('Failed to update user role:', updateError);
                setUserProfile(userDoc);
              }
            } else {
              setUserProfile(userDoc);
            }
          } else {
            // Create user profile if it doesn't exist
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
      }
      
      setLoading(false);
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