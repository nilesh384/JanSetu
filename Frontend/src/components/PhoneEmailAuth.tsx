import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
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
      <TouchableOpacity
        style={[styles.button, (loading || showWebView) && styles.buttonDisabled]}
        onPress={handleOpenWebView}
        disabled={loading || showWebView}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="phone-portrait-outline" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Continue with Phone (FREE)</Text>
          </>
        )}
      </TouchableOpacity>
      
      <Text style={styles.infoText}>
        Free SMS verification • No charges • Secure
      </Text>

      {/* WebView Modal for phone.email authentication */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={handleCloseWebView}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Phone Verification</Text>
            <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#333" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
});

export default PhoneEmailAuth;
