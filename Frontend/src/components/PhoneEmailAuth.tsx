import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface PhoneEmailAuthProps {
  onSuccess: (userData: any) => void;
  onError?: (error: string) => void;
}

/**
 * Phone.email Authentication Component
 * FREE phone verification using WebView
 * 
 * How it works:
 * 1. User taps "Continue with Phone (FREE)"
 * 2. Opens WebView with phone.email authentication
 * 3. User enters phone & OTP (handled by phone.email)
 * 4. WebView returns JWT token via postMessage
 * 5. App verifies JWT with backend
 */
const PhoneEmailAuth: React.FC<PhoneEmailAuthProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    // Get device ID
    const id = Constants.deviceId || Constants.sessionId || `device_${Date.now()}`;
    setDeviceId(id);
  }, []);

  const handleWebViewMessage = async (event: any) => {
    try {
      // Get JWT token from WebView
      const encodedJWT = event.nativeEvent.data;
      
      if (!encodedJWT || encodedJWT === 'undefined') {
        console.log('⚠️ No JWT token received');
        return;
      }

      console.log('📱 Received JWT from phone.email');
      setShowWebView(false);
      setLoading(true);

      // Verify JWT token with your backend
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/v1/otp/verify-phone-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt: encodedJWT }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Phone verified and user created/logged in:', data.user.phoneNumber);
        // Pass the complete user data and auth info
        onSuccess({
          user: data.user,
          isNewUser: data.isNewUser,
          requiresProfileSetup: data.requiresProfileSetup,
          phoneEmailData: data.phoneEmailData
        });
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Token verification error:', error);
      Alert.alert('Error', 'Failed to verify phone number. Please try again.');
      onError?.(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWebView = () => {
    setShowWebView(true);
  };

  const handleCloseWebView = () => {
    setShowWebView(false);
  };

  // Get CLIENT_ID from environment
  const clientId = process.env.EXPO_PUBLIC_PHONE_EMAIL_CLIENT_ID || 'YOUR_CLIENT_ID';
  
  // Build phone.email auth URL (auth_type=4 means phone authentication)
  const authURL = `https://auth.phone.email/log-in?client_id=${clientId}&auth_type=4&device=${deviceId}`;

  return (
    <View style={styles.container}>
      {/* Terms and Privacy Agreement */}
      <View style={styles.agreementContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxText}>I agree to the </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowTermsModal(true)}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.checkboxText}> and </Text>
        <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || showWebView || !agreedToTerms) && styles.buttonDisabled]}
        onPress={handleOpenWebView}
        disabled={loading || showWebView || !agreedToTerms}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="phone-portrait-outline" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Continue with Phone</Text>
          </>
        )}
      </TouchableOpacity>
      
    

      {/* WebView Modal for phone.email authentication */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={handleCloseWebView}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="phone-portrait-outline" size={24} color="#FFFFFF" />
              <Text style={styles.webViewTitle}>OTP Verification</Text>
            </View>
            <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          
          <WebView
            source={{ uri: authURL }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
              <Text style={styles.modalTitle}>Terms of Service</Text>
            </View>
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`Terms of Service

Last Updated: January 25, 2026

1. Acceptance of Terms
By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily use this application for personal, non-commercial transitory viewing only.

3. Disclaimer
The materials on this application are provided on an 'as is' basis. This application makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall this application or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use this application.

5. Accuracy of Materials
The materials appearing on this application could include technical, typographical, or photographic errors. This application does not warrant that any of the materials on its application are accurate, complete, or current.

6. Links
This application has not reviewed all of the sites linked to its application and is not responsible for the contents of any such linked site.

7. Modifications
This application may revise these terms of service for its application at any time without notice. By using this application you are agreeing to be bound by the then current version of these terms of service.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.`}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" />
              <Text style={styles.modalTitle}>Privacy Policy</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={styles.closeButton}>
              <View style={styles.closeButtonCircle}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              {`Privacy Policy

Last Updated: January 25, 2026

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Data Retention
We retain personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy.

6. Your Rights
You have the right to access, update, or delete your personal information. You may also object to or restrict certain processing of your information.

7. Cookies and Tracking
We may use cookies and similar tracking technologies to enhance your experience with our services.

8. Third-Party Services
Our services may contain links to third-party websites or services that are not owned or controlled by us.

9. Children's Privacy
Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.

10. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

11. Contact Us
If you have any questions about this privacy policy, please contact us.`}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
  },
  linkText: {
    fontSize: 14,
    color: '#10B981',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    gap: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoText: {
    marginTop: 16,
    fontSize: 13,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  webViewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  modalText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  modalContent: {
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PhoneEmailAuth;
