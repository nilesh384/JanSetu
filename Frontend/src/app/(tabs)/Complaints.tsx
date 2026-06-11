import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Spacing, Typography } from '@/src/styles/designSystem';



export default function IssueTracker() {

  const router = useRouter();
  const { t } = useTranslation();

  const handleNavigateToMyComplaints = () => {
    router.push('/complaints/my' as any);
  };

  const handleNavigateToNearbyComplaints = () => {
    router.push('/complaints/nearby' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />

          

          <Text style={styles.heroTitle}>Issue Tracker</Text>
          

          
        </View>

        {/* Navigation Cards */}
        <View style={styles.cardsContainer}>
          {/* My Complaints Card */}
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={handleNavigateToMyComplaints}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#FFF7ED' }]}>
                <MaterialIcons name="person" size={30} color={Colors.primaryDark} />
              </View>

              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{t('complaints.myComplaints')}</Text>
              </View>
            </View>
            
            <Text style={styles.cardTitle}>Open your reports</Text>
            <Text style={styles.cardDescription}>Check status, progress, and updates in one place.</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>{t('complaints.viewDetails')}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.primaryDark} />
            </View>
          </TouchableOpacity>

          {/* Nearby Complaints Card */}
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={handleNavigateToNearbyComplaints}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="location" size={30} color={Colors.secondary} />
              </View>

              <View style={[styles.cardBadge, { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' }]}>
                <Text style={[styles.cardBadgeText, { color: Colors.secondary }]}>{t('complaints.allNearbyComplaints')}</Text>
              </View>
            </View>
            
            <Text style={styles.cardTitle}>See nearby issues</Text>
            <Text style={styles.cardDescription}>Browse complaints around you without extra steps.</Text>
           
           <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>{t('complaints.explore')}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick action</Text>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/Post' as any)}
            activeOpacity={0.9}
          >
            <MaterialIcons name="report-problem" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>{t('complaints.reportNewIssue')}</Text>
          </TouchableOpacity>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  heroCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.large,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 5,
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -24,
    right: -28,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -34,
    left: -18,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(29,78,216,0.08)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.round,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: Typography.sizes.xl + 6,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 0,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    lineHeight: 18,
    maxWidth: '92%',
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  heroStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.round,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
  },
  heroStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  cardsContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  navigationCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.large,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: Radii.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  cardBadgeText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardAction: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  quickActionsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: Radii.round,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 4,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});
