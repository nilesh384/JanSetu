import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from "expo-router";
import { Platform, View, Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef } from 'react';
import { Colors, Radii, Shadows } from '../../styles/designSystem';

interface TabIconProps {
  focused: boolean;
  name: string;
  outlineName: string;
  label: string;
}

const ModernTabItem = ({ focused, name, outlineName, label }: TabIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.tabItemContainer, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
        <Ionicons
          name={(focused ? name : outlineName) as any}
          size={22}
          color={focused ? Colors.primary : '#64748B'}
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
      {focused && <View style={styles.activeIndicatorDot} />}
    </Animated.View>
  );
};

const CenterReportButton = ({ focused, onPress }: { focused: boolean; onPress?: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : 1.0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.centerButtonOuter}
    >
      <Animated.View style={[styles.centerButton, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.centerButtonInner}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
      </Animated.View>
      <Text style={[styles.tabLabel, styles.reportButtonLabel]} numberOfLines={1}>Report</Text>
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/phone' as any);
    }
  }, [isAuthenticated, isLoading]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const isIos = Platform.OS === 'ios';
  const bottomInset = insets.bottom > 0 ? insets.bottom : (isIos ? 22 : 10);
  const tabHeight = (isIos ? 58 : 60) + bottomInset;

  return (
    <View style={styles.container}>
      <Tabs
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: tabHeight,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            elevation: 12,
            shadowColor: '#0F172A',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            paddingBottom: bottomInset,
            paddingTop: 6,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <ModernTabItem
                focused={focused}
                name="home"
                outlineName="home-outline"
                label="Home"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Complaints"
          options={{
            title: "Track",
            tabBarIcon: ({ focused }) => (
              <ModernTabItem
                focused={focused}
                name="layers"
                outlineName="layers-outline"
                label="Track"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Post"
          options={{
            title: "Report",
            tabBarIcon: ({ focused }) => (
              <CenterReportButton
                focused={focused}
                onPress={() => router.push('/(tabs)/Post' as any)}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Social"
          options={{
            title: "Social",
            tabBarIcon: ({ focused }) => (
              <ModernTabItem
                focused={focused}
                name="chatbubbles"
                outlineName="chatbubbles-outline"
                label="Social"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <ModernTabItem
                focused={focused}
                name="person"
                outlineName="person-outline"
                label="Profile"
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minWidth: 54,
  },
  iconWrapper: {
    width: 38,
    height: 32,
    borderRadius: Radii.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryMuted,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  centerButtonOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -14,
    width: 72,
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    padding: 3,
    ...Shadows.floating,
  },
  centerButtonInner: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonLabel: {
    color: Colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
    width: 72,
  },
});
