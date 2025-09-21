import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { Audio, Video, ResizeMode } from 'expo-av';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import UniversalHeader from '@/src/components/UniversalHeader';
import { formatDateParts } from '@/src/utils/date';

const { width, height } = Dimensions.get('window');

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
  userName?: string;
  userPhone?: string;
  userProfilePhoto?: string;
}

export default function ReportDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse the report data from params
  const report: Report = params.report ? JSON.parse(params.report as string) : null;

  // State for media viewing
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isHorizontalScrollEnabled, setIsHorizontalScrollEnabled] = useState(true);

  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [audioPosition, setAudioPosition] = useState<number | null>(null);

  // Video state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<any>(null);

  // Zoom and pan for images
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Gesture handlers
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      const clampedScale = Math.min(Math.max(newScale, 0.5), 3);
      scale.value = clampedScale;

      if (clampedScale <= 1) {
        translateX.value = 0;
        translateY.value = 0;
        setIsHorizontalScrollEnabled(true);
      } else {
        setIsHorizontalScrollEnabled(false);
      }
    });

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > 1) {
        setIsHorizontalScrollEnabled(false);

        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        const imageWidth = screenWidth * scale.value;
        const imageHeight = screenHeight * scale.value;

        const maxTranslateX = Math.max(0, (imageWidth - screenWidth) / 2);
        const maxTranslateY = Math.max(0, (imageHeight - screenHeight) / 2);

        const newTranslateX = savedTranslateX.value + event.translationX;
        const newTranslateY = savedTranslateY.value + event.translationY;

        translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
        translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
      }
    })
    .onEnd(() => {
      setTimeout(() => {
        setIsHorizontalScrollEnabled(true);
      }, 100);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value === 1) {
        scale.value = withTiming(2);
        setIsHorizontalScrollEnabled(false);
      } else {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        setIsHorizontalScrollEnabled(true);
      }
    });

  const combinedGesture = Gesture.Exclusive(doubleTapGesture, pinchGesture, panGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ]
  }));

  // Audio functions
  const playAudio = async (audioUrl: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, isLooping: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
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

  const formatTimeTaken = (milliseconds: number) => {
    if (!milliseconds || milliseconds <= 0) return 'N/A';

    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0 && parts.length < 2) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return parts.join(', ') || 'Less than a minute';
  };

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

  // Use centralized date formatting that correctly handles ISO and SQL-like timestamps
  const formatDate = (dateString: string | null) => formatDateParts(dateString);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <UniversalHeader title="Report Details" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Report not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <UniversalHeader title="Report Details" showBackButton={true} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Details Section - Moved to Top */}
          {report.userName && (
            <View style={styles.userDetailsSection}>
              <View style={styles.userDetailsHeader}>
                <Text style={styles.userDetailsTitle}>Reported By</Text>
              </View>
              <View style={styles.userCard}>
                <TouchableOpacity onPress={() => router.push(`/user-details?userId=${report.userId}`)}>
                  <Text style={[styles.userName, styles.clickableUserName]}>{report.userName}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Header Info */}
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportId}>#{report.id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                <MaterialIcons name={getPriorityIcon(report.priority)} size={12} color="#FFFFFF" />
                <Text style={styles.priorityText}>{report.priority}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.isResolved) }]}>
              <Text style={styles.statusText}>{getStatusText(report.isResolved)}</Text>
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Report Details</Text>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDescription}>{report.description}</Text>
          </View>

          {/* Media Section */}
          {(report.mediaUrls.length > 0 || report.audioUrl) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attachments</Text>

              {/* Images/Videos */}
              {report.mediaUrls.length > 0 && (
                <View style={styles.mediaGrid}>
                  {report.mediaUrls.map((url, index) => {
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
                            setCurrentImages(report.mediaUrls);
                            setSelectedImageIndex(index);
                            scale.value = 1;
                            translateX.value = 0;
                            translateY.value = 0;
                            setIsHorizontalScrollEnabled(true);
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
              {report.audioUrl && (
                <View style={styles.audioPlayerContainer}>
                  <TouchableOpacity
                    style={styles.audioPlayer}
                    onPress={() => {
                      if (isPlaying) {
                        stopAudio();
                      } else {
                        playAudio(report.audioUrl!);
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Category</Text>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#666666" />
              <Text style={styles.detailText}>{report.address || 'Location not specified'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="category" size={20} color="#666666" />
              <Text style={styles.detailText}>{report.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="business" size={20} color="#666666" />
              <Text style={styles.detailText}>{report.department}</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Ionicons name="add-circle" size={20} color="#2196F3" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Report Submitted</Text>
                <Text style={styles.timelineDate}>
                  {formatDate(report.createdAt).date} at {formatDate(report.createdAt).time}
                </Text>
              </View>
            </View>

            {report.resolvedAt && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Report Resolved</Text>
                  <Text style={styles.timelineDate}>
                    {formatDate(report.resolvedAt).date} at {formatDate(report.resolvedAt).time}
                  </Text>
                  {report.timeTakenToResolve && (
                    <Text style={styles.timelineNote}>
                      Resolved in {formatTimeTaken(report.timeTakenToResolve)}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Resolution Details Section */}
          {report.isResolved && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resolution Details</Text>

              {/* Resolution Notes */}
              {report.resolutionNotes && (
                <View style={styles.resolutionNotesContainer}>
                  <View style={styles.resolutionNotesHeader}>
                    <Ionicons name="document-text" size={20} color="#FF6B35" />
                    <Text style={styles.resolutionNotesTitle}>Resolution Notes</Text>
                  </View>
                  <Text style={styles.resolutionNotesText}>
                    {report.resolutionNotes}
                  </Text>
                </View>
              )}

              {/* Resolver Information */}
              {(report.resolvedBy || report.resolvedByRole) && (
                <View style={styles.resolverInfoContainer}>
                  <View style={styles.resolverInfoHeader}>
                    <Ionicons name="person" size={20} color="#FF6B35" />
                    <Text style={styles.resolverInfoTitle}>Resolved By</Text>
                  </View>
                  <View style={styles.resolverDetails}>
                    {report.resolvedBy && (
                      <Text style={styles.resolverName}>{report.resolvedBy}</Text>
                    )}
                    {report.resolvedByRole && (
                      <Text style={styles.resolverRole}>{report.resolvedByRole}</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Time Taken */}
              {report.timeTakenToResolve && (
                <View style={styles.timeTakenContainer}>
                  <View style={styles.timeTakenHeader}>
                    <Ionicons name="time" size={20} color="#FF6B35" />
                    <Text style={styles.timeTakenTitle}>Time Taken</Text>
                  </View>
                  <Text style={styles.timeTakenText}>
                    {formatTimeTaken(report.timeTakenToResolve)}
                  </Text>
                </View>
              )}

              {/* Resolved Media */}
              {report.resolvedMediaUrls && report.resolvedMediaUrls.length > 0 && (
                <View style={styles.resolvedMediaContainer}>
                  <View style={styles.resolvedMediaHeader}>
                    <Ionicons name="images" size={20} color="#FF6B35" />
                    <Text style={styles.resolvedMediaTitle}>Resolution Media</Text>
                  </View>
                  <View style={styles.resolvedMediaGrid}>
                    {report.resolvedMediaUrls.map((url, index) => {
                      const isVideo = isVideoFile(url);
                      return (
                        <TouchableOpacity
                          key={`resolved-${index}`}
                          style={styles.resolvedMediaItem}
                          onPress={() => {
                            if (isVideo) {
                              setCurrentVideoUrl(url);
                              setVideoLoading(true);
                              setVideoStatus(null);
                              setShowVideoPlayer(true);
                            } else {
                              setCurrentImages(report.resolvedMediaUrls || []);
                              setSelectedImageIndex(index);
                              scale.value = 1;
                              translateX.value = 0;
                              translateY.value = 0;
                              setIsHorizontalScrollEnabled(true);
                              setShowImageViewer(true);
                            }
                          }}
                        >
                          <Image source={{ uri: url }} style={styles.resolvedMediaImage} />
                          <View style={styles.resolvedMediaOverlay}>
                            {isVideo ? (
                              <View style={styles.resolvedVideoPlayButton}>
                                <Ionicons name="play-circle" size={24} color="#FFFFFF" />
                              </View>
                            ) : (
                              <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

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
                onLoadStart={() => {
                  setVideoLoading(true);
                }}
                onLoad={(status) => {
                  setVideoLoading(false);
                  setVideoStatus(status);
                }}
                onError={(error) => {
                  setVideoLoading(false);
                  console.error('Video error:', error);
                  Alert.alert('Video Error', 'Unable to load video. Please try again.');
                }}
                onPlaybackStatusUpdate={(status) => {
                  setVideoStatus(status);
                }}
              />
            </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // User Details Section Styles
  userDetailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'center',
    width: '100%', // Make it narrower
  },
  userDetailsHeader: {
    marginBottom: 12,
  },
  userDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  userAvatarContainer: {
    marginRight: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0b16f1ff',
    marginBottom: 4,
  },
  clickableUserName: {
    textDecorationLine: 'underline',
  },
  userPhone: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 16,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginRight: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  userInfoContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
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
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginTop: 8,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
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
    paddingBottom: 16,
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
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  timelineNote: {
    fontSize: 13,
    color: '#888888',
    fontStyle: 'italic',
  },
  // Resolution Details Styles
  resolutionNotesContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  resolutionNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resolutionNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginLeft: 8,
  },
  resolutionNotesText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingLeft: 28,
  },
  resolverInfoContainer: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  resolverInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resolverInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 8,
  },
  resolverDetails: {
    paddingLeft: 28,
  },
  resolverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  resolverRole: {
    fontSize: 14,
    color: '#16A34A',
    fontStyle: 'italic',
  },
  timeTakenContainer: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  timeTakenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeTakenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  timeTakenText: {
    fontSize: 15,
    color: '#78350F',
    paddingLeft: 28,
    fontWeight: '500',
  },
  resolvedMediaContainer: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  resolvedMediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resolvedMediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  resolvedMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resolvedMediaItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  resolvedMediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  resolvedMediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolvedVideoPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  imageViewerResetButton: {
    padding: 8,
  },
  imageViewerSlide: {
    width: width,
    height: height - 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: height - 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height - 120,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
  videoPlayerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: width,
    height: height - 120,
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  videoLoadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
});