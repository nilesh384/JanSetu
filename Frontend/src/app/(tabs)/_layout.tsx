import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

export default function RootLayout() {
  return (
    <Tabs
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "#FF6B35", // Saffron orange
        tabBarInactiveTintColor: "#666666",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
          marginBottom: Platform.OS === "ios" ? 0 : 4,
          fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 34 : 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 2,
          borderTopColor: "#FF9933", // Indian flag saffron
          elevation: 25,
          shadowColor: "#FF6B35",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          position: "absolute",
        },
        tabBarBackground: () => (
          <View style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 2,
            borderTopColor: "#FF9933",
            
          }} />
        ),
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 36,
              borderRadius: 18,
              backgroundColor: focused ? "#FFF3E0" : "transparent", // Light saffron background
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? "#FF9933" : "transparent",
            }}>
              <AntDesign 
                name="home" 
                size={24} 
                color={focused ? "#FF6B35" : "#666666"} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Complaints"
        options={{
          title: "Track Complaints",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 36,
              borderRadius: 18,
              backgroundColor: focused ? "#E8F5E8" : "transparent", // Light green background
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? "#ebb811ff" : "transparent", // Indian flag green
            }}>
              <MaterialIcons 
                name="track-changes" 
                size={24} 
                color={focused ? "#ebb811ff" : "#666666"} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Post"
        options={{
          title: "Report Issue", 
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              width: 62,
              height: 62,
              borderRadius: 46,
              backgroundColor: focused ? "#FF6B35" : "#FF9933", // Saffron gradient
              marginBottom: 34,
              elevation: focused ? 15 : 10,
              shadowColor: "#FF6B35",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              transform: [{ scale: focused ? 1.15 : 1.0 }],
              borderWidth: 3,
              borderColor: "#FFFFFF",
            }}>
              <MaterialIcons 
                name="report-problem" 
                size={26} 
                color="#FFFFFF" 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Social"
        options={{
          title: "Social",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 36,
              borderRadius: 18,
              backgroundColor: focused ? "#E3F2FD" : "transparent", // Light blue background
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? "#000080" : "transparent", // Navy blue from flag
            }}>
              <Ionicons 
                name="chatbubbles" 
                size={24} 
                color={focused ? "#000080" : "#666666"} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 36,
              borderRadius: 18,
              backgroundColor: focused ? "#FFF3E0" : "transparent", // Light saffron background
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? "#FF9933" : "transparent",
            }}>
              <Feather 
                name="user" 
                size={24} 
                color={focused ? "#FF6B35" : "#666666"} 
              />
            </View>
          ),
        }}
      />
      {/* <Stack.Screen name="modal" options={{ presentation: "modal" }} /> */}
    </Tabs>
  )
}