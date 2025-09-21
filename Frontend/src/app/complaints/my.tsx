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
import { useAuth } from '@/src/context/AuthContext';
import { getUserReports } from '@/src/api/report';
import UniversalHeader from '@/src/components/UniversalHeader';
import { formatDateParts } from '@/src/utils/date';

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

export default function MyComplaints() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user reports
  const fetchReports = async (isRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getUserReports(user.id) as any;

      if (result.success) {
        setReports(result.reports || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to fetch reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const filters = [
    { key: 'All', label: 'All', count: reports.length, icon: 'list-outline' },
    { key: 'Submitted', label: 'Submitted', count: reports.filter(r => !r.isResolved).length, icon: 'checkmark-circle-outline' },
    { key: 'Resolved', label: 'Resolved', count: reports.filter(r => r.isResolved).length, icon: 'checkmark-circle' },
  ];

  const sortOptions = [
    { key: 'date', label: 'Recent', icon: 'time' as const },
    { key: 'priority', label: 'Priority', icon: 'flag' as const },
    { key: 'status', label: 'Status', icon: 'checkmark-circle' as const },
  ];

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const reportStatus = getStatusText(report.isResolved);
      const matchesFilter = selectedFilter === 'All' || reportStatus === selectedFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a: Report, b: Report) => {
      if (!sortBy) {
        // Default sort by date when no sort is selected
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      }
      
      switch (sortBy) {
        case 'date': {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        }
        case 'priority': {
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] || 0);
        }
        case 'status': {
          if (a.isResolved === b.isResolved) return 0;
          return a.isResolved ? 1 : -1; // Unresolved first
        }
        default:
          return 0;
      }
    });

  const renderReport = ({ item }: { item: Report }) => {
    const createdDate = formatDate(item.createdAt);
    const hasMedia = item.mediaUrls.length > 0 || item.audioUrl;

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => {
          router.push({
            pathname: '/reportDetails',
            params: { report: JSON.stringify(item) }
          });
        }}
        activeOpacity={0.7}
      >
        {/* Header with ID, Priority, and Status */}
        <View style={styles.reportHeader}>
          <View style={styles.leftHeaderSection}>
            <Text style={styles.reportId}>#{item.id.slice(-6).toUpperCase()}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <MaterialIcons name={getPriorityIcon(item.priority)} size={12} color="#FFFFFF" />
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.isResolved) }]}>
            <Text style={styles.statusText}>{getStatusText(item.isResolved)}</Text>
          </View>
        </View>

        {/* Title and Description */}
        <Text style={styles.reportTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.reportDescription} numberOfLines={2}>{item.description}</Text>

        {/* Media Indicators */}
        {hasMedia && (
          <View style={styles.mediaIndicators}>
            {item.mediaUrls.length > 0 && (
              <View style={styles.mediaIndicator}>
                <Ionicons name="images" size={16} color="#4CAF50" />
                <Text style={styles.mediaCount}>{item.mediaUrls.length} photo{item.mediaUrls.length > 1 ? 's' : ''}</Text>
              </View>
            )}
            {item.audioUrl && (
              <View style={styles.mediaIndicator}>
                <Ionicons name="mic" size={16} color="#FF9800" />
                <Text style={styles.mediaCount}>Voice note</Text>
              </View>
            )}
          </View>
        )}

        {/* Details Row */}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Universal Header */}
      <UniversalHeader
        title="My Reports"
        showBackButton={true}
        rightComponent={
          <TouchableOpacity onPress={() => fetchReports(true)} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />

      {!user ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to view your reports</Text>
        </View>
      ) : (
        <>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your reports..."
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading your reports...</Text>
            </View>
          ) : filteredReports.length > 0 ? (
            <FlatList
              data={filteredReports}
              renderItem={renderReport}
              keyExtractor={item => item.id}
              style={styles.reportsList}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={() => fetchReports(true)}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={48} color="#FF6B35" />
              </View>
              <Text style={styles.emptyTitle}>
                {reports.length === 0 ? 'No Reports Yet' : 'No Reports Found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {reports.length === 0
                  ? 'Start by creating your first report to help improve your community'
                  : searchQuery
                    ? 'Try adjusting your search criteria or filters'
                    : 'You have no reports matching this filter'
                }
              </Text>
              {reports.length === 0 ? (
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => router.push('/(tabs)/Post')}
                >
                  <Ionicons name="add" size={16} color="#FF6B35" />
                  <Text style={styles.emptyActionText}>Create First Report</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={() => fetchReports(true)}
                >
                  <Ionicons name="refresh" size={16} color="#FF6B35" />
                  <Text style={styles.emptyActionText}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
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
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
  },
  estimatedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },

  // Additional styles for new card design
  leftHeaderSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mediaIndicatorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalReportInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modalReportId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginRight: 8,
  },
  modalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalReportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 26,
  },
  modalReportDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: 90,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 8,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  modalDetailText: {
    fontSize: 15,
    color: '#4B5563',
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  timelineIcon: {
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  timelineNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Additional missing styles
  mediaCount: {
    fontSize: 12,
    color: '#6B7280',
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
});
