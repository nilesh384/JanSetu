import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radii, responsiveSize } from '../styles/designSystem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { paddingTop: insets.top + responsiveSize(10), marginTop: insets.top > 0 ? Spacing.sm : 0 }, containerStyle]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={backButtonColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

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
    paddingHorizontal: Spacing.md,
    paddingVertical: responsiveSize(10),
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,232,240,0.8)',
    minHeight: responsiveSize(60),
    marginHorizontal: Spacing.md,
    borderRadius: Radii.card,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
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
    padding: 10,
    borderRadius: Radii.round,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weight.bold as any,
    color: Colors.text,
    textAlign: 'center',
  },
});