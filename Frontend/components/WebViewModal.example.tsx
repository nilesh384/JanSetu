/**
 * WebViewModal Component Usage Examples
 *
 * This component provides an in-app web browser experience with:
 * - Navigation controls (back, forward, reload)
 * - Loading indicators
 * - Error handling
 * - Modal presentation
 * - Option to open in external browser
 */

// Example usage in any component:

import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import WebViewModal from '../components/WebViewModal';

const ExampleComponent = () => {
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');

  const openWebView = (url: string, title: string) => {
    setCurrentUrl(url);
    setCurrentTitle(title);
    setWebViewVisible(true);
  };

  return (
    <View>
      {/* Example buttons that open WebView */}
      <TouchableOpacity
        onPress={() => openWebView('https://jh.erss.in/', 'Emergency Reporting')}
      >
        <Text>Open Emergency Portal</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => openWebView('https://www.jharkhand.gov.in/', 'Government Portal')}
      >
        <Text>Open Government Portal</Text>
      </TouchableOpacity>

      {/* WebView Modal */}
      <WebViewModal
        visible={webViewVisible}
        url={currentUrl}
        title={currentTitle}
        onClose={() => setWebViewVisible(false)}
      />
    </View>
  );
};

export default ExampleComponent;

/*
Features:
✅ Full-screen web browsing experience
✅ Minimal UI - only close button overlay
✅ Immersive browsing without distractions
✅ Loading indicators with overlay
✅ Error handling with user-friendly messages
✅ Modal presentation (fade animation)
✅ Option to close with overlay button
✅ Responsive design
✅ Safe area support
✅ TypeScript support

Usage:
1. Import WebViewModal
2. Add state for visibility and URL
3. Create handler functions
4. Add WebViewModal component to JSX
5. Call open handler with URL
*/