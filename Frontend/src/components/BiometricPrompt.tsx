import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

interface BiometricPromptProps {
  visible: boolean;
  onSuccess: () => void;
  onFallback: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  biometricType?: string;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onSuccess,
  onFallback,
  onCancel,
  title = 'Welcome back',
  subtitle,
  biometricType = Platform.OS === 'android' ? 'Fingerprint' : 'Face ID',
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authenticateWithBiometric } = useAuth();

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    try {
      const success = await authenticateWithBiometric('Unlock JanSetu');
      if (success) {
        onSuccess();
      } else {
        console.log('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getIcon = () => {
    switch (biometricType) {
      case 'Face ID':
      case 'Face Unlock':
        return 'scan-outline';
      case 'Iris':
        return 'eye-outline';
      case 'Fingerprint':
      case 'Touch ID':
      default:
        return 'finger-print-outline';
    }
  };

  const defaultSubtitle = `Use your ${biometricType.toLowerCase()} to unlock JanSetu`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getIcon()} 
                size={64} 
                color="#FF6B35" 
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle || defaultSubtitle}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, isAuthenticating && styles.buttonDisabled]}
              onPress={handleBiometricAuth}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name={getIcon()} size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    Verify with {biometricType}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={onFallback}
              disabled={isAuthenticating}
            >
              <Text style={styles.fallbackButtonText}>Use mobile number</Text>
            </TouchableOpacity>

            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={isAuthenticating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
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
    padding: 24,
    width: '100%',
    maxWidth: 340,
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
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackButton: {
    padding: 12,
    alignItems: 'center',
  },
  fallbackButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BiometricPrompt;
