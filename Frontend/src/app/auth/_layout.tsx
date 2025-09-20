import { Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AuthLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="phone" options={{ headerShown: false }} />
        <Stack.Screen name="otp" options={{ headerShown: false }} />
        <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}