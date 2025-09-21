import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getUserById } from '../api/user.js';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  hasNetworkError: boolean;
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
  const [hasNetworkError, setHasNetworkError] = useState(false);

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
      const errorMessage = (error as Error).message;
      console.error('❌ Error checking auth status:', errorMessage);

      // Check if it's a network error
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            errorMessage.toLowerCase().includes('fetch');

      if (isNetworkError) {
        console.log('🌐 Network error during auth check, will retry when online');
        setHasNetworkError(true);
        // Keep loading state true for network errors
      } else {
        // Only clear auth data for non-network errors
        console.log('❌ Non-network error during auth check, clearing auth data');
        setIsLoading(false); // Clear loading state for non-network errors
        await clearAuthStorage();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data from database
  const refreshUser = async (userId?: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      const userIdToUse = userId || user?.id;
      if (!userIdToUse) {
        throw new Error('No user ID available');
      }

      console.log(`🔄 Refreshing user data from database... (attempt ${retryCount + 1})`);
      const result = await getUserById(userIdToUse) as any;

      if (result.success && result.user) {
        setUser(result.user);
        setRequiresProfileSetup(result.requiresProfileSetup || false);
        setHasNetworkError(false); // Clear network error on success
        setIsLoading(false); // Clear loading state on success

        // Update profile setup requirement in storage
        await AsyncStorage.setItem(
          STORAGE_KEYS.REQUIRES_PROFILE_SETUP,
          String(result.requiresProfileSetup || false)
        );

        console.log('✅ User data refreshed successfully');
        return; // Success, exit function
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(`❌ Error refreshing user data (attempt ${retryCount + 1}):`, errorMessage);

      // Check if it's a network-related error
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            !navigator.onLine; // Check if browser reports offline

      if (isNetworkError && retryCount < maxRetries) {
        console.log(`🌐 Network error detected, retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        setHasNetworkError(true);
        // Keep loading state true during retries

        // Retry after delay
        setTimeout(() => {
          refreshUser(userId, retryCount + 1);
        }, retryDelay);
        return; // Don't clear auth data on network errors
      }

      // If it's not a network error or we've exhausted retries, handle as auth error
      if (!isNetworkError || retryCount >= maxRetries) {
        console.log('❌ Non-network error or max retries reached, clearing auth data');
        setHasNetworkError(false); // Clear network error flag
        setIsLoading(false); // Clear loading state
        //FIXME:
        // await clearAuthStorage();
        // setUser(null);
        // setRequiresProfileSetup(false);
      }
    }
  };  // Login function (called after successful OTP verification)
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

  // Network monitoring for retry logic
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;

      if (isOnline && hasNetworkError && user?.id) {
        console.log('🌐 Network restored, retrying user data refresh...');
        setHasNetworkError(false);
        // Keep loading state true during retry
        refreshUser(user.id, 0);
      } else if (isOnline && hasNetworkError && !user?.id) {
        // If we have network but no user, try to check auth status again
        console.log('🌐 Network restored, checking auth status...');
        setHasNetworkError(false);
        checkAuthStatus();
      }
    });

    return () => unsubscribe();
  }, [hasNetworkError, user?.id]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    requiresProfileSetup,
    hasNetworkError,
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

// Loading component with network error display
export const AuthLoadingScreen: React.FC = () => {
  const { isLoading, hasNetworkError } = useAuth();
  const { t } = useTranslation();

  if (!isLoading) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B35" />
      {hasNetworkError && (
        <Text style={styles.networkErrorText}>
          {t('post.networkConnectionIssue')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  networkErrorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AuthContext;