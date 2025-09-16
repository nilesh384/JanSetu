import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  RefreshControl,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Audio, Video, ResizeMode } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { getNearbyReports } from '@/src/api/report';
import { useAuth } from '@/src/context/AuthContext';
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
  distance?: number;
}

interface ApiResponse {
  success: boolean;
  reports: Report[];
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
  const { selectedReportId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Audio player state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState<number | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHorizontalScrollEnabled, setIsHorizontalScrollEnabled] = useState(true);

  // Video player state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<any>(null);

  // Animated values for zoom and pan
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Gesture handlers
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(event.scale, 4));
    })
    .onEnd(() => {
      if (scale.value < 1.2) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        runOnJS(setIsHorizontalScrollEnabled)(true);
      } else {
        runOnJS(setIsHorizontalScrollEnabled)(false);
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        const maxTranslateX = (scale.value - 1) * (Dimensions.get('window').width / 2);
        const maxTranslateY = (scale.value - 1) * (Dimensions.get('window').height / 2);
        
        translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value + event.translationX));
        translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value + event.translationY));
      }
    });

  const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Audio functions
  const playAudio = async (audioUrl: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
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

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
    // Clear the selectedReportId parameter from the URL
    if (selectedReportId) {
      router.replace('/complaints/nearby');
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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

        setReports(reportsWithDistance);
      } else {
        console.log('No reports found or invalid response:', response);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
      Alert.alert('Error', 'Failed to fetch nearby reports');
      setReports([]);
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

  // Handle selectedReportId parameter - auto-open modal for specific report
  useEffect(() => {
    if (selectedReportId && reports.length > 0) {
      const report = reports.find(r => r.id === selectedReportId);
      if (report) {
        setSelectedReport(report);
        setShowDetailModal(true);
      }
    }
  }, [selectedReportId, reports]);

  const filters = [
    { key: 'All', label: 'All', count: reports.length, icon: 'list-outline' },
    { key: 'Submitted', label: 'Submitted', count: reports.filter((r: Report) => !r.isResolved).length, icon: 'checkmark-circle-outline' },
    { key: 'Resolved', label: 'Resolved', count: reports.filter((r: Report) => r.isResolved).length, icon: 'checkmark-circle' },
  ];

  const sortOptions = [
    { key: 'distance', label: 'Distance', icon: 'near-me' as const },
    { key: 'date', label: 'Recent', icon: 'access-time' as const },
    { key: 'priority', label: 'Priority', icon: 'priority-high' as const },
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

  const renderReport = ({ item }: { item: Report }) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => {
        setSelectedReport(item);
        setShowDetailModal(true);
      }}
    >
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

      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDescription} numberOfLines={2}>{item.description}</Text>

      <View style={styles.reportDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="category" size={16} color="#666666" />
          <Text style={styles.detailText}>{item.category} • {item.department}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666666" />
          <Text style={styles.detailText}>Submitted: {formatDate(item.createdAt).date}</Text>
        </View>
        {item.mediaUrls.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="images-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>{item.mediaUrls.length} attachment(s)</Text>
          </View>
        )}
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.dateText}>
          {formatDate(item.createdAt).time}
        </Text>
        {item.isResolved && item.resolvedAt && (
          <Text style={styles.resolvedText}>
            Resolved: {formatDate(item.resolvedAt).date}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Reports</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Finding nearby reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
      {/* Universal Header */}
      <UniversalHeader
        title="Nearby Complaints"
        showBackButton={true}
      />

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNearbyReports(true)}
              colors={['#FF6B35']}
            />
          }
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

      {/* Detail Modal - Full Screen */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.modalCloseButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
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
                  {selectedReport.distance !== undefined && (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="location" size={12} color="#4CAF50" />
                      <Text style={styles.distanceText}>{selectedReport.distance.toFixed(1)} km away</Text>
                    </View>
                  )}
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

              {/* Media Section */}
              {(selectedReport.mediaUrls.length > 0 || selectedReport.audioUrl) && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Attachments</Text>

                  {/* Images/Videos */}
                  {selectedReport.mediaUrls.length > 0 && (
                    <View style={styles.mediaGrid}>
                      {selectedReport.mediaUrls.map((url, index) => {
                        const isVideo = isVideoFile(url);
                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.mediaItem}
                            onPress={() => {
                              if (isVideo) {
                                setCurrentVideoUrl(url);
                                setVideoLoading(true);
                                setVideoStatus(null);
                                setShowVideoPlayer(true);
                              } else {
                                setCurrentImages(selectedReport.mediaUrls);
                                setSelectedImageIndex(index);
                                scale.value = 1; // Reset zoom when opening new image
                                translateX.value = 0; // Reset pan position
                                translateY.value = 0; // Reset pan position
                                setIsHorizontalScrollEnabled(true); // Enable horizontal scrolling
                                setShowImageViewer(true);
                              }
                            }}
                          >
                            <Image source={{ uri: url }} style={styles.mediaImage} />
                            <View style={styles.mediaOverlay}>
                              {isVideo ? (
                                <View style={styles.videoPlayButton}>
                                  <Ionicons name="play-circle" size={32} color="#FFFFFF" />
                                </View>
                              ) : (
                                <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

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
//TODO:  fix for video playback in media section
              {/* Image Viewer Modal */}
              <Modal
                visible={showImageViewer}
                animationType="fade"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowImageViewer(false)}
              >
                <GestureHandlerRootView style={{ flex: 1 }}>
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
                    <TouchableOpacity
                      onPress={() => {
                        scale.value = 1;
                        translateX.value = 0;
                        translateY.value = 0;
                        setIsHorizontalScrollEnabled(true);
                      }}
                      style={styles.imageViewerResetButton}
                    >
                      <Ionicons name="refresh" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={isHorizontalScrollEnabled}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                      setSelectedImageIndex(index);
                    }}
                    contentOffset={{ x: selectedImageIndex * Dimensions.get('window').width, y: 0 }}
                  >
                    {currentImages.map((imageUrl, index) => (
                      <View key={index} style={styles.imageViewerSlide}>
                        <GestureDetector gesture={combinedGesture}>
                          <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
                            <Image
                              source={{ uri: imageUrl }}
                              style={styles.fullScreenImage}
                              resizeMode="contain"
                            />
                          </Animated.View>
                        </GestureDetector>
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
                </GestureHandlerRootView>
              </Modal>

              {/* Video Player Modal */}
              <Modal
                visible={showVideoPlayer}
                animationType="fade"
                presentationStyle="fullScreen"
                onRequestClose={() => {
                  setShowVideoPlayer(false);
                  setVideoLoading(false);
                  setVideoStatus(null);
                }}
              >
                <SafeAreaView style={styles.videoPlayerContainer}>
                  <View style={styles.videoPlayerHeader}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowVideoPlayer(false);
                        setVideoLoading(false);
                        setVideoStatus(null);
                      }}
                      style={styles.videoPlayerCloseButton}
                    >
                      <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.videoPlayerTitle}>
                      {videoLoading ? 'Loading Video...' : 'Video'}
                    </Text>
                    <View style={styles.headerPlaceholder} />
                  </View>

                  <View style={styles.videoPlayerContent}>
                    {videoLoading && (
                      <View style={styles.videoLoadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.videoLoadingText}>Loading video...</Text>
                      </View>
                    )}

                    <Video
                      source={{ uri: currentVideoUrl }}
                      style={styles.videoPlayer}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      shouldCorrectPitch={false}
                      usePoster={false}
                      posterSource={undefined}
                      posterStyle={undefined}
                      onLoadStart={() => {
                        setVideoLoading(true);
                        console.log('Video load started');
                      }}
                      onLoad={(status) => {
                        setVideoLoading(false);
                        setVideoStatus(status);
                        console.log('Video loaded:', status);
                      }}
                      onError={(error) => {
                        setVideoLoading(false);
                        console.error('Video error:', error);
                        Alert.alert('Video Error', 'Unable to load video. Please try again.');
                      }}
                      onPlaybackStatusUpdate={(status) => {
                        setVideoStatus(status);
                      }}
                      progressUpdateIntervalMillis={250}
                    />

                    {videoStatus && !videoLoading && (
                      <View style={styles.videoStatusOverlay}>
                        <Text style={styles.videoStatusText}>
                          {videoStatus.isBuffering ? 'Buffering...' :
                           videoStatus.isPlaying ? 'Playing' : 'Paused'}
                        </Text>
                      </View>
                    )}
                  </View>
                </SafeAreaView>
              </Modal>

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
    </GestureHandlerRootView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 2,
    textTransform: 'capitalize',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    lineHeight: 20,
  },
  resolvedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Modal styles
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
    fontWeight: 'bold',
    color: '#333333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
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
    color: '#374151',
    marginBottom: 12,
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
  modalReportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  modalReportDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  modalLocationText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineNote: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Audio Player Styles
  audioPlayerContainer: {
    marginTop: 12,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  audioInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  audioTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  audioProgressContainer: {
    marginTop: 8,
  },
  audioProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  // Media Overlay Styles
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  // Modal Detail Row Styles
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
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
    paddingTop: 10,
    paddingBottom: 10,
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
  imageViewerResetButton: {
    padding: 8,
  },
  imageViewerSlide: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  imageViewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeImageViewerDot: {
    backgroundColor: '#FFFFFF',
  },

  // Video Player Styles
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  videoPlayerCloseButton: {
    padding: 8,
  },
  videoPlayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoPlayerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  videoLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  videoStatusOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  videoStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  videoPlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 8,
  },
});
