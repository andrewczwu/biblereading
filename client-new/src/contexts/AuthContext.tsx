import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userProfileAPI } from '../services/api';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  timezone: string;
  preferredLanguage: string;
  readingPreferences: {
    reminderTime: string;
    enableReminders: boolean;
    preferredTranslation: string;
    readingGoal: string;
  };
  privacy: {
    profileVisibility: string;
    showReadingProgress: boolean;
    allowGroupInvitations: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<User>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, displayName: string): Promise<User> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    return user;
  };

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) throw new Error('No user logged in');
    
    const updatedProfile = await userProfileAPI.update(currentUser.uid, profileData);
    setUserProfile(updatedProfile);
  };

  const fetchUserProfile = async (uid: string): Promise<void> => {
    try {
      const profile = await userProfileAPI.get(uid);
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      // Profile doesn't exist yet - that's okay for new users
      if (error.response?.status !== 404) {
        console.error('Unexpected error fetching profile:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};