import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { checkBiometricSupport, getBiometricType } from './biometrics';

const BIOMETRIC_ONBOARDING_SHOWN_KEY = '@biometric_onboarding_shown';

export const useBiometricOnboarding = () => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [biometricType, setBiometricType] = useState('Fingerprint');
  const { isAuthenticated, biometricEnabled, biometricSupported, user } = useAuth();

  useEffect(() => {
    const checkShouldShowOnboarding = async () => {
      try {
        // Only check for authenticated users
        if (!isAuthenticated || !user) return;

        // Check if user already has biometric enabled
        if (biometricEnabled) return;

        // Check if biometrics are supported on this device
        const biometricSupport = await checkBiometricSupport();
        if (!biometricSupport.isSupported) return;

        // Check if we've already shown the onboarding to this user
        const hasShownOnboarding = await AsyncStorage.getItem(
          `${BIOMETRIC_ONBOARDING_SHOWN_KEY}_${user.id}`
        );
        
        if (hasShownOnboarding === 'true') return;

        // Get biometric type for display
        const type = await getBiometricType();
        setBiometricType(type);

        // Show onboarding
        setShouldShowOnboarding(true);
      } catch (error) {
        console.error('Error checking biometric onboarding:', error);
      }
    };

    checkShouldShowOnboarding();
  }, [isAuthenticated, biometricEnabled, biometricSupported, user]);

  const markOnboardingAsShown = async () => {
    try {
      if (user?.id) {
        await AsyncStorage.setItem(
          `${BIOMETRIC_ONBOARDING_SHOWN_KEY}_${user.id}`,
          'true'
        );
      }
      setShouldShowOnboarding(false);
    } catch (error) {
      console.error('Error marking biometric onboarding as shown:', error);
      setShouldShowOnboarding(false);
    }
  };

  const resetOnboarding = async () => {
    try {
      if (user?.id) {
        await AsyncStorage.removeItem(
          `${BIOMETRIC_ONBOARDING_SHOWN_KEY}_${user.id}`
        );
      }
    } catch (error) {
      console.error('Error resetting biometric onboarding:', error);
    }
  };

  return {
    shouldShowOnboarding,
    biometricType,
    markOnboardingAsShown,
    resetOnboarding,
  };
};