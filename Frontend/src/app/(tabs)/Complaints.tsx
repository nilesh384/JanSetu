import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

interface Report {
  id: string;
  title: string;
  category: string;
  location: string;
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  submittedDate: string;
  updatedDate: string;
  description: string;
  departmentAssigned?: string;
  estimatedResolution?: string;
}

const myReports: Report[] = [
  {
    id: 'RPT001',
    title: 'Large Pothole on Main Street',
    category: 'Road Issues',
    location: 'Main Street, Sector 12',
    status: 'in-progress',
    priority: 'high',
    submittedDate: '2025-09-08',
    updatedDate: '2025-09-09',
    description: 'There is a large pothole on the main road that could cause accidents.',
    departmentAssigned: 'Public Works Department',
    estimatedResolution: '2025-09-12'
  },
  {
    id: 'RPT004',
    title: 'Water Supply Disruption',
    category: 'Water Supply',
    location: 'Residential Area, Block A',
    status: 'submitted',
    priority: 'high',
    submittedDate: '2025-09-09',
    updatedDate: '2025-09-09',
    description: 'No water supply for the past two days.',
  }
];

const nearbyReports: Report[] = [
  {
    id: 'RPT002',
    title: 'Broken Street Light',
    category: 'Street Lighting',
    location: 'Park Road, Gate No. 3',
    status: 'acknowledged',
    priority: 'medium',
    submittedDate: '2025-09-07',
    updatedDate: '2025-09-08',
    description: 'Street light is not working, creating safety concerns at night.',
    departmentAssigned: 'Electrical Department',
    estimatedResolution: '2025-09-15'
  },
  {
    id: 'RPT003',
    title: 'Uncollected Garbage',
    category: 'Waste Management',
    location: 'Market Area, Shop No. 45',
    status: 'resolved',
    priority: 'medium',
    submittedDate: '2025-09-05',
    updatedDate: '2025-09-06',
    description: 'Garbage has been accumulating for three days.',
    departmentAssigned: 'Sanitation Department'
  },
  {
    id: 'RPT005',
    title: 'Illegal Parking Issue',
    category: 'Traffic',
    location: 'Commercial Complex, Block C',
    status: 'submitted',
    priority: 'low',
    submittedDate: '2025-09-10',
    updatedDate: '2025-09-10',
    description: 'Vehicles parked illegally blocking the main entrance.',
    departmentAssigned: 'Traffic Department'
  },
  {
    id: 'RPT006',
    title: 'Tree Branch Blocking Road',
    category: 'Road Issues',
    location: 'Green Avenue, Near School',
    status: 'in-progress',
    priority: 'medium',
    submittedDate: '2025-09-09',
    updatedDate: '2025-09-10',
    description: 'Large tree branch fell and is blocking half the road.',
    departmentAssigned: 'Public Works Department',
    estimatedResolution: '2025-09-11'
  }
];

export default function IssueTracker() {

  const router = useRouter();
  const handleNavigateToMyComplaints = () => {
    router.push('/complaints/my' as any);
  };

  const handleNavigateToNearbyComplaints = () => {
    router.push('/complaints/nearby' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity  onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Tracker</Text>
      </View>

      <ScrollView style={styles.content}>

        {/* Navigation Cards */}
        <View style={styles.cardsContainer}>
          {/* My Complaints Card */}
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={handleNavigateToMyComplaints}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <MaterialIcons name="person" size={32} color="#FF6B35" />
              </View>
            </View>
            
            <Text style={styles.cardTitle}>My Complaints</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>View Details</Text>
              <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
            </View>
          </TouchableOpacity>

          {/* Nearby Complaints Card */}
          <TouchableOpacity 
            style={styles.navigationCard}
            onPress={handleNavigateToNearbyComplaints}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="location" size={32} color="#4CAF50" />
              </View>
              
            </View>
            
            <Text style={styles.cardTitle}>All Nearby Complaints</Text>
           
           <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>Explore</Text>
              <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/Post' as any)}
          >
            <MaterialIcons name="report-problem" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Report New Issue</Text>
          </TouchableOpacity>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginBottom: 70
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 30,
  },
  headerTitle: {
    flex:1,
    textAlign: 'center',
    marginLeft: -24,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  newReportButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  navigationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  cardStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  cardStatLabel: {
    fontSize: 12,
    color: '#666666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cardAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  overallStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overallStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  overallStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});
