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
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '@/src/context/AuthContext';
import { formatDateParts, parseServerDate } from '@/src/utils/date';
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

const formatDate = (dateString: string | null) => formatDateParts(dateString);

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
  const [sortBy, setSortBy] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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
      if (!sortBy) {
        // Default sort by distance when no sort is selected
        return (a.distance || 0) - (b.distance || 0);
      }
      
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'date': {
          const ta = parseServerDate(a.createdAt)?.getTime() || 0;
          const tb = parseServerDate(b.createdAt)?.getTime() || 0;
          return tb - ta;
        }
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

      {/* Filters and Sort - Compact Version */}
      <View style={styles.controlsContainer}>
        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.compactFilterScrollView}
          contentContainerStyle={styles.compactFilterScrollContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.compactFilterTab,
                selectedFilter === filter.key && styles.activeCompactFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.compactFilterLabel,
                selectedFilter === filter.key && styles.activeCompactFilterLabel,
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.compactFilterBadge,
                selectedFilter === filter.key && styles.activeCompactFilterBadge,
              ]}>
                <Text style={[
                  styles.compactFilterCount,
                  selectedFilter === filter.key && styles.activeCompactFilterCount,
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Dropdown */}
        <TouchableOpacity
          style={styles.sortDropdownButton}
          onPress={() => setShowSortDropdown(true)}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={sortOptions.find(opt => opt.key === sortBy)?.icon || 'swap-vertical'} 
            size={16} 
            color="#666666" 
          />
          <Text style={styles.sortDropdownText}>
            {sortOptions.find(opt => opt.key === sortBy)?.label || 'Sort'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown Modal */}
      <Modal
        visible={showSortDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortDropdown(false)}
      >
        <TouchableOpacity
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortDropdown(false)}
        >
          <View style={styles.sortModalContent}>
            <Text style={styles.sortModalTitle}>Sort by</Text>
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortModalOption,
                  sortBy === option.key && styles.activeSortModalOption,
                ]}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortDropdown(false);
                }}
              >
                <Ionicons 
                  name={option.icon} 
                  size={18} 
                  color={sortBy === option.key ? '#FF6B35' : '#666666'} 
                />
                <Text style={[
                  styles.sortModalOptionText,
                  sortBy === option.key && styles.activeSortModalOptionText,
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={18} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
          <View style={styles.emptyIconContainer}>
            <Ionicons name="location-outline" size={48} color="#FF6B35" />
          </View>
          <Text style={styles.emptyTitle}>No Nearby Reports</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search criteria or check back later' : 'No reports found in your area. Please check back later.'}
          </Text>
          <TouchableOpacity 
            style={styles.emptyActionButton}
            onPress={() => fetchNearbyReports(true)}
          >
            <Ionicons name="refresh" size={16} color="#FF6B35" />
            <Text style={styles.emptyActionText}>Refresh</Text>
          </TouchableOpacity>
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
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactFilterScrollView: {
    flex: 1,
  },
  compactFilterScrollContent: {
    paddingRight: 8,
  },
  compactFilterTab: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeCompactFilterTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  compactFilterLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  activeCompactFilterLabel: {
    color: '#FFFFFF',
  },
  compactFilterBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 16,
    alignItems: 'center',
  },
  activeCompactFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  compactFilterCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
  },
  activeCompactFilterCount: {
    color: '#FFFFFF',
  },
  sortDropdownButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sortDropdownText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: 280,
    marginHorizontal: 20,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  sortModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  activeSortModalOption: {
    backgroundColor: '#FFF5F2',
  },
  sortModalOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  activeSortModalOptionText: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  reportsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
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
    paddingVertical: 40,
  },
  emptyIconContainer: {
    backgroundColor: '#FFF5F2',
    borderRadius: 40,
    padding: 24,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 6,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
  },
});