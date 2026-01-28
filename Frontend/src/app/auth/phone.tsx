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
        {/* Enhanced Header Section */}
        <View style={styles.headerSection}>
          {/* Floating Background Elements */}
          <View style={styles.floatingCircle1}>
            <Ionicons name="people-outline" size={24} color="rgba(255,255,255,0.3)" />
          </View>
          <View style={styles.floatingCircle2}>
            <Ionicons name="megaphone-outline" size={20} color="rgba(255,255,255,0.25)" />
          </View>
          <View style={styles.floatingCircle3}>
            <Ionicons name="flag-outline" size={18} color="rgba(255,255,255,0.2)" />
          </View>
          
          {/* Main Icon with Enhanced Design */}
          <View style={styles.iconContainer}>
            <View style={styles.iconGlow}>
              <Image source={require('../../../assets/images/logo.png')} style={styles.icon} />
            </View>
          </View>
          
          {/* App Title with Better Typography */}
          <View style={styles.titleContainer}>
            <Text style={styles.appName}>JanSetu</Text>
            <View style={styles.underline} />
            <Text style={styles.tagline}>Empowering Citizens • Building Trust</Text>
            <Text style={styles.subtitle}>Your Voice, Your Community</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.welcomeCard}>
            
            <Text style={styles.welcomeSubtitle}>
              Sign in securely with your phone number
            </Text>
            
            

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
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCircle1: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCircle2: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCircle3: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  iconGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'contain',
  },
  titleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    fontStyle: 'italic',
    textAlign: 'center',
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