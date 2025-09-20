import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ComplaintsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to phone login if not authenticated
      router.replace('/auth/phone' as any);
    }
  }, [isAuthenticated, isLoading]);

  // Don't render if not authenticated or still loading
  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack
        screenOptions={{
          headerShown: false, // Disable default headers for all complaint screens
        }}
      >
      <Stack.Screen 
        name="my" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
      <Stack.Screen 
        name="nearby" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
    </Stack>
    </SafeAreaView>
  );
}