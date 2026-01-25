import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import PhoneEmailAuth from '../../components/PhoneEmailAuth';
import { useAuth } from '../../context/AuthContext';

export default function PhoneInput() {
  const { login } = useAuth();

  const handlePhoneEmailSuccess = async (authData: any) => {
    try {
      console.log('✅ Phone.email auth successful');
      
      // Login the user with the returned user data
      await login(authData.user, authData.requiresProfileSetup);
      
      // Navigate based on account status
      if (authData.requiresProfileSetup) {
        console.log('🆕 New user - redirecting to profile setup');
        router.replace('/auth/profile-setup' as any);
      } else {
        console.log('✅ Existing user - redirecting to home');
        router.replace('/(tabs)/Home' as any);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <View style={styles.content}>
        {/* Header Section with Gradient Background */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={80} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>JanSetu</Text>
          <Text style={styles.tagline}>Empowering Citizens Together</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in securely with your phone number
            </Text>
            
            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>100% Free verification</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Secure & encrypted</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>No charges or hidden fees</Text>
              </View>
            </View>

            {/* Phone.email Authentication Button */}
            <View style={styles.authButtonContainer}>
              <PhoneEmailAuth 
                onSuccess={handlePhoneEmailSuccess}
                onError={(error) => Alert.alert('Error', error)}
              />
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Ionicons name="lock-closed-outline" size={16} color="#6B7280" />
            <Text style={styles.footerText}>
              Your data is safe and secure with us
            </Text>
          </View>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: '#FF6B35',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
    fontWeight: '500',
  },
  authButtonContainer: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingBottom: 24,
  },
  linkText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});