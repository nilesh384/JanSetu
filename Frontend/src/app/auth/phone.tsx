import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendOTP } from '../../api/otp.js';

export default function PhoneInput() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneNumberChange = (text: string) => {
    // Only allow digits and limit to 10 characters
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setPhoneNumber(numericText);
    }
  };

  const handleProceed = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a 10-digit phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send OTP to the backend (add +91 country code)
      const fullPhoneNumber = `+91${phoneNumber}`;
      const result = await sendOTP(fullPhoneNumber) as any;
      
      if (result.success) {
        // Show success message
        Alert.alert(
          'OTP Sent!', 
          `Verification code has been sent to +91 ${phoneNumber}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to OTP screen with full phone number
                router.push({
                  pathname: '/auth/otp' as any,
                  params: { phoneNumber: fullPhoneNumber }
                });
              }
            }
          ]
        );
      } else {
        // Show error message
        Alert.alert('Error', result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidPhoneNumber = phoneNumber.length === 10;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.content}>
        {/* Header with app branding */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="people-circle" size={60} color="#FF6B35" />
            <Text style={styles.appName}>CrowdSource</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.subtitle}>
            Enter your phone number to continue
          </Text>
        </View>

        {/* Phone Input */}
        <View style={styles.inputSection}>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCodeContainer}>
              <Ionicons name="flag" size={20} color="#FF6B35" />
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />
          </View>
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (isValidPhoneNumber && !loading) ? styles.proceedButtonActive : styles.proceedButtonInactive
          ]}
          onPress={handleProceed}
          disabled={!isValidPhoneNumber || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={[
                styles.proceedButtonText,
                (isValidPhoneNumber && !loading) ? styles.proceedButtonTextActive : styles.proceedButtonTextInactive
              ]}>
                {isValidPhoneNumber ? 'Send OTP' : 'Enter Phone Number'}
              </Text>
              {isValidPhoneNumber && (
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  welcomeSection: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 22,
  },
  inputSection: {
    paddingVertical: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    marginRight: 12,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '500',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 30,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  proceedButtonActive: {
    backgroundColor: '#FF6B35',
  },
  proceedButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  proceedButtonTextActive: {
    color: '#FFFFFF',
  },
  proceedButtonTextInactive: {
    color: '#9CA3AF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});