import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Submitted' | 'In Progress' | 'Resolved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  department: string;
  submittedDate: string;
  estimatedResolution?: string;
  reportedBy?: string;
  distance?: string;
}

const nearbyReports: Report[] = [
  {
    id: 'CMP003',
    title: 'Water Leakage on Park Avenue',
    description: 'Major water pipe burst causing road flooding',
    category: 'Water Supply',
    status: 'In Progress',
    priority: 'Critical',
    location: 'Park Avenue, Sector 12',
    department: 'Water Board',
    submittedDate: '2024-01-16',
    estimatedResolution: '1-2 days',
    reportedBy: 'Citizen #4821',
    distance: '0.3 km',
  },
  {
    id: 'CMP004',
    title: 'Garbage Collection Delay',
    description: 'Waste not collected for 4 days, causing health concerns',
    category: 'Sanitation',
    status: 'Submitted',
    priority: 'High',
    location: 'Green Valley, Block C',
    department: 'Sanitation Dept',
    submittedDate: '2024-01-15',
    reportedBy: 'Citizen #2156',
    distance: '0.8 km',
  },
  {
    id: 'CMP005',
    title: 'Traffic Signal Malfunction',
    description: 'Traffic light stuck on red causing congestion',
    category: 'Traffic',
    status: 'Resolved',
    priority: 'High',
    location: 'Central Square Junction',
    department: 'Traffic Police',
    submittedDate: '2024-01-13',
    estimatedResolution: 'Completed',
    reportedBy: 'Citizen #8934',
    distance: '1.2 km',
  },
  {
    id: 'CMP006',
    title: 'Stray Dog Issue',
    description: 'Pack of stray dogs causing safety concerns for children',
    category: 'Animal Control',
    status: 'Submitted',
    priority: 'Medium',
    location: 'Sunrise Colony',
    department: 'Animal Control',
    submittedDate: '2024-01-14',
    reportedBy: 'Citizen #5672',
    distance: '2.1 km',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Submitted': return '#2196F3';
    case 'In Progress': return '#FF9800';
    case 'Resolved': return '#4CAF50';
    case 'Rejected': return '#F44336';
    default: return '#757575';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'warning';
    case 'High': return 'priority-high';
    case 'Medium': return 'remove';
    case 'Low': return 'keyboard-arrow-down';
    default: return 'remove';
  }
};

export default function NearbyComplaints() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('distance');

  const filters = [
    { key: 'All', label: 'All', count: nearbyReports.length, icon: 'list-outline' },
    { key: 'Submitted', label: 'Submitted', count: nearbyReports.filter(r => r.status === 'Submitted').length, icon: 'checkmark-circle-outline' },
    { key: 'In Progress', label: 'In Progress', count: nearbyReports.filter(r => r.status === 'In Progress').length, icon: 'time-outline' },
    { key: 'Resolved', label: 'Resolved', count: nearbyReports.filter(r => r.status === 'Resolved').length, icon: 'checkmark-circle' },
  ];

  const sortOptions = [
    { key: 'distance', label: 'Distance', icon: 'near-me' as const },
    { key: 'date', label: 'Recent', icon: 'access-time' as const },
    { key: 'priority', label: 'Priority', icon: 'priority-high' as const },
  ];

  const filteredReports = nearbyReports
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'All' || report.status === selectedFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.distance || '0') - parseFloat(b.distance || '0');
        case 'date':
          return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  const renderReport = ({ item }: { item: Report }) => (
    <TouchableOpacity style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIdContainer}>
          <Text style={styles.reportId}>#{item.id}</Text>
          <MaterialIcons name={getPriorityIcon(item.priority)} size={16} color="#FF6B35" />
          {item.distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#4CAF50" />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.reportTitle}>{item.title}</Text>

      <View style={styles.reportDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="category" size={16} color="#666666" />
          <Text style={styles.detailText}>{item.category} • {item.department}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>Reported by: {item.reportedBy}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>Submitted: {item.submittedDate}</Text>
        </View>
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.dateText}>Priority: {item.priority}</Text>
        {item.estimatedResolution && (
          <Text style={styles.estimatedText}>Est: {item.estimatedResolution}</Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="thumbs-up-outline" size={16} color="#4CAF50" />
          <Text style={styles.actionText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color="#2196F3" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color="#FF9800" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Complaints</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search nearby complaints..."
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
                <Ionicons
                  name={filter.icon as any}
                  size={18}
                  color={selectedFilter === filter.key ? '#FFFFFF' : '#666666'}
                  style={styles.filterIcon}
                />
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

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={item => item.id}
          style={styles.reportsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Nearby Complaints</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try adjusting your search criteria' : 'No complaints found in your area matching this filter'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
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
  sortContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sortScrollContent: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 12,
    fontWeight: '500',
  },
  sortTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  activeSortTab: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  activeSortText: {
    color: '#FFFFFF',
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
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterScrollView: {
    marginHorizontal: -4,
  },
  filterScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeFilterTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginRight: 8,
  },
  activeFilterLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCount: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  activeFilterCount: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 2,
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
    marginBottom: 12,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});
