import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import BiometricPrompt from './BiometricPrompt';
import { getBiometricType } from '../utils/biometrics';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { 
    isLoading, 
    isAuthenticated, 
    biometricEnabled, 
    biometricSupported,
    user 
  } = useAuth();
  
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricType, setBiometricType] = useState('Fingerprint');
  const [hasCheckedBiometric, setHasCheckedBiometric] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Get biometric type when component mounts
  useEffect(() => {
    const fetchBiometricType = async () => {
      if (biometricSupported) {
        const type = await getBiometricType();
        setBiometricType(type);
      }
    };
    fetchBiometricType();
  }, [biometricSupported]);

  // Handle biometric prompt logic
  useEffect(() => {
    if (!isLoading && !hasCheckedBiometric) {
      if (isAuthenticated && biometricEnabled && biometricSupported) {
        // User is logged in and has biometrics enabled
        // This means they already passed biometric auth during login process
        setHasCheckedBiometric(true);
      } else if (!isAuthenticated && biometricEnabled && biometricSupported) {
        // User is not logged in but has biometric auto-login enabled
        // This would be handled in AuthContext during checkAuthStatus
        setHasCheckedBiometric(true);
      } else {
        // No biometric authentication needed
        setHasCheckedBiometric(true);
      }
    }
  }, [isLoading, isAuthenticated, biometricEnabled, biometricSupported, hasCheckedBiometric]);

  const handleBiometricSuccess = () => {
    setShowBiometricPrompt(false);
    setHasCheckedBiometric(true);
  };

  const handleBiometricFallback = () => {
    setShowBiometricPrompt(false);
    setHasCheckedBiometric(true);
    // Navigate to login screen
    router.push('/auth/phone');
  };

  // Show loading screen while checking authentication
  if (isLoading || !hasCheckedBiometric) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show biometric prompt if needed
  if (showBiometricPrompt) {
    return (
      <BiometricPrompt
        visible={true}
        onSuccess={handleBiometricSuccess}
        onFallback={handleBiometricFallback}
        biometricType={biometricType}
      />
    );
  }

  // Always render children - let the individual screens handle authentication
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});