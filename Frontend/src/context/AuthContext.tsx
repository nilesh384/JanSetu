import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getUserById } from '../api/user.js';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import notificationService from '../services/notificationService';
import { checkBiometricSupport, promptBiometricAuth, getBiometricType } from '../utils/biometrics';

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
  biometricEnabled: boolean;
  biometricSupported: boolean;
  login: (userData: User, requiresProfileSetup?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: (reason?: string) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys - Only store minimal data locally
const STORAGE_KEYS = {
  USER_DATA: '@crowdsource_user_data',
  AUTH_TOKEN: '@crowdsource_auth_token',
  LOGIN_TIME: '@crowdsource_login_time',
  BIOMETRIC_ENABLED: '@crowdsource_biometric_enabled',
  LAST_LOGGED_USER: '@crowdsource_last_logged_user',
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresProfileSetup, setRequiresProfileSetup] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check authentication status on app startup
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setHasNetworkError(false);

      // Check biometric support first
      const biometricSupport = await checkBiometricSupport();
      setBiometricSupported(biometricSupport.isSupported);
      
      const [storedUserData, storedLoginTime, biometricEnabledSetting] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.LOGIN_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
      ]);

      const isBiometricEnabled = biometricEnabledSetting === 'true' && biometricSupport.isSupported;
      setBiometricEnabled(isBiometricEnabled);

      if (storedUserData && storedLoginTime) {
        const loginTime = new Date(storedLoginTime);
        const now = new Date();
        
        // Check if session is still valid (30 days)
        const daysSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLogin < 30) {
          const userData = JSON.parse(storedUserData);
          
          // If biometrics are enabled, prompt for authentication
          if (isBiometricEnabled) {
            console.log('🔐 Prompting for biometric authentication to unlock app...');
            const authResult = await promptBiometricAuth('Unlock JanSetu');
            
            if (authResult.success) {
              console.log('✅ Biometric authentication successful');
              setUser(userData);
              
              // Check if profile setup is required
              const needsProfileSetup = !userData.fullName || !userData.email;
              setRequiresProfileSetup(needsProfileSetup);
              
              // Optionally refresh user data in background
              refreshUserInBackground(userData.id);
            } else {
              console.log('❌ Biometric authentication failed, clearing session');
              await clearAuthStorage();
            }
          } else {
            // No biometrics, proceed with normal session restoration
            setUser(userData);
            
            // Check if profile setup is required
            const needsProfileSetup = !userData.fullName || !userData.email;
            setRequiresProfileSetup(needsProfileSetup);
            
            console.log('✅ Valid session found, user authenticated');
            
            // Optionally refresh user data in background
            refreshUserInBackground(userData.id);
          }
        } else {
          // Session expired, clear storage
          console.log('⏰ Session expired, clearing storage');
          await clearAuthStorage();
        }
      } else {
        // No stored session, check for auto-login with biometrics
        const lastLoggedUser = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGGED_USER);
        
        if (lastLoggedUser && isBiometricEnabled) {
          console.log('🔐 Attempting auto-login with biometrics...');
          const authResult = await promptBiometricAuth('Sign in to JanSetu');
          
          if (authResult.success) {
            console.log('✅ Auto-login with biometrics successful');
            const userData = JSON.parse(lastLoggedUser);
            await performAutoLogin(userData);
          } else {
            console.log('❌ Auto-login with biometrics failed');
          }
        } else {
          console.log('🔐 No stored authentication found');
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      // Clear potentially corrupted data
      await clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-login function for biometric authentication
  const performAutoLogin = async (lastUserData: any) => {
    try {
      // Here you would call your actual login API
      // For now, we'll restore the last session
      const sessionData = {
        ...lastUserData,
        loginTime: new Date().toISOString(),
        autoLogin: true
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(sessionData));
      await AsyncStorage.setItem(STORAGE_KEYS.LOGIN_TIME, sessionData.loginTime);
      
      setUser(sessionData);
      
      // Check if profile setup is required
      const needsProfileSetup = !sessionData.fullName || !sessionData.email;
      setRequiresProfileSetup(needsProfileSetup);
      
      console.log('✅ Auto-login completed');
    } catch (error) {
      console.error('❌ Auto-login failed:', error);
    }
  };

  // Background refresh - don't block UI, just update data silently
  const refreshUserInBackground = async (userId: string) => {
    try {
      console.log('🔄 Refreshing user data in background...');
      const result = await getUserById(userId) as any;

      if (result.success && result.user) {
        // Update stored user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.user));
        
        // Update state only if user is still logged in
        if (user?.id === userId) {
          setUser(result.user);
          const needsProfileSetup = !result.user.fullName || !result.user.email;
          setRequiresProfileSetup(needsProfileSetup);
        }
        
        console.log('✅ User data refreshed in background');
      }
    } catch (error) {
      console.log('⚠️ Background refresh failed, keeping existing data:', error);
      // Don't clear auth data for background refresh failures
    }
  };

  // Refresh user data (called when needed, like after profile update)
  const refreshUser = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const result = await getUserById(user.id) as any;

      if (result.success && result.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.user));
        setUser(result.user);
        
        const needsProfileSetup = !result.user.fullName || !result.user.email;
        setRequiresProfileSetup(needsProfileSetup);
        
        console.log('✅ User data refreshed successfully');
      } else {
        throw new Error(result.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      // Don't clear auth data for refresh failures
    } finally {
      setIsLoading(false);
    }
  };

  // Login function (called after successful OTP verification)
  const login = async (userData: User, requiresProfileSetupFlag?: boolean) => {
    try {
      console.log('🔐 Starting login process for user:', userData.id);
      
      const loginTime = new Date().toISOString();
      const profileSetupRequired = requiresProfileSetupFlag ?? (!userData.fullName || !userData.email);
      
      // Prepare last logged user data for potential biometric auto-login
      const lastLoggedUserData = {
        id: userData.id,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName,
        email: userData.email,
      };
      
      // Save complete user data and login time to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
        AsyncStorage.setItem(STORAGE_KEYS.LOGIN_TIME, loginTime),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGGED_USER, JSON.stringify(lastLoggedUserData)),
      ]);

      setUser(userData);
      setRequiresProfileSetup(profileSetupRequired);
      
      // Check if biometrics are supported and ask user to enable them
      const biometricSupport = await checkBiometricSupport();
      if (biometricSupport.isSupported && !biometricEnabled) {
        console.log('💡 Biometrics supported but not enabled, user can enable later');
        // You can show a prompt here to ask user if they want to enable biometrics
      }
      
      // Update FCM token for the logged-in user
      try {
        await notificationService.updateTokenForUser(userData.id);
      } catch (notifError) {
        console.warn('⚠️ Failed to update FCM token:', notifError);
        // Don't fail login if FCM token update fails
      }
      
      console.log('✅ User logged in successfully:', userData.id);
      
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
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.LOGIN_TIME),
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
    ]);
  };

  // Biometric authentication functions
  const enableBiometric = async (): Promise<boolean> => {
    try {
      const biometricSupport = await checkBiometricSupport();
      if (!biometricSupport.isSupported) {
        console.log('❌ Biometric authentication not supported or not enrolled');
        return false;
      }

      // Test biometric authentication
      const authResult = await promptBiometricAuth('Enable biometric authentication for JanSetu');
      if (authResult.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        setBiometricEnabled(true);
        console.log('✅ Biometric authentication enabled');
        return true;
      } else {
        console.log('❌ Biometric authentication test failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Error enabling biometric authentication:', error);
      return false;
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      setBiometricEnabled(false);
      console.log('✅ Biometric authentication disabled');
    } catch (error) {
      console.error('❌ Error disabling biometric authentication:', error);
    }
  };

  const authenticateWithBiometric = async (reason?: string): Promise<boolean> => {
    try {
      if (!biometricSupported || !biometricEnabled) {
        console.log('❌ Biometric authentication not available');
        return false;
      }

      const authResult = await promptBiometricAuth(reason || 'Authenticate to continue');
      return authResult.success;
    } catch (error) {
      console.error('❌ Biometric authentication error:', error);
      return false;
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Simple network monitoring - just clear network error flag when back online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      
      if (isOnline && hasNetworkError) {
        console.log('🌐 Network restored');
        setHasNetworkError(false);
      }
    });

    return () => unsubscribe();
  }, [hasNetworkError]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    requiresProfileSetup,
    hasNetworkError,
    biometricEnabled,
    biometricSupported,
    login,
    logout,
    checkAuthStatus,
    refreshUser,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
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