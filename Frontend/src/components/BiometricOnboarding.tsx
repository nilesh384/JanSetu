import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface BiometricOnboardingProps {
  visible: boolean;
  onComplete: () => void;
  biometricType?: string;
}

const BiometricOnboarding: React.FC<BiometricOnboardingProps> = ({
  visible,
  onComplete,
  biometricType = 'Fingerprint',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { enableBiometric } = useAuth();

  const handleEnableBiometric = async () => {
    setIsLoading(true);
    try {
      const success = await enableBiometric();
      if (success) {
        console.log('✅ Biometric authentication enabled during onboarding');
      } else {
        console.log('❌ Failed to enable biometric authentication during onboarding');
      }
    } catch (error) {
      console.error('Error enabling biometric during onboarding:', error);
    } finally {
      setIsLoading(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    console.log('⏭️ User skipped biometric onboarding');
    onComplete();
  };

  const getIcon = () => {
    switch (biometricType) {
      case 'Face ID':
        return 'scan-outline';
      case 'Iris':
        return 'eye-outline';
      default:
        return 'finger-print-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getIcon()} 
                size={72} 
                color="#FF6B35" 
              />
            </View>
            <Text style={styles.title}>Secure Your Account</Text>
            <Text style={styles.subtitle}>
              Enable {biometricType} for quick and secure access to your JanSetu account. 
              You can always change this later in settings.
            </Text>
          </View>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="flash-outline" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Faster login</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Enhanced security</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="lock-closed-outline" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Privacy protection</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.enableButton, isLoading && styles.buttonDisabled]}
              onPress={handleEnableBiometric}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name={getIcon()} size={20} color="#FFFFFF" />
                  <Text style={styles.enableButtonText}>
                    Enable {biometricType}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF3F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  enableButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BiometricOnboarding;