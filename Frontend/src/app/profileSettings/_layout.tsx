import { Stack } from 'expo-router';

export default function ProfileSettingsLayout() {
  return (
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
  );
}