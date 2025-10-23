import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import AuthWrapper from "../components/AuthWrapper";
import FloatingChatbot from "../components/FloatingChatbot";
import offlineStorage from "../services/offlineStorage";
import "../i18n"; // Initialize i18n
import { usePathname, useRouter } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import NotificationService from '../services/notificationService';

// Initialize offline storage service
offlineStorage.checkNetworkStatus();

function RootLayoutContent() {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize notification service and handle deep links
  useEffect(() => {
    let notificationService: typeof NotificationService;

    const setupDeepLinking = async () => {
      try {
        // Initialize notification service
        notificationService = NotificationService;
        await notificationService.initialize();

        // Handle deep links from app launch
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('🔗 App opened with deep link:', initialUrl);
          handleDeepLink(initialUrl);
        }

        // Listen for deep links while app is running
        const handleUrl = ({ url }: { url: string }) => {
          console.log('🔗 Deep link received:', url);
          handleDeepLink(url);
        };

        const subscription = Linking.addEventListener('url', handleUrl);

        // Process any pending notifications
        setTimeout(() => {
          notificationService.processPendingNotifications();
        }, 2000);

        return () => {
          subscription?.remove();
        };
      } catch (error) {
        console.error('❌ Error setting up deep linking:', error);
      }
    };

    interface DeepLinkParams {
      id?: string | null;
      t?: number;
    }

    const handleDeepLink = (url: string): void => {
      console.log('🔗 Processing deep link:', url);

      try {
        const urlParts: string[] = url.split('?');
        const path: string = urlParts[0].replace('jansetu://', '');
        const queryString: string | undefined = urlParts[1];

        if (path === 'reportDetails' && queryString) {
          const params = new URLSearchParams(queryString);
          const reportId: string | null = params.get('id');

          if (reportId) {
            console.log('🎯 Navigating to report via deep link:', reportId);

            // Add delay to ensure app is ready
            setTimeout(() => {
              try {
                router.push({
                  pathname: '/reportDetails',
                  params: { id: reportId, t: Date.now() }
                });
                console.log('✅ Deep link navigation successful');
              } catch (error) {
                console.error('❌ Deep link navigation failed:', error);
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('❌ Deep link parsing error:', error);
      }
    };

    setupDeepLinking();

    return () => {
      // Cleanup if needed
    };
  }, [router]);

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
          <Stack.Screen name="auth" options={{ headerShown: false }} />
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
