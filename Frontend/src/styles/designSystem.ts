import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Colors = {
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  secondary: '#0F766E',
  accent: '#1D4ED8',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  muted: '#94A3B8',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  shadow: 'rgba(15,23,42,0.10)',
  overlay: 'rgba(15,23,42,0.56)',
  subtleGlow: 'rgba(249,115,22,0.12)'
};

export const Typography = {
  family: Platform.select({ ios: 'Sora', android: 'Sora' }),
  weight: {
    regular: '400',
    medium: '600',
    bold: '700',
    black: '800'
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    display: 32,
    displayLarge: 36
  }
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radii = {
  small: 8,
  base: 14,
  round: 999,
  card: 18,
  large: 24
};

export const Metrics = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  tabBarHeight: Platform.OS === 'ios' ? 88 : 70,
};

export function responsiveSize(size: number) {
  // Simple scale based on 375pt width baseline
  const baseWidth = 375;
  return Math.round((size * SCREEN_WIDTH) / baseWidth);
}

export default {
  Colors,
  Typography,
  Spacing,
  Radii,
  Metrics,
  responsiveSize,
};
