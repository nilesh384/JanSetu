import React, { useState, useRef } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { verifyOTP, sendOTP} from '../../api/otp.js';
import { useAuth } from '../../context/AuthContext';

export default function OTPInput() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with backend (phoneNumber already includes +91)
      console.log('🚀 Starting OTP verification for:', phoneNumber);
      const result = await verifyOTP(phoneNumber as string, otpValue) as any;
      console.log('📨 OTP verification result:', result);
      
      if (result.success && result.user) {
        console.log('✅ OTP verified successfully, user data received:', result.user);
        console.log('📋 Profile setup required:', result.requiresProfileSetup);
        
        // Login user with data from database
        try {
          await login(result.user, result.requiresProfileSetup);
          console.log('🔐 Login successful');
          
          // Navigate based on profile completion
                  console.log('🧭 Navigating based on profile setup:', result.requiresProfileSetup);
                  if (result.requiresProfileSetup) {
                    console.log('📝 Going to profile setup');
                    router.replace('/auth/profile-setup' as any);
                  } else {
                    console.log('🏠 Going to home');
                    router.replace('/(tabs)/Home' as any);
                  }
        } catch (loginError) {
          console.error('❌ Login error:', loginError);
          Alert.alert('Login Error', 'Authentication failed. Please try again.');
        }
      } else if (result.success) {
        console.log('⚠️ OTP verified but no user data:', result);
        Alert.alert('Warning', result.warning || 'OTP verified but account setup failed. Please try again.');
      } else {
        console.log('❌ OTP verification failed:', result);
        Alert.alert('Verification Failed', result.message || 'Invalid OTP. Please try again.');
        // Clear OTP inputs on failed verification
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your internet connection and try again.');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    setResendLoading(true);
    
    try {
      // Send new OTP (phoneNumber already includes +91)
      const result = await sendOTP(phoneNumber as string) as any;
      
      if (result.success) {
        setOtp(['', '', '', '', '', '']);
        Alert.alert('OTP Sent', 'A new verification code has been sent to your phone number');
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please check your internet connection and try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const isValidOTP = otp.every(digit => digit !== '') && otp.join('').length === 6;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.content}>

        

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpSection}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : styles.otpInputEmpty
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(event) => handleKeyPress(event, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                autoFocus={index === 0}
              />
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (isValidOTP && !loading) ? styles.verifyButtonActive : styles.verifyButtonInactive
          ]}
          onPress={handleVerify}
          disabled={!isValidOTP || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={[
                styles.verifyButtonText,
                (isValidOTP && !loading) ? styles.verifyButtonTextActive : styles.verifyButtonTextInactive
              ]}>
                {isValidOTP ? 'Verify & Continue' : 'Enter OTP'}
              </Text>
              {isValidOTP && (
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity 
            style={[styles.resendButton, resendLoading && styles.resendButtonDisabled]} 
            onPress={handleResendOTP}
            disabled={resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#FF6B35" />
            ) : (
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            )}
          </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 8,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 30,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 12,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 20,
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
  phoneNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 4,
  },
  otpSection: {
    paddingVertical: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 48,
    height: 60,
    borderWidth: 2,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputEmpty: {
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  otpInputFilled: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3E0',
    color: '#1F2937',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  verifyButtonActive: {
    backgroundColor: '#FF6B35',
  },
  verifyButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  verifyButtonTextActive: {
    color: '#FFFFFF',
  },
  verifyButtonTextInactive: {
    color: '#9CA3AF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  resendSection: {
    alignItems: 'center',
    paddingTop: 30,
  },
  resendText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  resendButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  resendButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
});