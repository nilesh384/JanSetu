import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '../api/user.js';

// Types for TypeScript - Updated to match database schema
interface User {
  id: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  profileImageUrl: string;
  isVerified: boolean;
  totalReports: number;
  resolvedReports: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requiresProfileSetup: boolean;
  login: (userData: User, requiresProfileSetup?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys - Only store minimal data locally
const STORAGE_KEYS = {
  USER_ID: '@crowdsource_user_id',
  LOGIN_TIME: '@crowdsource_login_time',
  REQUIRES_PROFILE_SETUP: '@crowdsource_requires_profile_setup',
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresProfileSetup, setRequiresProfileSetup] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check authentication status on app startup
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const [storedUserId, storedLoginTime, storedProfileSetup] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_ID),
        AsyncStorage.getItem(STORAGE_KEYS.LOGIN_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.REQUIRES_PROFILE_SETUP),
      ]);

      if (storedUserId && storedLoginTime) {
        const loginTime = new Date(storedLoginTime);
        const now = new Date();
        
        // Check if session is still valid (30 days)
        const daysSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLogin < 30) {
          // Session is still valid, fetch user data from database
          console.log('✅ Valid session found, fetching user data...');
          await refreshUser(storedUserId);
          
          // Set profile setup requirement from storage
          setRequiresProfileSetup(storedProfileSetup === 'true');
        } else {
          // Session expired, clear storage
          console.log('⏰ Session expired, clearing storage');
          await clearAuthStorage();
        }
      } else {
        console.log('🔐 No stored authentication found');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      await clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data from database
  const refreshUser = async (userId?: string) => {
    try {
      const userIdToUse = userId || user?.id;
      if (!userIdToUse) {
        throw new Error('No user ID available');
      }

      console.log('🔄 Refreshing user data from database...');
      const result = await getUserById(userIdToUse) as any;
      
      if (result.success && result.user) {
        setUser(result.user);
        setRequiresProfileSetup(result.requiresProfileSetup || false);
        
        // Update profile setup requirement in storage
        await AsyncStorage.setItem(
          STORAGE_KEYS.REQUIRES_PROFILE_SETUP, 
          String(result.requiresProfileSetup || false)
        );
        
        console.log('✅ User data refreshed successfully');
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      // If we can't fetch user data, clear the session
      await clearAuthStorage();
      setUser(null);
      setRequiresProfileSetup(false);
    }
  };

  // Login function (called after successful OTP verification)
  const login = async (userData: User, requiresProfileSetupFlag?: boolean) => {
    try {
      console.log('🔐 Starting login process for user:', userData.id);
      console.log('👤 User data received:', userData);
      
      const loginTime = new Date().toISOString();
      const profileSetupRequired = requiresProfileSetupFlag ?? (!userData.fullName || !userData.email);
      
      console.log('📝 Profile setup required:', profileSetupRequired);
      console.log('💾 Saving to AsyncStorage...');

      // Save minimal data to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userData.id),
        AsyncStorage.setItem(STORAGE_KEYS.LOGIN_TIME, loginTime),
        AsyncStorage.setItem(STORAGE_KEYS.REQUIRES_PROFILE_SETUP, String(profileSetupRequired)),
      ]);

      console.log('✅ Data saved to AsyncStorage');
      setUser(userData);
      setRequiresProfileSetup(profileSetupRequired);
      console.log('✅ User logged in successfully:', userData.id);
      
      if (profileSetupRequired) {
        console.log('📝 Profile setup required');
      } else {
        console.log('👋 Welcome back!');
      }
      
    } catch (error) {
      console.error('❌ Error during login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await clearAuthStorage();
      setUser(null);
      setRequiresProfileSetup(false);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  // Clear all auth-related storage
  const clearAuthStorage = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
      AsyncStorage.removeItem(STORAGE_KEYS.LOGIN_TIME),
      AsyncStorage.removeItem(STORAGE_KEYS.REQUIRES_PROFILE_SETUP),
    ]);
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    requiresProfileSetup,
    login,
    logout,
    checkAuthStatus,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;