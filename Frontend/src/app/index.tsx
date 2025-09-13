import { useEffect } from "react";
import { router } from "expo-router";
import { View } from "react-native";

export default function Index() {
  useEffect(() => {
    // Navigate to Home tab on app load
    const timer = setTimeout(() => {
      router.replace("/(tabs)/Home" as any);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return <View style={{ flex: 1 }} />;
}