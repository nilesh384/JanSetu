import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/src/styles/designSystem';

export default function IssueTracker() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNavigateToMyComplaints = () => {
    router.push('/complaints/my' as any);
  };

  const handleNavigateToNearbyComplaints = () => {
    router.push('/complaints/nearby' as any);
  };

  const resolutionSteps = [
    {
      step: '1',
      title: 'Report Filed',
      desc: 'Instant ticket generated with GPS coordinates.',
      icon: 'document-text-outline',
      color: Colors.primary,
      bg: '#FFF7ED',
    },
    {
      step: '2',
      title: 'AI & Dept Routing',
      desc: 'Assigned automatically to relevant municipality.',
      icon: 'git-network-outline',
      color: '#0284C7',
      bg: '#F0F9FF',
    },
    {
      step: '3',
      title: 'Field Inspection',
      desc: 'Civic personnel dispatched for site inspection.',
      icon: 'construct-outline',
      color: '#7C3AED',
      bg: '#FAF5FF',
    },
    {
      step: '4',
      title: 'Proof & Resolution',
      desc: 'Resolved with before/after photos & citizen sign-off.',
      icon: 'checkmark-circle-outline',
      color: Colors.success,
      bg: '#ECFDF5',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />

          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.primaryDark} />
            <Text style={styles.heroBadgeText}>Citizen Redressal Hub</Text>
          </View>

          <Text style={styles.heroTitle}>Issue Tracker & Grievance Portal</Text>
          

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatPill}>
              <Ionicons name="flash" size={12} color={Colors.primary} />
              <Text style={styles.heroStatText}>Live SLA Tracking</Text>
            </View>
            <View style={styles.heroStatPill}>
              <Ionicons name="lock-closed" size={12} color={Colors.successDark} />
              <Text style={styles.heroStatText}>Tamper-Proof Audit</Text>
            </View>
          </View>
        </View>

        {/* Primary Action Cards */}
        <View style={styles.cardsContainer}>
          {/* My Complaints Card */}
          <TouchableOpacity
            style={styles.navigationCard}
            onPress={handleNavigateToMyComplaints}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#FFF7ED' }]}>
                <MaterialIcons name="person" size={26} color={Colors.primaryDark} />
              </View>

              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{t('complaints.myComplaints') || 'My Complaints'}</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>My Filed Grievances</Text>
            

            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>{t('complaints.viewDetails') || 'View Details'}</Text>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Nearby Complaints Card */}
          <TouchableOpacity
            style={styles.navigationCard}
            onPress={handleNavigateToNearbyComplaints}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="location" size={26} color="#0284C7" />
              </View>

              <View style={[styles.cardBadge, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Text style={[styles.cardBadgeText, { color: '#0284C7' }]}>
                  {t('complaints.allNearbyComplaints') || 'Ward Issues'}
                </Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Ward & Nearby Feed</Text>
            

            <View style={styles.cardFooter}>
              <Text style={[styles.cardAction, { color: '#0284C7' }]}>
                {t('complaints.explore') || 'Explore Locality'}
              </Text>
              <View style={[styles.arrowCircle, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="arrow-forward" size={14} color="#0284C7" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Resolution Transparency Journey */}
        <View style={styles.lifecycleSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="git-branch-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>How Resolution Works</Text>
          </View>
          <Text style={styles.lifecycleSubtitle}>
            Every grievance filed on JanSetu goes through a 4-step accountable timeline.
          </Text>

          <View style={styles.stepsGrid}>
            {resolutionSteps.map((item) => (
              <View key={item.step} style={styles.stepCard}>
                <View style={[styles.stepIconWrap, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <View style={[styles.stepBadgeNumber, { backgroundColor: item.color }]}>
                    <Text style={styles.stepBadgeText}>{item.step}</Text>
                  </View>
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Report CTA */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/Post' as any)}
            activeOpacity={0.9}
          >
            <View style={styles.quickActionIconWrap}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.quickActionTextWrap}>
              <Text style={styles.quickActionTitle}>
                {t('complaints.reportNewIssue') || 'Report a New Civic Issue'}
              </Text>
              <Text style={styles.quickActionSubtitle}>
                Takes less than 30 seconds with instant camera photo
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 95,
  },
  heroCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.large,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    ...Shadows.card,
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(2, 132, 199, 0.06)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.md,
    gap: 12,
    marginBottom: Spacing.lg,
  },
  navigationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.large,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  cardBadgeText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifecycleSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.text,
  },
  lifecycleSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  stepCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.soft,
  },
  stepIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  stepBadgeNumber: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  quickActionsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radii.card,
    ...Shadows.floating,
    gap: 12,
  },
  quickActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTextWrap: {
    flex: 1,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  quickActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    marginTop: 2,
  },
});
