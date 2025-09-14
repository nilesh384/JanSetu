import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  Image,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { getUserReports } from '@/src/api/report';
import { Audio } from 'expo-av';

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

export default function MyComplaints() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  //image
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  //audio
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [audioPosition, setAudioPosition] = useState<number | null>(null);



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

  const playAudio = async (audioUrl: string) => {
    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      console.log('Loading audio from:', audioUrl);

      // Load the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, isLooping: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);

      // Play the audio
      await newSound.playAsync();
      setIsPlaying(true);

    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Could not play audio recording');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setAudioPosition(status.positionMillis);
      setAudioDuration(status.durationMillis);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setAudioPosition(0);
      }
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        setAudioPosition(0);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const formatAudioTime = (milliseconds: number | null) => {
  if (!milliseconds) return '0:00';
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const filters = [
    { key: 'All', label: 'All', count: reports.length, icon: 'list-outline' },
    { key: 'Submitted', label: 'Submitted', count: reports.filter(r => !r.isResolved).length, icon: 'checkmark-circle-outline' },
    { key: 'Resolved', label: 'Resolved', count: reports.filter(r => r.isResolved).length, icon: 'checkmark-circle' },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const reportStatus = getStatusText(report.isResolved);
    const matchesFilter = selectedFilter === 'All' || reportStatus === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderReport = ({ item }: { item: Report }) => {
    const createdDate = formatDate(item.createdAt);
    const hasMedia = item.mediaUrls.length > 0 || item.audioUrl;

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => {
          setSelectedReport(item);
          setShowDetailModal(true);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <TouchableOpacity onPress={() => fetchReports(true)} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

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
              <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>
                {reports.length === 0 ? 'No Reports Yet' : 'No Complaints Found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {reports.length === 0
                  ? 'Start by creating your first report'
                  : searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'You have no complaints matching this filter'
                }
              </Text>
              {reports.length === 0 && (
                <TouchableOpacity
                  style={styles.createFirstButton}
                  onPress={() => router.push('/(tabs)/Post')}
                >
                  <Text style={styles.createFirstButtonText}>Create First Report</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Details</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {selectedReport && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Header Info */}
              <View style={styles.modalReportHeader}>
                <View style={styles.modalReportInfo}>
                  <Text style={styles.modalReportId}>#{selectedReport.id.slice(-6).toUpperCase()}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedReport.priority) }]}>
                    <MaterialIcons name={getPriorityIcon(selectedReport.priority)} size={12} color="#FFFFFF" />
                    <Text style={styles.priorityText}>{selectedReport.priority}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.isResolved) }]}>
                  <Text style={styles.statusText}>{getStatusText(selectedReport.isResolved)}</Text>
                </View>
              </View>

              {/* Title and Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Report Details</Text>
                <Text style={styles.modalReportTitle}>{selectedReport.title}</Text>
                <Text style={styles.modalReportDescription}>{selectedReport.description}</Text>
              </View>

              {/* Media Section */}
              {(selectedReport.mediaUrls.length > 0 || selectedReport.audioUrl) && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Attachments</Text>

                  {/* Images/Videos */}
                  {selectedReport.mediaUrls.length > 0 && (
                    <View style={styles.mediaGrid}>
                      {selectedReport.mediaUrls.map((url, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.mediaItem}
                          onPress={() => {
                            setCurrentImages(selectedReport.mediaUrls);
                            setSelectedImageIndex(index);
                            setShowImageViewer(true);
                          }}
                        >
                          <Image source={{ uri: url }} style={styles.mediaImage} />
                          <View style={styles.mediaOverlay}>
                            <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Image Viewer Modal */}
                  <Modal
                    visible={showImageViewer}
                    animationType="fade"
                    presentationStyle="fullScreen"
                    onRequestClose={() => setShowImageViewer(false)}
                  >
                    <SafeAreaView style={styles.imageViewerContainer}>
                      <View style={styles.imageViewerHeader}>
                        <TouchableOpacity
                          onPress={() => setShowImageViewer(false)}
                          style={styles.imageViewerCloseButton}
                        >
                          <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.imageViewerTitle}>
                          {selectedImageIndex + 1} of {currentImages.length}
                        </Text>
                        <View style={styles.imageViewerPlaceholder} />
                      </View>

                      <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                          const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                          setSelectedImageIndex(index);
                        }}
                        contentOffset={{ x: selectedImageIndex * Dimensions.get('window').width, y: 0 }}
                      >
                        {currentImages.map((imageUrl, index) => (
                          <View key={index} style={styles.imageViewerSlide}>
                            <Image
                              source={{ uri: imageUrl }}
                              style={styles.fullScreenImage}
                              resizeMode="contain"
                            />
                          </View>
                        ))}
                      </ScrollView>

                      {/* Image Navigation Dots */}
                      {currentImages.length > 1 && (
                        <View style={styles.imageViewerDots}>
                          {currentImages.map((_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.imageViewerDot,
                                selectedImageIndex === index && styles.activeImageViewerDot
                              ]}
                            />
                          ))}
                        </View>
                      )}
                    </SafeAreaView>
                  </Modal>

                  {/* Audio */}
{selectedReport.audioUrl && (
  <View style={styles.audioPlayerContainer}>
    <TouchableOpacity 
      style={styles.audioPlayer}
      onPress={() => {
        if (isPlaying) {
          stopAudio();
        } else if (selectedReport.audioUrl) {
          playAudio(selectedReport.audioUrl);
        }
      }}
    >
      <Ionicons 
        name={isPlaying ? "pause-circle" : "play-circle"} 
        size={32} 
        color="#FF6B35" 
      />
      <View style={styles.audioInfo}>
        <Text style={styles.audioText}>Voice Recording</Text>
        <Text style={styles.audioTime}>
          {formatAudioTime(audioPosition)} / {formatAudioTime(audioDuration)}
        </Text>
      </View>
      <Ionicons 
        name={isPlaying ? "volume-high" : "volume-medium"} 
        size={20} 
        color={isPlaying ? "#FF6B35" : "#666666"} 
      />
    </TouchableOpacity>
    
    {/* Audio Progress Bar */}
    {audioDuration && (
      <View style={styles.audioProgressContainer}>
        <View style={styles.audioProgressBar}>
          <View 
            style={[
              styles.audioProgressFill, 
              { 
                width: `${audioPosition && audioDuration ? 
                  (audioPosition / audioDuration) * 100 : 0}%` 
              }
            ]} 
          />
        </View>
      </View>
    )}
  </View>
)}
                </View>
              )}

              {/* Location and Details */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Location & Category</Text>
                <View style={styles.modalDetailRow}>
                  <Ionicons name="location" size={20} color="#666666" />
                  <Text style={styles.modalDetailText}>{selectedReport.address || 'Location not specified'}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="category" size={20} color="#666666" />
                  <Text style={styles.modalDetailText}>{selectedReport.category}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="business" size={20} color="#666666" />
                  <Text style={styles.modalDetailText}>{selectedReport.department}</Text>
                </View>
              </View>

              {/* Timeline */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Timeline</Text>
                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Ionicons name="add-circle" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Report Submitted</Text>
                    <Text style={styles.timelineDate}>
                      {formatDate(selectedReport.createdAt).date} at {formatDate(selectedReport.createdAt).time}
                    </Text>
                  </View>
                </View>

                {selectedReport.resolvedAt && (
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Report Resolved</Text>
                      <Text style={styles.timelineDate}>
                        {formatDate(selectedReport.resolvedAt).date} at {formatDate(selectedReport.resolvedAt).time}
                      </Text>
                      {selectedReport.timeTakenToResolve && (
                        <Text style={styles.timelineNote}>
                          Resolved in {Math.ceil(selectedReport.timeTakenToResolve / (1000 * 60 * 60 * 24))} days
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  refreshButton: {
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
  createFirstButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F8F9FA',
  },
  modalReportHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalReportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalReportId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalReportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 26,
  },
  modalReportDescription: {
    fontSize: 15,
    color: '#4B5563',
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
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  imageViewerCloseButton: {
    padding: 8,
  },
  imageViewerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageViewerPlaceholder: {
    width: 44,
    height: 44,
  },
  imageViewerSlide: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  imageViewerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  imageViewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeImageViewerDot: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 8,
    borderRadius: 4,
  },

  // Audio Player Styles
audioPlayerContainer: {
  marginTop: 8,
},
audioPlayer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F8F9FA',
  padding: 16,
  borderRadius: 12,
  gap: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
audioInfo: {
  flex: 1,
},
audioText: {
  fontSize: 15,
  color: '#374151',
  fontWeight: '500',
},
audioTime: {
  fontSize: 12,
  color: '#6B7280',
  marginTop: 2,
},
audioProgressContainer: {
  paddingHorizontal: 16,
  paddingTop: 8,
},
audioProgressBar: {
  height: 4,
  backgroundColor: '#E5E7EB',
  borderRadius: 2,
  overflow: 'hidden',
},
audioProgressFill: {
  height: '100%',
  backgroundColor: '#FF6B35',
  borderRadius: 2,
},
});
