import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Colors = {
  // Brand Identity (Warm Civic Saffron & Amber)
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  primaryDark: '#EA580C',
  primaryMuted: '#FFF7ED',
  primaryTint: '#FFEDD5',

  // Civic Emerald & Teal
  secondary: '#0D9488',
  secondaryLight: '#14B8A6',
  secondaryDark: '#0F766E',
  secondaryMuted: '#F0FDFA',

  // Accent Colors
  accent: '#3B82F6',
  accentDark: '#1D4ED8',
  accentMuted: '#EFF6FF',

  // Semantic Status
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  successMuted: '#ECFDF5',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningMuted: '#FEF3C7',

  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDark: '#DC2626',
  dangerMuted: '#FEF2F2',

  info: '#0284C7',
  infoMuted: '#F0F9FF',

  // Neutrals & Surfaces
  background: '#F8FAFC',
  backgroundAlt: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',

  // Typography
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  textInverted: '#FFFFFF',
  muted: '#94A3B8',

  // Borders & Dividers
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  borderSubtle: '#F1F5F9',

  // Effects
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowStrong: 'rgba(15, 23, 42, 0.16)',
  overlay: 'rgba(15, 23, 42, 0.6)',
  subtleGlow: 'rgba(255, 107, 53, 0.15)',
  saffronGlow: 'rgba(255, 107, 53, 0.25)',
  cardGradientStart: '#FFFFFF',
  cardGradientEnd: '#FAFBFD',
};

export const Typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif' }),
  weight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '800'
  },
  sizes: {
    xxs: 11,
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 30,
    displayLarge: 36
  }
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const Radii = {
  xs: 6,
  small: 8,
  base: 12,
  card: 18,
  large: 24,
  pill: 999,
  round: 999,
};

export const Metrics = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  tabBarHeight: Platform.OS === 'ios' ? 88 : 72,
};

export const Shadows = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  floating: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function responsiveSize(size: number) {
  const baseWidth = 375;
  return Math.round((size * SCREEN_WIDTH) / baseWidth);
}

export default {
  Colors,
  Typography,
  Spacing,
  Radii,
  Metrics,
  Shadows,
  responsiveSize,
};
