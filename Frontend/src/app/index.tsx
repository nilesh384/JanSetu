import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { isLoading, isAuthenticated, requiresProfileSetup, checkAuthStatus } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      // Wait for auth check to complete
      await checkAuthStatus();
      
      // Navigate based on authentication status
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          if (requiresProfileSetup) {
            router.replace("/auth/profile-setup" as any);
          } else {
            router.replace("/(tabs)/Home" as any);
          }
        } else {
          router.replace("/auth/phone" as any);
        }
      }, 100);

      return () => clearTimeout(timer);
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [isLoading, isAuthenticated, requiresProfileSetup]);

  // Show loading screen while checking authentication
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});