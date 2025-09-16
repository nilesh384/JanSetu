import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '@/src/context/AuthContext';
import { getNearbyReports } from '@/src/api/report';
import UniversalHeader from '@/src/components/UniversalHeader';

// Utility function to detect video files
const isVideoFile = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.3gp'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

interface Report {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  mediaUrls: string[];
  audioUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  department: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
  timeTakenToResolve: number | null;
  resolvedMediaUrls?: string[];
  resolutionNotes?: string;
  resolvedByAdminId?: string;
  resolvedBy?: string;
  resolvedByRole?: string;
  distance?: number;
}

interface ApiResponse {
  success: boolean;
  reports: Report[];
  message?: string;
}

// Helper functions
const getStatusColor = (isResolved: boolean) => {
  return isResolved ? '#4CAF50' : '#2196F3';
};

const getStatusText = (isResolved: boolean) => {
  return isResolved ? 'Resolved' : 'Submitted';
};

const getPriorityIcon = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical': return 'warning';
    case 'high': return 'priority-high';
    case 'medium': return 'remove';
    case 'low': return 'keyboard-arrow-down';
    default: return 'remove';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical': return '#E53E3E';
    case 'high': return '#FF6B35';
    case 'medium': return '#FFB020';
    case 'low': return '#38A169';
    default: return '#666666';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export default function NearbyComplaints() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show nearby reports');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  // Fetch nearby reports
  const fetchNearbyReports = async (isRefresh = false) => {
    if (!userLocation) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getNearbyReports(userLocation, 10) as ApiResponse; // Pass location object and 10km radius

      if (response && response.success && response.reports) {
        // Calculate distances and add to reports
        const reportsWithDistance = response.reports.map((report: Report) => {
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
        });

        setReports(reportsWithDistance || []);
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch nearby reports');
      }
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
      Alert.alert('Error', 'Failed to fetch nearby reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyReports();
    }
  }, [userLocation]);

  const filters = [
    { key: 'All', label: 'All', count: reports.length, icon: 'list-outline' },
    { key: 'Submitted', label: 'Submitted', count: reports.filter((r: Report) => !r.isResolved).length, icon: 'checkmark-circle-outline' },
    { key: 'Resolved', label: 'Resolved', count: reports.filter((r: Report) => r.isResolved).length, icon: 'checkmark-circle' },
  ];

  const sortOptions = [
    { key: 'distance', label: 'Distance', icon: 'location' as const },
    { key: 'date', label: 'Recent', icon: 'time' as const },
    { key: 'priority', label: 'Priority', icon: 'flag' as const },
  ];

  const filteredReports = reports
    .filter((report: Report) => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'All' || 
        (selectedFilter === 'Submitted' && !report.isResolved) ||
        (selectedFilter === 'Resolved' && report.isResolved);
      return matchesSearch && matchesFilter;
    })
    .sort((a: Report, b: Report) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 0);
        default:
          return 0;
      }
    });

  const renderReport = ({ item }: { item: Report }) => {
    const createdDate = formatDate(item.createdAt);
    
    return (
      <TouchableOpacity 
        style={styles.reportCard}
        onPress={() => {
          router.push({
            pathname: '/reportDetails',
            params: {
              report: JSON.stringify(item)
            }
          });
        }}
      >
        {/* Header with ID, Priority, Distance, and Status */}
        <View style={styles.reportHeader}>
          <View style={styles.reportIdContainer}>
            <Text style={styles.reportId}>#{item.id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <MaterialIcons name={getPriorityIcon(item.priority)} size={12} color="#FFFFFF" />
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
            {item.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Ionicons name="location" size={12} color="#4CAF50" />
                <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.isResolved) }]}>
            <Text style={styles.statusText}>{getStatusText(item.isResolved)}</Text>
          </View>
        </View>

        {/* Title and Description */}
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDescription} numberOfLines={2}>{item.description}</Text>

        {/* Details */}
        <View style={styles.reportDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#666666" />
            <Text style={styles.detailText} numberOfLines={1}>{item.address || 'No location'}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="category" size={14} color="#666666" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
        </View>

        {/* Footer with Date and Department */}
        <View style={styles.reportFooter}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{createdDate.date}</Text>
            <Text style={styles.timeText}>{createdDate.time}</Text>
          </View>
          <Text style={styles.departmentText}>{item.department}</Text>
        </View>

        {/* Resolved Date if applicable */}
        {item.resolvedAt && (
          <View style={styles.resolvedSection}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.resolvedText}>
              Resolved on {formatDate(item.resolvedAt).date}
            </Text>
          </View>
        )}

        {/* Click indicator */}
        <View style={styles.clickIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <UniversalHeader
          title="Nearby Reports"
          showBackButton={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Finding nearby reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Universal Header */}
      <UniversalHeader
        title="Nearby Reports"
        showBackButton={true}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search nearby reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Status</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
              activeOpacity={0.8}
            >
              <View style={styles.filterTabContent}>
                <View style={styles.filterTextContainer}>
                  <Text style={[
                    styles.filterLabel,
                    selectedFilter === filter.key && styles.activeFilterLabel,
                  ]}>
                    {filter.label}
                  </Text>
                  <View style={[
                    styles.filterBadge,
                    selectedFilter === filter.key && styles.activeFilterBadge,
                  ]}>
                    <Text style={[
                      styles.filterCount,
                      selectedFilter === filter.key && styles.activeFilterCount,
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortTitle}>Sort by</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortScrollView}
          contentContainerStyle={styles.sortScrollContent}
        >
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortTab,
                sortBy === option.key && styles.activeSortTab,
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Ionicons 
                name={option.icon} 
                size={16} 
                color={sortBy === option.key ? '#FFFFFF' : '#666666'} 
              />
              <Text style={[
                styles.sortLabel,
                sortBy === option.key && styles.activeSortLabel,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          style={styles.reportsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => fetchNearbyReports(true)}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Nearby Reports</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No reports found in your area matching this filter'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  refreshButton: {
    padding: 4,
  },
  headerAction: {
    padding: 4,
  },
  headerPlaceholder: {
    width: 32,
    height: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 36,
  },
  activeFilterTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  activeFilterLabel: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  activeFilterCount: {
    color: '#FFFFFF',
  },
  sortContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  sortScrollView: {
    flexDirection: 'row',
  },
  sortScrollContent: {
    paddingRight: 16,
  },
  sortTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeSortTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  activeSortLabel: {
    color: '#FFFFFF',
  },
  reportsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  reportId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateContainer: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  departmentText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resolvedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  resolvedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  clickIndicator: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});