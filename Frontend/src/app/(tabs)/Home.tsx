import HomeHeader from '@/components/HomeHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
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
                <Text style={styles.sectionTitleText}>Recent Reports</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/Complaints' as any)}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reportsList}>
              <View style={styles.reportItem}>
                <View style={[styles.reportStatus, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time" size={16} color="#D97706" />
                </View>
                <View style={styles.reportContent}>
                  <Text style={styles.reportTitle}>Pothole on Main Road</Text>
                  <Text style={styles.reportLocation}>Near City Center • 2 days ago</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.statusText, { color: '#D97706' }]}>In Progress</Text>
                </View>
              </View>

              <View style={styles.reportItem}>
                <View style={[styles.reportStatus, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                </View>
                <View style={styles.reportContent}>
                  <Text style={styles.reportTitle}>Streetlight Repair</Text>
                  <Text style={styles.reportLocation}>Residential Area • 1 week ago</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.statusText, { color: '#059669' }]}>Resolved</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Community Impact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>Community Impact</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>1,247</Text>
                <Text style={styles.statLabel}>Reports Submitted</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>892</Text>
                <Text style={styles.statLabel}>Issues Resolved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>72%</Text>
                <Text style={styles.statLabel}>Resolution Rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>3.2</Text>
                <Text style={styles.statLabel}>Avg. Response Time</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    marginBottom: 50,
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
});
