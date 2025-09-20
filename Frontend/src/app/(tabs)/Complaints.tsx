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
import UniversalHeader from '@/src/components/UniversalHeader';
import { useTranslation } from 'react-i18next';

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
            
            <Text style={styles.cardTitle}>{t('complaints.myComplaints')}</Text>
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>{t('complaints.viewDetails')}</Text>
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
            
            <Text style={styles.cardTitle}>{t('complaints.allNearbyComplaints')}</Text>
           
           <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>{t('complaints.explore')}</Text>
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
    backgroundColor: '#F8F9FA',
    marginBottom: 70
  },
  newReportButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    marginTop: 66,
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
