import HomeHeader from '@/components/HomeHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [communityStats, setCommunityStats] = useState({
    reportsSubmitted: 0,
    issuesResolved: 0,
    resolutionRate: '0%',
    avgResponseTime: '0.0'
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Use centralized helper that correctly parses server timestamps
  // formatTimeAgo accepts ISO or SQL-like timestamp strings

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
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
      const response = await getNearbyReports(userLocation, 5) as any; // 5km radius

      if (response && response.success && response.reports) {
        // Calculate distances and get only the latest 2
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
          .slice(0, 2); // Get only the latest 2 reports

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
      const response = await getCommunityStats() as CommunityStatsResponse;
      if (response.success && response.stats) {
        setCommunityStats({
          reportsSubmitted: response.stats.totalReports || 0,
          issuesResolved: response.stats.resolvedReports || 0,
          resolutionRate: `${response.stats.resolutionRate || 0}%`,
          avgResponseTime: response.stats.avgResponseTime || '0.0'
        });
      } else {
        // Keep default values if response is not successful
        console.warn('Community stats response not successful:', response);
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
      // Keep default values on error
    } finally {
      setStatsLoading(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      const token = await notificationService.initialize();
      if (token && user) {
        // Update token for the current user
        await notificationService.updateTokenForUser(user.id);
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  useEffect(() => {
    getUserLocation();
    initializeNotifications();
    
    // Multiple retry attempts for pending navigation
    const timers = [
      setTimeout(() => notificationService.retryPendingNavigation(), 2000),
      setTimeout(() => notificationService.forceNavigationIfPending(), 4000),
      setTimeout(() => notificationService.retryPendingNavigation(), 6000),
    ];
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyReports();
    }
  }, [userLocation]);

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  // Handle navigation when screen comes into focus (from push notifications)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 Home screen focused, checking for pending navigation...');
      
      // Force check for pending navigation when screen is focused
      setTimeout(() => {
        notificationService.forceNavigationIfPending();
      }, 1000);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Switcher positioned outside ScrollView */}
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HomeHeader userName="Rahul" />

        {/* Main Content Area */}
        <View style={styles.content}>

          {/* Quick Report Categories */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>Report an Issue</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/Post' as any)}
                >
                  <Text style={styles.sectionSubtitle}>See all</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reportCategories}>
              <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#FFF8F6' }]}>
                <View style={[styles.categoryIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="construct" size={24} color="#DC2626" />
                </View>
                <Text style={styles.categoryTitle}>Infrastructure</Text>
                <Text style={styles.categoryDesc}>Roads, bridges, streetlights</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#F0FDF4' }]}>
                <View style={[styles.categoryIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trash" size={24} color="#059669" />
                </View>
                <Text style={styles.categoryTitle}>Sanitation</Text>
                <Text style={styles.categoryDesc}>Waste, garbage, cleanliness</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#EFF6FF' }]}>
                <View style={[styles.categoryIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="water" size={24} color="#2563EB" />
                </View>
                <Text style={styles.categoryTitle}>Utilities</Text>
                <Text style={styles.categoryDesc}>Water, electricity, gas</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.categoryCard, { backgroundColor: '#FDF4FF' }]}>
                <View style={[styles.categoryIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="shield-checkmark" size={24} color="#7C3AED" />
                </View>
                <Text style={styles.categoryTitle}>Safety</Text>
                <Text style={styles.categoryDesc}>Public safety, security</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Recent Reports */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>{t('home.recentNearbyReports')}</Text>
                <TouchableOpacity onPress={() => router.push('/complaints/nearby')}>
                    <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reportsList}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={styles.loadingText}>{t('home.loadingNearbyReports')}</Text>
                </View>
              ) : nearbyReports.length > 0 ? (
                nearbyReports.map((report) => {
                  const statusColor = report.isResolved ? '#059669' : '#D97706';
                  const statusBgColor = report.isResolved ? '#DCFCE7' : '#FEF3C7';
                  const statusText = report.isResolved ? t('home.resolved') : t('home.inProgress');
                  const statusIcon = report.isResolved ? 'checkmark-circle' : 'time';

                  return (
                    <TouchableOpacity
                      key={report.id}
                      style={styles.reportItem}
                      onPress={() => {
                        // Navigate to nearby page and pass the report ID
                        router.push({
                          pathname: '/complaints/nearby',
                          params: { selectedReportId: report.id }
                        } as any);
                      }}
                    >
                      <View style={[styles.reportStatus, { backgroundColor: statusBgColor }]}>
                        <Ionicons name={statusIcon} size={16} color={statusColor} />
                      </View>
                      <View style={styles.reportContent}>
                        <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                        <Text style={styles.reportLocation} numberOfLines={1}>
                          {formatTimeAgo(report.createdAt)}
                          {report.distance && ` • ${report.distance.toFixed(1)}km away`}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="location-outline" size={32} color="#CCCCCC" />
                  <Text style={styles.emptyText}>{t('home.noNearbyReports')}</Text>
                  <Text style={styles.emptySubtext}>{t('home.checkBackLater')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Community Impact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>{t('home.communityImpact')}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Text style={styles.statNumber}>{(communityStats.reportsSubmitted || 0).toLocaleString()}</Text>
                )}
                <Text style={styles.statLabel}>{t('home.reportsSubmitted')}</Text>
              </View>
              <View style={styles.statCard}>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <Text style={styles.statNumber}>{(communityStats.issuesResolved || 0).toLocaleString()}</Text>
                )}
                <Text style={styles.statLabel}>{t('home.issuesResolved')}</Text>
              </View>
              <View style={styles.statCard}>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#D97706" />
                ) : (
                  <Text style={styles.statNumber}>{communityStats.resolutionRate || '0%'}</Text>
                )}
                <Text style={styles.statLabel}>{t('home.resolutionRate')}</Text>
              </View>
              <View style={styles.statCard}>
                {statsLoading ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text style={styles.statNumber}>{communityStats.avgResponseTime || '0.0'}</Text>
                )}
                <Text style={styles.statLabel}>{t('home.avgResponseTime')}</Text>
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
    backgroundColor: '#F8FAFC',
    marginBottom: 50,
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#3e2ce5ff',
    marginTop: 2,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  newsExcerpt: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  emergencySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#FEE2E2',
  },
  reportCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  categoryCard: {
    flex: 1,
    minWidth: '35%',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  reportsList: {
    marginBottom: 20,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 12,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  communityImpact: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  impactCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
});
