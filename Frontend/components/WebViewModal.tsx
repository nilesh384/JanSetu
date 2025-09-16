import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';

interface WebViewModalProps {
  visible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WebViewModal: React.FC<WebViewModalProps> = ({
  visible,
  url,
  title = 'Web View',
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);

  // Manage status bar when modal is visible
  useEffect(() => {
    if (visible) {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    }
  }, [visible]);

  const handleNavigationStateChange = (navState: any) => {
    setCurrentUrl(navState.url);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error: ', nativeEvent);
    Alert.alert(
      'Error',
      'Failed to load the webpage. Please check your internet connection.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <View style={[styles.modalContainer, { width, height }]}>
      <Modal
        visible={visible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        onRequestClose={onClose}
        style={styles.modal}
      >
        <View style={[styles.fullScreenContainer, { width, height }]}>
          {/* Status Bar Background for Android */}
          {Platform.OS === 'android' && (
            <View style={styles.statusBarBackground} />
          )}

          {/* Close Button Overlay */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButtonOverlay}
            activeOpacity={0.7}
          >
            <View style={styles.closeButton}>
              <AntDesign name="close" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Loading Indicator Overlay */}
          {loading && (
            <View style={[styles.loadingOverlay, { width, height }]}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Loading webpage...</Text>
              </View>
            </View>
          )}

          {/* WebView */}
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={[styles.fullScreenWebView, { width, height }]}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            bounces={false}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    padding: 0,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  statusBarBackground: {
    height: StatusBar.currentHeight || 24,
    backgroundColor: '#000',
  },
  closeButtonOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 20,
    right: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fullScreenWebView: {
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 5,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default WebViewModal;