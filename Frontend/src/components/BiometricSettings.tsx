import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getBiometricType } from '../utils/biometrics';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const BiometricSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    biometricEnabled,
    biometricSupported,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
  } = useAuth();

  const [biometricType, setBiometricType] = useState<string>(Platform.OS === 'android' ? 'Fingerprint' : 'Face ID');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBiometricType = async () => {
      const type = await getBiometricType();
      setBiometricType(type);
    };

    if (biometricSupported) {
      fetchBiometricType();
    }
  }, [biometricSupported]);

  const handleToggleBiometric = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (biometricEnabled) {
        await disableBiometric();
        Alert.alert('Success', `${biometricType} has been disabled`);
      } else {
        const success = await enableBiometric();
        if (success) {
          Alert.alert('Success', `${biometricType} has been enabled`);
        } else {
          Alert.alert('Error', `Failed to enable ${biometricType}`);
        }
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testBiometric = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await authenticateWithBiometric(`Test ${biometricType} Authentication`);
      if (success) {
        Alert.alert('Success', `${biometricType} authentication successful!`);
      } else {
        Alert.alert('Failed', `${biometricType} authentication was not successful.`);
      }
    } catch (error) {
      console.error('Error testing biometric:', error);
      Alert.alert('Error', 'Failed to test biometric authentication');
    } finally {
      setIsLoading(false);
    }
  };

  if (!biometricSupported) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Ionicons name="finger-print-outline" size={64} color="#9CA3AF" />
          <Text style={styles.unavailableTitle}>Biometric Authentication Unavailable</Text>
          <Text style={styles.unavailableText}>
            Your device doesn't support biometric authentication or it's not set up. 
            To use this feature, please set up {biometricType} in your device settings.
          </Text>
        </View>
      </View>
    );
  }

  const isFace = biometricType === 'Face ID' || biometricType === 'Face Unlock';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name={isFace ? 'scan-outline' : 'finger-print-outline'} 
          size={48} 
          color="#FF6B35" 
        />
        <Text style={styles.title}>Biometric Authentication</Text>
        <Text style={styles.subtitle}>
          Use {biometricType} to quickly and securely access your JanSetu account
        </Text>
      </View>

      <View style={styles.settingContainer}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable {biometricType}</Text>
            <Text style={styles.settingDescription}>
              {biometricEnabled 
                ? `${biometricType} is enabled for secure access`
                : `Enable ${biometricType} for quick and secure login`
              }
            </Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleToggleBiometric}
            disabled={isLoading}
            trackColor={{ false: '#D1D5DB', true: '#FF6B35' }}
            thumbColor={biometricEnabled ? '#FFFFFF' : '#F3F4F6'}
          />
        </View>
      </View>

      {biometricEnabled && (
        <TouchableOpacity
          style={styles.testButton}
          onPress={testBiometric}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="play-outline" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test {biometricType}</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            Your biometric data is stored securely on your device and never shared
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            Faster login without entering your mobile number each time
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#10B981" />
          <Text style={styles.infoText}>
            Additional security layer to protect your personal information
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  settingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginLeft: 12,
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BiometricSettings;
