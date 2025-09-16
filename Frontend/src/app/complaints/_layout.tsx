import { Stack } from 'expo-router';

export default function ComplaintsLayout() {
  return (
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
  );
}