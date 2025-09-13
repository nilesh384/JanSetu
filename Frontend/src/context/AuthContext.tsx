import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for TypeScript
interface User {
  phoneNumber: string;
  isVerified: boolean;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER: '@crowdsource_user',
  AUTH_TOKEN: '@crowdsource_auth_token',
  LOGIN_TIME: '@crowdsource_login_time',
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check authentication status on app startup
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const [storedUser, storedLoginTime] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.LOGIN_TIME),
      ]);

      if (storedUser && storedLoginTime) {
        const userData = JSON.parse(storedUser);
        const loginTime = new Date(storedLoginTime);
        const now = new Date();
        
        // Check if session is still valid (30 days)
        const daysSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLogin < 300) {
          // Session is still valid
          setUser(userData);
          console.log('✅ User session restored:', userData.phoneNumber);
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

  // Login function (called after successful OTP verification)
  const login = async (phoneNumber: string) => {
    try {
      const userData: User = {
        phoneNumber,
        isVerified: true,
        loginTime: new Date().toISOString(),
      };

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData)),
        AsyncStorage.setItem(STORAGE_KEYS.LOGIN_TIME, new Date().toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `token_${phoneNumber}_${Date.now()}`),
      ]);

      setUser(userData);
      console.log('✅ User logged in successfully:', phoneNumber);
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
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  // Clear all auth-related storage
  const clearAuthStorage = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.LOGIN_TIME),
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
    login,
    logout,
    checkAuthStatus,
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