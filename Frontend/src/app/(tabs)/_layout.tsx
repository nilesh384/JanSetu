import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { Platform, View, Animated } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';

const AnimatedTabIcon = ({ focused, icon, outlineIcon, color, inactiveColor }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: focused ? -20 : 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={{
      alignItems: "center",
      justifyContent: "center",
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: focused ? "#FFF3E0" : "transparent",
      transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
      elevation: focused ? 8 : 0,
      shadowColor: focused ? "#FF6B35" : "transparent",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: focused ? 0.3 : 0,
      shadowRadius: 6,
      borderWidth: focused ? 2 : 0,
      borderColor: "#FFFFFF",
    }}>
      <Ionicons 
        name={focused ? icon : outlineIcon}
        size={24} 
        color={focused ? color : inactiveColor} 
      />
    </Animated.View>
  );
};

const AnimatedReportButton = ({ focused }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1.0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.spring(rotateAnim, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View style={{
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: focused ? "#FF6B35" : "#FF8C5A",
      marginBottom: 32,
      elevation: focused ? 24 : 16,
      shadowColor: "#FF6B35",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      transform: [{ scale: scaleAnim }, { rotate: rotation }],
      borderWidth: 5,
      borderColor: "#FFFFFF",
    }}>
      <Ionicons 
        name="add" 
        size={28} 
        color="#FFFFFF" 
      />
    </Animated.View>
  );
};

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to phone login if not authenticated
      router.replace('/auth/phone' as any);
    }
  }, [isAuthenticated, isLoading]);

  // Don't render tabs if not authenticated or still loading
  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        initialRouteName="Home"
        screenOptions={{
          tabBarActiveTintColor: "#FF6B35",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 4,
            marginBottom: Platform.OS === "ios" ? 0 : 6,
            fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
          },
          tabBarItemStyle: {
            paddingTop: 6,
            paddingBottom: Platform.OS === "ios" ? 0 : 6,
          },
          tabBarStyle: {
            height: Platform.OS === "ios" ? 88 : 70,
            paddingTop: 6,
            paddingBottom: Platform.OS === "ios" ? 34 : 10,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            elevation: 24,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            position: "absolute",
          },
          tabBarBackground: () => (
            <View style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
            }}>
              <View style={{
                position: 'absolute',
                top: -20,
                left: '50%',
                marginLeft: -40,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FFFFFF',
              }} />
            </View>
          ),
        }}
      >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon 
              focused={focused}
              icon="home"
              outlineIcon="home-outline"
              color="#FF6B35"
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Complaints"
        options={{
          title: "Track",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon 
              focused={focused}
              icon="list"
              outlineIcon="list-outline"
              color="#FF6B35"
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Post"
        options={{
          title: "Report", 
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AnimatedReportButton focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="Social"
        options={{
          title: "Social",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon 
              focused={focused}
              icon="chatbubbles"
              outlineIcon="chatbubbles-outline"
              color="#FF6B35"
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon 
              focused={focused}
              icon="person"
              outlineIcon="person-outline"
              color="#FF6B35"
              inactiveColor="#9CA3AF"
            />
          ),
        }}
      />
      {/* <Stack.Screen name="modal" options={{ presentation: "modal" }} /> */}
    </Tabs>
    </SafeAreaView>
  )
}