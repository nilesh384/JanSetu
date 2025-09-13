import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Stack } from 'expo-router';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If authenticated, show the main app
  if (isAuthenticated) {
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="complaints/my" options={{ headerShown: false }} />
        <Stack.Screen name="complaints/nearby" options={{ headerShown: false }} />
        <Stack.Screen name="profileSettings/about" options={{ headerShown: false }} />
        <Stack.Screen name="profileSettings/advanced" options={{ headerShown: false }} />
        <Stack.Screen name="profileSettings/help" options={{ headerShown: false }} />
        <Stack.Screen name="profileSettings/notifications" options={{ headerShown: false }} />
        <Stack.Screen name="profileSettings/personal" options={{ headerShown: false }} />
        <Stack.Screen name="profileSettings/privacy" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If not authenticated, show auth screens
  return (
    <Stack>
      <Stack.Screen name="auth/phone" options={{ headerShown: false }} />
      <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});