import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface UniversalHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  titleStyle?: any;
  containerStyle?: any;
  backButtonColor?: string;
}

export default function UniversalHeader({
  title,
  showBackButton = true,
  rightComponent,
  onBackPress,
  titleStyle,
  containerStyle,
  backButtonColor = '#000000'
}: UniversalHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      // Smart back navigation
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/(tabs)/Home');
        }
      } catch (error) {
        console.log('Navigation error:', error);
        // Fallback navigation
        try {
          router.push('/(tabs)/Home');
        } catch (fallbackError) {
          console.log('Fallback navigation error:', fallbackError);
        }
      }
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left Section - Back Button */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={backButtonColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Section - Custom Component */}
      <View style={styles.rightSection}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 56,
    marginTop: 20,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});