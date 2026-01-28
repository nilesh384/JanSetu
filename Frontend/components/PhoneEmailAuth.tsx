import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';

interface PhoneEmailAuthProps {
  onSuccess: (jwt: string, phoneData: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  clientId: string; // Get from https://admin.phone.email
}

/**
 * Phone.Email Authentication Component
 * 
 * FREE phone verification using phone.email service
 * No SMS costs - they handle OTP sending and verification
 * 
 * Usage:
 * 1. Sign up at https://admin.phone.email
 * 2. Get your CLIENT_ID from dashboard
 * 3. Use this component to get verified phone numbers
 * 
 * @param onSuccess - Called with JWT token when user verifies phone
 * @param onError - Called if authentication fails
 * @param clientId - Your phone.email CLIENT_ID
 */
const PhoneEmailAuth: React.FC<PhoneEmailAuthProps> = ({
  onSuccess,
  onError,
  onCancel,
  clientId,
}) => {
  const [showWebView, setShowWebView] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Get unique device ID
    const fetchDeviceId = async () => {
      try {
        // Using expo-device for unique ID
        const id = Device.osInternalBuildId || Device.modelId || 'unknown-device';
        setDeviceId(id);
      } catch (error) {
        console.error('Error getting device ID:', error);
        setDeviceId('default-device-id');
      }
    };

    fetchDeviceId();
  }, []);

  const handleStartAuth = () => {
    if (!clientId) {
      onError('CLIENT_ID not configured. Sign up at https://admin.phone.email');
      return;
    }
    setShowWebView(true);
    setIsLoading(true);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      // Phone.email sends JWT token via postMessage
      const encodedJWT = event.nativeEvent.data;
      
      if (encodedJWT && encodedJWT.length > 0) {
        console.log('📱 Received JWT from phone.email');
        
        // Close webview
        setShowWebView(false);
        setIsLoading(false);
        
        // Decode JWT to extract phone data (optional - for display)
        try {
          const payload = JSON.parse(atob(encodedJWT.split('.')[1]));
          onSuccess(encodedJWT, payload);
        } catch (decodeError) {
          // If decode fails, still pass the JWT
          onSuccess(encodedJWT, null);
        }
      }
    } catch (error) {
      console.error('Error handling phone.email message:', error);
      onError('Failed to process authentication response');
      setShowWebView(false);
      setIsLoading(false);
    }
  };

  const handleWebViewError = (event: any) => {
    console.error('Phone.email webview error:', event.nativeEvent);
    onError('Authentication failed. Please try again.');
    setShowWebView(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setShowWebView(false);
    setIsLoading(false);
    onCancel?.();
  };

  // Build phone.email auth URL
  // auth_type=4 means phone number authentication
  const authURL = `https://auth.phone.email/log-in?client_id=${clientId}&auth_type=4&device=${deviceId}`;

  return (
    <>
      {/* Sign in with Phone Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleStartAuth}
        disabled={!deviceId}
      >
        <Ionicons name="call-outline" size={20} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Sign in with Phone (FREE)</Text>
      </TouchableOpacity>

      {/* WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Phone Verification</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading verification...</Text>
            </View>
          )}

          {/* WebView */}
          <WebView
            ref={webViewRef}
            source={{ uri: authURL }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            onError={handleWebViewError}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  webView: {
    flex: 1,
  },
});

export default PhoneEmailAuth;
