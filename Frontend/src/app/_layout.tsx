import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import AuthWrapper from "../components/AuthWrapper";
import FloatingChatbot from "../components/FloatingChatbot";
import offlineStorage from "../services/offlineStorage";
import "../i18n"; // Initialize i18n
import { usePathname } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Initialize offline storage service
offlineStorage.checkNetworkStatus();

function RootLayoutContent() {
  const pathname = usePathname();

  // Hide chatbot on auth screens, index screen, and other non-app screens
  const shouldShowChatbot = !pathname.includes('/auth/') && 
                           !pathname.includes('index') && 
                           !pathname.includes('../context/AuthContext.tsx') && 
                           !pathname.includes('../components/AuthWrapper.tsx');

  return (
    <>
      <AuthWrapper>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/phone" options={{ headerShown: false }} />
          <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="complaints" options={{ headerShown: false }} />
          <Stack.Screen name="profileSettings" options={{ headerShown: false }} />
          <Stack.Screen name="reportDetails" options={{ headerShown: false }} />
          <Stack.Screen name="user-details" options={{ headerShown: false }} />
        </Stack>
      </AuthWrapper>
      {shouldShowChatbot && <FloatingChatbot />}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
