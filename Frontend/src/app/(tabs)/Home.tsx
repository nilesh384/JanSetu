import HomeHeader from '@/components/HomeHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getNearbyReports, getCommunityStats } from '@/src/api/report';
import { useAuth } from '@/src/context/AuthContext';
import { Report } from '@/src/types/report';
import { formatTimeAgo, parseServerDate } from '@/src/utils/date';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import notificationService from '@/src/services/notificationService';
import BiometricOnboarding from '@/src/components/BiometricOnboarding';
import { useBiometricOnboarding } from '@/src/utils/useBiometricOnboarding';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/src/styles/designSystem';

// Status helper functions
const getStatusColor = (status?: string): string => {
  const statusColors: { [key: string]: string } = {
    pending: '#D97706',
    assigned: '#7C3AED',
    in_progress: '#2563EB',
    resolved: '#059669',
    rejected: '#DC2626',
  };
  return statusColors[status?.toLowerCase() || 'pending'] || '#D97706';
};

const getStatusBgColor = (status?: string): string => {
  const statusBgColors: { [key: string]: string } = {
    pending: '#FEF3C7',
    assigned: '#F3E8FF',
    in_progress: '#DBEAFE',
    resolved: '#DCFCE7',
    rejected: '#FEE2E2',
  };
  return statusBgColors[status?.toLowerCase() || 'pending'] || '#FEF3C7';
};

const getStatusText = (status: string | undefined, t: any): string => {
  const statusLabels: { [key: string]: string } = {
    pending: t('home.pending') || 'Pending Review',
    assigned: t('home.assigned') || 'Assigned',
    in_progress: t('home.inProgress') || 'In Progress',
    resolved: t('home.resolved') || 'Resolved',
    rejected: t('home.rejected') || 'Rejected',
  };
  return statusLabels[status?.toLowerCase() || 'pending'] || 'Pending';
};

const getStatusIcon = (status?: string): keyof typeof Ionicons.glyphMap => {
  const statusIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    pending: 'time-outline',
    assigned: 'person-outline',
    in_progress: 'hourglass-outline',
    resolved: 'checkmark-circle',
    rejected: 'close-circle',
  };
  return statusIcons[status?.toLowerCase() || 'pending'] || 'time-outline';
};

interface ExtendedReport extends Report {
  distance?: number;
}

interface CommunityStatsResponse {
  success: boolean;
  stats?: {
    totalReports: number;
    resolvedReports: number;
    resolutionRate: number;
    avgResponseTime: string;
  };
  message?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { 
    shouldShowOnboarding, 
    biometricType, 
    markOnboardingAsShown 
  } = useBiometricOnboarding();
  
  const [nearbyReports, setNearbyReports] = useState<ExtendedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [communityStats, setCommunityStats] = useState({
    reportsSubmitted: 0,
    issuesResolved: 0,
    resolutionRate: '0%',
    avgResponseTime: '0.0'
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const fetchNearbyReports = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const response = (await getNearbyReports(userLocation, 5)) as any;

      if (response && response.success && response.reports) {
        const reportsWithDistance = response.reports
          .map((report: any) => {
            if (report.latitude && report.longitude && userLocation) {
              const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                report.latitude,
                report.longitude
              );
              return { ...report, distance };
            }
            return report;
          })
          .sort((a: any, b: any) => {
            const ta = parseServerDate(a.createdAt)?.getTime() || 0;
            const tb = parseServerDate(b.createdAt)?.getTime() || 0;
            return tb - ta;
          })
          .slice(0, 3);

        setNearbyReports(reportsWithDistance);
      }
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      setStatsLoading(true);
      const response = (await getCommunityStats()) as CommunityStatsResponse;
      if (response.success && response.stats) {
        setCommunityStats({
          reportsSubmitted: response.stats.totalReports || 0,
          issuesResolved: response.stats.resolvedReports || 0,
          resolutionRate: `${response.stats.resolutionRate || 0}%`,
          avgResponseTime: response.stats.avgResponseTime || '0.0'
        });
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCommunityStats(),
      userLocation ? fetchNearbyReports() : getUserLocation(),
    ]);
    setRefreshing(false);
  }, [userLocation]);

  const initializeNotifications = async () => {
    try {
      const token = await notificationService.initialize();
      if (token && user) {
        await notificationService.updateTokenForUser(user.id);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  useEffect(() => {
    getUserLocation();
    initializeNotifications();

    const timers = [
      setTimeout(() => notificationService.retryPendingNavigation(), 2000),
      setTimeout(() => notificationService.forceNavigationIfPending(), 4000),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyReports();
    }
  }, [userLocation]);

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCommunityStats();
      if (userLocation) {
        fetchNearbyReports();
      }
    }, [userLocation])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Top Utility Bar (Below Camera Notch) */}
      <View style={styles.topUtilityBar}>
        <View style={styles.appBrandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="megaphone" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>JANSETU</Text>
            <Text style={styles.brandSubtitle}>जन सेतु • Citizen Portal</Text>
          </View>
        </View>
        <LanguageSwitcher />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <HomeHeader
          userName={user?.fullName || 'Citizen'}
          onReportPress={() => router.push('/(tabs)/Post' as any)}
          onExplorePress={() => router.push('/complaints/nearby' as any)}
        />

        <View style={styles.content}>
          {/* Recent Nearby Reports Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionIconBadge}>
                  <Ionicons name="location-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.sectionTitleText}>
                  {t('home.recentNearbyReports') || 'Recent Nearby Issues'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/complaints/nearby' as any)}
                activeOpacity={0.7}
                style={styles.viewAllPill}
              >
                <Text style={styles.viewAllText}>{t('home.viewAll') || 'View All'}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.reportsList}>
              {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>
                    {t('home.loadingNearbyReports') || 'Discovering issues in your locality...'}
                  </Text>
                </View>
              ) : nearbyReports.length > 0 ? (
                nearbyReports.map((report) => {
                  const statusColor = getStatusColor(report.status);
                  const statusBgColor = getStatusBgColor(report.status);
                  const statusText = getStatusText(report.status, t);
                  const statusIcon = getStatusIcon(report.status);

                  return (
                    <TouchableOpacity
                      key={report.id}
                      style={styles.reportCard}
                      activeOpacity={0.85}
                      onPress={() => {
                        router.push({
                          pathname: '/complaints/nearby',
                          params: { selectedReportId: report.id },
                        } as any);
                      }}
                    >
                      <View style={styles.reportCardHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                          <Ionicons name={statusIcon} size={13} color={statusColor} />
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusText}
                          </Text>
                        </View>
                        {report.distance !== undefined && (
                          <View style={styles.distanceBadge}>
                            <Ionicons name="navigate-outline" size={12} color="#0284C7" />
                            <Text style={styles.distanceText}>
                              {report.distance.toFixed(1)} km away
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.reportTitle} numberOfLines={2}>
                        {report.title}
                      </Text>

                      <View style={styles.reportCardFooter}>
                        <View style={styles.reportMetaItem}>
                          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                          <Text style={styles.reportMetaText}>
                            {formatTimeAgo(report.createdAt)}
                          </Text>
                        </View>

                        <View style={styles.actionArrowPill}>
                          <Text style={styles.actionArrowText}>Details</Text>
                          <Ionicons name="arrow-forward" size={13} color={Colors.primaryDark} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={32} color={Colors.success} />
                  </View>
                  <Text style={styles.emptyText}>
                    {t('home.noNearbyReports') || 'No Active Grievances Nearby'}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {t('home.checkBackLater') || 'Your ward looks clear! You can report any new civic issue anytime.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyReportButton}
                    onPress={() => router.push('/(tabs)/Post' as any)}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.emptyReportButtonText}>File First Grievance</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Community Impact Dashboard */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="bar-chart-outline" size={18} color={Colors.successDark} />
                </View>
                <Text style={styles.sectionTitleText}>
                  {t('home.communityImpact') || 'Community Impact'}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderTopColor: Colors.primary }]}>
                <View style={[styles.statIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="file-tray-full-outline" size={18} color={Colors.primary} />
                </View>
                {statsLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.statNumber}>
                    {(communityStats.reportsSubmitted || 0).toLocaleString()}
                  </Text>
                )}
                <Text style={styles.statLabel}>
                  {t('home.reportsSubmitted') || 'Reports Filed'}
                </Text>
              </View>

              <View style={[styles.statCard, { borderTopColor: Colors.success }]}>
                <View style={[styles.statIconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="checkmark-done-circle-outline" size={18} color={Colors.success} />
                </View>
                {statsLoading ? (
                  <ActivityIndicator size="small" color={Colors.success} />
                ) : (
                  <Text style={[styles.statNumber, { color: Colors.successDark }]}>
                    {(communityStats.issuesResolved || 0).toLocaleString()}
                  </Text>
                )}
                <Text style={styles.statLabel}>
                  {t('home.issuesResolved') || 'Issues Resolved'}
                </Text>
              </View>

              <View style={[styles.statCard, { borderTopColor: '#0284C7' }]}>
                <View style={[styles.statIconWrap, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="pie-chart-outline" size={18} color="#0284C7" />
                </View>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#0284C7" />
                ) : (
                  <Text style={[styles.statNumber, { color: '#0284C7' }]}>
                    {communityStats.resolutionRate || '0%'}
                  </Text>
                )}
                <Text style={styles.statLabel}>
                  {t('home.resolutionRate') || 'Resolution Rate'}
                </Text>
              </View>

              <View style={[styles.statCard, { borderTopColor: '#7C3AED' }]}>
                <View style={[styles.statIconWrap, { backgroundColor: '#FAF5FF' }]}>
                  <Ionicons name="flash-outline" size={18} color="#7C3AED" />
                </View>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <Text style={[styles.statNumber, { color: '#7C3AED' }]}>
                    {communityStats.avgResponseTime || '2.4'}d
                  </Text>
                )}
                <Text style={styles.statLabel}>
                  {t('home.avgResponseTime') || 'Avg Response Time'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Biometric Onboarding Modal */}
      <BiometricOnboarding
        visible={shouldShowOnboarding}
        onComplete={markOnboardingAsShown}
        biometricType={biometricType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topUtilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  appBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: Radii.base,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 95,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: Radii.base,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleText: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  viewAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: '#FFF7ED',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  reportsList: {
    gap: 10,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 21,
    marginBottom: 10,
  },
  reportCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  actionArrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionArrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.soft,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.pill,
    ...Shadows.soft,
  },
  emptyReportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 3,
    ...Shadows.card,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
