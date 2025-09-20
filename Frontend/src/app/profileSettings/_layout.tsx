import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ProfileSettingsLayout() {
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
          headerShown: false, // Disable default headers for all profile settings screens
        }}
      >
      <Stack.Screen 
        name="about" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
      <Stack.Screen 
        name="advanced" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
        <Stack.Screen 
        name="help" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
        <Stack.Screen 
        name="notifications" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
        <Stack.Screen 
        name="personal" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
        <Stack.Screen 
        name="privacy" 
        options={{ 
          headerShown: false,
          title: '' 
        }} 
      />
    </Stack>
    </SafeAreaView>
  );
}