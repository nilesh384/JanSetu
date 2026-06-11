import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography, responsiveSize } from '../styles/designSystem';

type HomeHeaderProps = {
  userName?: string;
  onReportPress?: () => void;
  onExplorePress?: () => void;
};

export default function HomeHeader({
  userName = 'Citizen',
  onReportPress,
  onExplorePress,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.topRow}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
          </View>
        </View>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={12} color={Colors.primary} />
          <Text style={styles.badgeText}>JanSetu</Text>
        </View>
      </View>

      <Text style={styles.title}>Welcome back, {userName}</Text>
      <Text style={styles.subtitle}>
        Report issues, track progress, and stay connected with your community.
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.primaryAction, styles.actionShadow]}
          activeOpacity={0.9}
          onPress={onReportPress}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.primaryActionText}>Report issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAction}
          activeOpacity={0.85}
          onPress={onExplorePress}
        >
          <Ionicons name="compass" size={18} color={Colors.primaryDark} />
          <Text style={styles.secondaryActionText}>Explore nearby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radii.large,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  glowOne: {
    position: 'absolute',
    top: -72,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.subtleGlow,
  },
  glowTwo: {
    position: 'absolute',
    bottom: -90,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(15,118,110,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    backgroundColor: 'rgba(249,115,22,0.14)',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.round,
    backgroundColor: 'rgba(249,115,22,0.10)',
  },
  badgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weight.bold as any,
    color: Colors.primaryDark,
  },
  title: {
    fontSize: responsiveSize(28),
    lineHeight: responsiveSize(34),
    fontWeight: Typography.weight.black as any,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    lineHeight: 23,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radii.round,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weight.bold as any,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radii.round,
    paddingVertical: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  secondaryActionText: {
    color: Colors.primaryDark,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weight.bold as any,
  },
  actionShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
});