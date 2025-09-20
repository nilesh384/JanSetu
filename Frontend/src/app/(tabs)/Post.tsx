import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import { createReport } from '../../api/report.js';
import { uploadReportMedia } from '../../api/media';
import { useAuth } from '@/src/context/AuthContext';
import { useTranslation } from 'react-i18next';
import offlineStorage from '../../services/offlineStorage';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function Post() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const issueCategories = [
    { 
      id: 1, 
      name: t('profile.categoryRoadsInfrastructure'), 
      description: t('profile.categoryRoadsDesc'),
      department: t('profile.categoryRoadsDept'),
      icon: 'map'
    },
    { 
      id: 2, 
      name: t('profile.categoryLighting'), 
      description: t('profile.categoryLightingDesc'),
      department: t('profile.categoryLightingDept'),
      icon: 'lightbulb'
    },
    { 
      id: 3, 
      name: t('profile.categorySanitation'), 
      description: t('profile.categorySanitationDesc'),
      department: t('profile.categorySanitationDept'),
      icon: 'delete'
    },
    { 
      id: 4, 
      name: t('profile.categoryWater'), 
      description: t('profile.categoryWaterDesc'),
      department: t('profile.categoryWaterDept'),
      icon: 'water'
    },
    { 
      id: 5, 
      name: t('profile.categoryHealth'), 
      description: t('profile.categoryHealthDesc'),
      department: t('profile.categoryHealthDept'),
      icon: 'healing'
    },
    { 
      id: 6, 
      name: t('profile.categoryParks'), 
      description: t('profile.categoryParksDesc'),
      department: t('profile.categoryParksDept'),
      icon: 'park'
    },
    { 
      id: 7, 
      name: t('profile.categoryTraffic'), 
      description: t('profile.categoryTrafficDesc'),
      department: t('profile.categoryTrafficDept'),
      icon: 'traffic'
    },
    { 
      id: 8, 
      name: t('profile.categorySafety'), 
      description: t('profile.categorySafetyDesc'),
      department: t('profile.categorySafetyDept'),
      icon: 'warning'
    },
    { 
      id: 9, 
      name: t('profile.categoryEducation'), 
      description: t('profile.categoryEducationDesc'),
      department: t('profile.categoryEducationDept'),
      icon: 'school'
    },
    { 
      id: 10, 
      name: t('profile.categoryEncroachments'), 
      description: t('profile.categoryEncroachmentsDesc'),
      department: t('profile.categoryEncroachmentsDept'),
      icon: 'domain'
    },
    { 
      id: 11, 
      name: t('profile.categoryEnvironment'), 
      description: t('profile.categoryEnvironmentDesc'),
      department: t('profile.categoryEnvironmentDept'),
      icon: 'public'
    },
    { 
      id: 12, 
      name: t('profile.categoryAnimal'), 
      description: t('profile.categoryAnimalDesc'),
      department: t('profile.categoryAnimalDept'),
      icon: 'pets'
    },
    { 
      id: 13, 
      name: t('profile.categoryServices'), 
      description: t('profile.categoryServicesDesc'),
      department: t('profile.categoryServicesDept'),
      icon: 'assignment'
    },
    { 
      id: 14, 
      name: t('profile.categoryOthers'), 
      description: t('profile.categoryOthersDesc'),
      department: t('profile.categoryOthersDept'),
      icon: 'ellipsis-horizontal'
    }
  ];
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaItems, setMediaItems] = useState<Array<{id: string, uri: string, type: 'image' | 'video'}>>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineReportsCount, setOfflineReportsCount] = useState(0);

  
  // Audio recording states
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);



  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Cleanup audio resources on component unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (playbackSound) {
        playbackSound.unloadAsync();
      }
    };
  }, [recording, playbackSound]);

  // Network monitoring and offline reports count
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable));
    });

    // Update offline reports count
    const updateOfflineCount = async () => {
      const count = await offlineStorage.getOfflineReportsCount();
      setOfflineReportsCount(count);
    };

    updateOfflineCount();

    // Check for pending reports when component mounts
    const checkPendingReports = async () => {
      const isOnline = await offlineStorage.checkNetworkStatus();
      if (isOnline) {
        const pendingCount = await offlineStorage.getPendingReportsCount();
        if (pendingCount > 0) {
          console.log(`📤 Found ${pendingCount} pending reports, user can upload manually`);
        }
      }
    };

    checkPendingReports();

    return () => unsubscribe();
  }, []);

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report issues');
        setIsLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const addr = address[0];
    const locationParts = [
      addr?.name,
      addr?.street,
      addr?.streetNumber,
      addr?.district,
      addr?.subregion,
      addr?.city,
      addr?.region,
      addr?.postalCode
    ].filter(Boolean);

    const locationAddress = locationParts.length > 0 
      ? locationParts.join(', ')
      : 'Current Location';


      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: locationAddress,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Set a default location if geolocation fails
      setLocation({
        latitude: 0,
        longitude: 0,
        address: t('post.locationUnavailable'),
      });
      Alert.alert(t('post.locationError'));
    } finally {
      setIsLocationLoading(false);
    }
  };

  const pickMedia = async () => {
    if (mediaItems.length >= 3) {
      Alert.alert(t('post.limitReached'));
      return;
    }

    // Check if there's already a video
    const hasVideo = mediaItems.some(item => item.type === 'video');
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('post.permissionRequired'));
      return;
    }

    const options: any[] = [
      { text: t('post.takePhoto'), onPress: () => openCamera('image') },
      { text: t('post.choosePhoto'), onPress: () => openMediaPicker('image') },
    ];

    if (!hasVideo) {
      options.splice(1, 0, { text: t('post.recordVideo'), onPress: () => openCamera('video') });
      options.splice(3, 0, { text: t('post.chooseVideo'), onPress: () => openMediaPicker('video') });
    }

    options.push({ text: t('post.cancel'), style: 'cancel' });

    Alert.alert(
      t('post.selectMedia'),
      hasVideo ? t('post.videoLimit') : t('post.mediaSubtitle'),
      options
    );
  };

  const openCamera = async (mediaType: 'image' | 'video') => {
    // Check video limit
    if (mediaType === 'video' && mediaItems.some(item => item.type === 'video')) {
      Alert.alert(t('post.videoLimit'));
      return;
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.granted === false) {
      Alert.alert(t('post.cameraPermissionRequired'));
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: mediaType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1.0, // Maximum quality, we'll compress later for images
      allowsMultipleSelection: false,
    };

    // Add video-specific options
    if (mediaType === 'video') {
      options.videoMaxDuration = 30; // 30 seconds limit
    }

    const result = await ImagePicker.launchCameraAsync(options);

    if (!result.canceled) {
      await addMediaItem(result.assets[0].uri, mediaType);
    }
  };

  const openMediaPicker = async (mediaType: 'image' | 'video') => {
    // Check video limit
    if (mediaType === 'video' && mediaItems.some(item => item.type === 'video')) {
      Alert.alert('Video Limit', 'You can only add one video. Remove the existing video to add a new one.');
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: mediaType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1.0, // Maximum quality, we'll compress later for images
      allowsMultipleSelection: false,
    };

    // Add video-specific options
    if (mediaType === 'video') {
      options.videoMaxDuration = 30; // 30 seconds limit
    }

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      await addMediaItem(result.assets[0].uri, mediaType);
    }
  };

  const addMediaItem = async (uri: string, type: 'image' | 'video') => {
    try {
      // Generate unique ID
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      let finalUri = uri;

      // For images, compress using expo-image-manipulator (much more efficient)
      if (type === 'image') {
        console.log('🔄 Compressing image...');
        
        // Get image dimensions first to determine optimal resize strategy
        const { width, height } = await new Promise<{width: number, height: number}>((resolve) => {
          Image.getSize(uri, (width, height) => resolve({ width, height }));
        });
        
        console.log(`📏 Original image size: ${width}x${height}`);
        
        // Calculate optimal dimensions while maintaining aspect ratio
        const maxDimension = 1920;
        let newWidth = width;
        let newHeight = height;
        
        if (width > maxDimension || height > maxDimension) {
          const aspectRatio = width / height;
          if (width > height) {
            newWidth = maxDimension;
            newHeight = Math.round(maxDimension / aspectRatio);
          } else {
            newHeight = maxDimension;
            newWidth = Math.round(maxDimension * aspectRatio);
          }
        }
        
        console.log(`📐 Target size: ${newWidth}x${newHeight}`);

        const manipulatedImage = await ImageManipulator.manipulateAsync(
          uri,
          width > maxDimension || height > maxDimension 
            ? [{ resize: { width: newWidth, height: newHeight } }]
            : [], // No resize needed if image is already small
          {
            compress: 0.8, // 80% quality for better balance
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false
          }
        );
        
        finalUri = manipulatedImage.uri;
        console.log('✅ Image compressed successfully');
      }

      const newMediaItem = { id, uri: finalUri, type };
      setMediaItems(prev => [...prev, newMediaItem]);
    } catch (error) {
      console.error('❌ Error adding media item:', error);
      Alert.alert('Error', 'Failed to add media item');
    }
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  // Audio recording functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Audio recording permission is required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setRecordingDuration(Math.floor((status.durationMillis || 0) / 1000));
            
            // Stop recording after 60 seconds (limit)
            if ((status.durationMillis || 0) >= 60000) {
              stopRecording();
            }
          }
        }
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (playbackSound) {
        await playbackSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setPlaybackSound(sound);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording:', error);
      setIsPlaying(false);
    }
  };

  const stopPlayback = async () => {
    if (playbackSound) {
      await playbackSound.stopAsync();
      setIsPlaying(false);
    }
  };

  const removeRecording = () => {
    if (playbackSound) {
      playbackSound.unloadAsync();
      setPlaybackSound(null);
    }
    setRecordingUri(null);
    setIsPlaying(false);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please provide a title for your report');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description of the issue');
      return false;
    }
    if (selectedCategory === null) {
      Alert.alert('Missing Information', 'Please select an issue category');
      return false;
    }
    if (!location) {
      Alert.alert(t('post.missingLocation'));
      return false;
    }
    return true;
  };

  // Submit report when online
  const submitOnlineReport = async () => {
    let uploadedMediaUrls: string[] = [];
    let uploadedAudioUrl: string = '';

    // Step 1: Upload media files to Cloudinary if any exist
    if (mediaItems.length > 0 || recordingUri) {
      setIsUploadingMedia(true);
      setUploadProgress(t('post.uploadingMedia'));
      console.log('📁 Uploading media files to Cloudinary...');
      
      // Retry logic for media upload
      let uploadAttempts = 0;
      const maxRetries = 3;
      let uploadResult = null;
      
      while (uploadAttempts < maxRetries && !uploadResult?.success) {
        try {
          uploadAttempts++;
          if (uploadAttempts > 1) {
            setUploadProgress(t('post.retryingUpload', { attempt: uploadAttempts, max: maxRetries }));
          }
          
          uploadResult = await uploadReportMedia(mediaItems, recordingUri || undefined, user?.id || '');
          
          if (uploadResult.success) {
            break;
          }
        } catch (retryError) {
          console.error(`Upload attempt ${uploadAttempts} failed:`, retryError);
          if (uploadAttempts === maxRetries) {
            throw new Error(`Failed to upload media after ${maxRetries} attempts: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`);
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
        }
      }
      
      if (!uploadResult?.success) {
        throw new Error(uploadResult?.message || 'Failed to upload media files after multiple attempts');
      }

      uploadedMediaUrls = uploadResult.mediaUrls || [];
      uploadedAudioUrl = uploadResult.audioUrl || '';
      
      console.log('✅ Media uploaded successfully:', {
        mediaUrls: uploadedMediaUrls,
        audioUrl: uploadedAudioUrl
      });
      
      setIsUploadingMedia(false);
      setUploadProgress(t('post.mediaUploaded'));
    }

    // Get department from selected category
    const selectedCategoryData = issueCategories.find(cat => cat.id === selectedCategory);
    
    setUploadProgress(t('post.creatingReport'));
    
    // Step 2: Create report data with Cloudinary URLs
    const reportData = {
      userId: user?.id || '',
      title: title.trim(),
      description: description.trim(),
      category: selectedCategoryData?.name || 'Others',
      priority: 'auto',
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      address: location?.address || '',
      department: selectedCategoryData?.department || 'General Administrative Office',
      mediaUrls: uploadedMediaUrls,
      audioUrl: uploadedAudioUrl
    };

    // Step 3: Call the actual API to create the report with retry logic
    let reportAttempts = 0;
    const maxReportRetries = 2;
    let reportResponse = null;
    
    while (reportAttempts < maxReportRetries && !reportResponse) {
      try {
        reportAttempts++;
        if (reportAttempts > 1) {
          setUploadProgress(t('post.retryingReport', { attempt: reportAttempts, max: maxReportRetries }));
        }
        
        reportResponse = await createReport(reportData);
        break;
      } catch (reportError) {
        console.error(`Report creation attempt ${reportAttempts} failed:`, reportError);
        if (reportAttempts === maxReportRetries) {
          throw new Error(`Failed to create report after ${maxReportRetries} attempts: ${reportError instanceof Error ? reportError.message : 'Unknown error'}`);
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setUploadProgress(t('post.reportSubmitted'));

    Alert.alert(
      t('post.reportSubmitted'),
      `Your report has been submitted!\n\nAssigned to: ${selectedCategoryData?.department}\nYou will receive updates on the progress.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setTitle('');
            setDescription('');
            setSelectedCategory(null);
            setMediaItems([]);
            removeRecording();
            setUploadProgress('');
            // Navigate back or to home
            router.back();
          },
        },
      ]
    );
  };

  // Handle manual upload of pending reports
  const handleAutoUpload = async () => {
    try {
      setIsSubmitting(true);
      await offlineStorage.triggerAutoUpload();
      
      // Refresh the count
      const count = await offlineStorage.getOfflineReportsCount();
      setOfflineReportsCount(count);
      
      Alert.alert(
        t('post.uploadSuccess'),
        t('post.allReportsUploaded')
      );
    } catch (error) {
      console.error('Auto upload failed:', error);
      Alert.alert(
        t('post.uploadFailed'),
        (error as Error).message || t('post.tryAgainLater')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReport = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsUploadingMedia(false);
    setUploadProgress('');
    
    try {
      // Check network status
      const networkStatus = await offlineStorage.checkNetworkStatus();
      
      if (!networkStatus) {
        // Offline: Save report locally
        console.log('📱 Device is offline, saving report locally...');
        
        const selectedCategoryData = issueCategories.find(cat => cat.id === selectedCategory);
        
        const reportData = {
          userId: user?.id || '',
          title: title.trim(),
          description: description.trim(),
          category: selectedCategoryData?.name || 'Others',
          priority: 'auto',
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          address: location?.address || '',
          department: selectedCategoryData?.department || 'General Administrative Office',
          mediaUrls: [], // Will be uploaded when online
          audioUrl: '', // Will be uploaded when online
          // Store original media data for later upload
          mediaItems: mediaItems,
          recordingUri: recordingUri
        };

        const offlineId = await offlineStorage.saveOfflineReport(reportData);
        
        Alert.alert(
          t('post.reportSavedOffline'),
          t('post.reportWillUploadWhenOnline'),
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setSelectedCategory(null);
                setMediaItems([]);
                removeRecording();
                setUploadProgress('');
                setOfflineReportsCount(prev => prev + 1);
                router.back();
              },
            },
          ]
        );
        
        return;
      }

      // Online: Proceed with normal submission
      await submitOnlineReport();
      
    } catch (error) {
      console.error('Error in submitReport:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Please check your connection and try again';
      setUploadProgress('');
      setIsUploadingMedia(false);
      
      // If it's a network error, offer to save offline
      if (errorMessage.toLowerCase().includes('network') || 
          errorMessage.toLowerCase().includes('connection') ||
          errorMessage.toLowerCase().includes('timeout')) {
        
        Alert.alert(
          t('post.networkError'),
          t('post.saveOfflineQuestion'),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
            },
            {
              text: t('post.saveOffline'),
              onPress: async () => {
                try {
                  const selectedCategoryData = issueCategories.find(cat => cat.id === selectedCategory);
                  
                  const reportData = {
                    userId: user?.id || '',
                    title: title.trim(),
                    description: description.trim(),
                    category: selectedCategoryData?.name || 'Others',
                    priority: 'auto',
                    latitude: location?.latitude || 0,
                    longitude: location?.longitude || 0,
                    address: location?.address || '',
                    department: selectedCategoryData?.department || 'General Administrative Office',
                    mediaUrls: [],
                    audioUrl: '',
                    mediaItems: mediaItems,
                    recordingUri: recordingUri
                  };

                  const offlineId = await offlineStorage.saveOfflineReport(reportData);
                  setOfflineReportsCount(prev => prev + 1);
                  
                  Alert.alert(
                    t('post.reportSavedOffline'),
                    t('post.reportWillUploadWhenOnline')
                  );
                  
                  // Reset form
                  setTitle('');
                  setDescription('');
                  setSelectedCategory(null);
                  setMediaItems([]);
                  removeRecording();
                  setUploadProgress('');
                  router.back();
                  
                } catch (offlineError) {
                  console.error('Error saving offline:', offlineError);
                  Alert.alert(t('error'), t('post.failedToSaveOffline'));
                }
              },
            },
          ]
        );
      } else {
        // Non-network error, show regular retry option
        Alert.alert(
          t('post.submissionError'),
          errorMessage,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Retry',
              onPress: () => submitReport(),
            },
          ]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={24} color="#333" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>{t('post.reportCivicIssue')}</Text>
  <View style={{ width: 24 }} />
</View>

        {/* Offline Status Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={20} color="#fff" />
            <Text style={styles.offlineText}>
              {t('common.offline')} • {t('post.willUploadWhenOnline')}
            </Text>
            {offlineReportsCount > 0 && (
              <Text style={styles.offlineCount}>
                {offlineReportsCount} {t('post.pending')}
              </Text>
            )}
          </View>
        )}

        {/* Manual Upload Button for Online with Pending Reports */}
        {isOnline && offlineReportsCount > 0 && (
          <TouchableOpacity 
            style={styles.manualUploadBanner}
            onPress={handleAutoUpload}
          >
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.offlineText}>
              {t('post.uploadPendingReports')} ({offlineReportsCount})
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Issue Category Selection */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>{t('post.issueCategory')}</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
  >
    <Text style={styles.dropdownText}>
      {selectedCategory !== null ? issueCategories.find(c => c.id === selectedCategory)?.name : t('post.selectCategory')}
    </Text>
    <Ionicons name="chevron-down" size={20} color="#666" />
  </TouchableOpacity>
  
  {showCategoryDropdown && (
    <View style={styles.dropdownList}>
      {issueCategories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={styles.dropdownItem}
          onPress={() => {
            setSelectedCategory(category.id);
            setShowCategoryDropdown(false);
          }}
        >
          <MaterialIcons name={category.icon as any} size={20} color="#FF6B35" />
          <View style={styles.categoryTextContainer}>
            <Text style={styles.dropdownItemText}>{category.name}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>


        {/* Priority Selection - Automatically determined by system */}
        {/* Priority is now automatically calculated based on location and category severity */}

        {/* Issue Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('post.issueTitle')}</Text>
          <TextInput
            style={styles.titleInput}
            placeholder={t('post.titlePlaceholder')}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Issue Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('post.detailedDescription')}</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder={t('post.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('post.photosVideos')}</Text>
          <Text style={styles.sectionSubtitle}>{t('post.mediaSubtitle')}</Text>
          
          {mediaItems.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScrollView}>
              {mediaItems.map((item) => (
                <View key={item.id} style={styles.mediaItemContainer}>
                  {item.type === 'image' ? (
                    <Image source={{ uri: item.uri }} style={styles.mediaItem} />
                  ) : (
                    <View style={styles.videoContainer}>
                      <Image source={{ uri: item.uri }} style={styles.mediaItem} />
                      <View style={styles.videoOverlay}>
                        <Ionicons name="play" size={24} color="#FFFFFF" />
                      </View>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.removeMediaButton} 
                    onPress={() => removeMediaItem(item.id)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" style={{ zIndex: 100 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          
          {mediaItems.length < 3 && (
            <TouchableOpacity style={styles.mediaUploadCard} onPress={pickMedia}>
              <MaterialIcons name="add-a-photo" size={32} color="#666666" />
              <Text style={styles.mediaUploadText}>{t('post.addMedia')}</Text>
              <Text style={styles.mediaUploadSubtext}>
                {t('post.photosVideos')} • {3 - mediaItems.length} {t('post.remaining')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Audio Recording */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('post.voiceRecording')}</Text>
          <Text style={styles.sectionSubtitle}>{t('post.voiceSubtitle')}</Text>
          
          {recordingUri ? (
            <View style={styles.audioContainer}>
              <View style={styles.audioPlayer}>
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={isPlaying ? stopPlayback : playRecording}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                <View style={styles.audioInfo}>
                  <Text style={styles.audioTitle}>{t('post.voiceRecordingTitle')}</Text>
                  <Text style={styles.audioDuration}>{formatDuration(recordingDuration)}</Text>
                </View>
                <TouchableOpacity style={styles.removeAudioButton} onPress={removeRecording}>
                  <Ionicons name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.audioRecordCard, isRecording && styles.recordingCard]} 
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isRecording && recordingDuration >= 60}
            >
              <View style={styles.recordButton}>
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={32} 
                  color={isRecording ? "#F44336" : "#666666"} 
                />
              </View>
              <View style={styles.recordInfo}>
                <Text style={[styles.recordText, isRecording && styles.recordingText]}>
                  {isRecording ? t('post.recording') : t('post.tapToRecord')}
                </Text>
                {isRecording && (
                  <Text style={styles.recordDuration}>
                    {formatDuration(recordingDuration)} / 1:00
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('post.location')}</Text>
          <View style={styles.locationCard}>
            {isLocationLoading ? (
              <View style={styles.locationLoading}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.locationLoadingText}>{t('post.gettingLocation')}</Text>
              </View>
            ) : location ? (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color="#4CAF50" />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText}>{location.address || t('post.currentLocation')}</Text>
                  <Text style={styles.coordinatesText}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                </View>
                <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.getLocationButton} onPress={getCurrentLocation}>
                <Ionicons name="location-outline" size={20} color="#FF6B35" />
                <Text style={styles.getLocationText}>{t('post.getCurrentLocation')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={submitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.submitLoadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {isUploadingMedia ? t('post.uploading') : uploadProgress || t('post.submitting')}
                </Text>
              </View>
            ) : (
              <View style={styles.submitContentContainer}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {isOnline ? t('post.submitReport') : t('post.saveOffline')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          {uploadProgress && isSubmitting && (
            <Text style={styles.progressText}>{uploadProgress}</Text>
          )}
          
          <Text style={styles.submitNote}>
            {t('post.submitNote')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginBottom: 70,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#E0E0E0',
  marginTop: 30,
},
headerTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
},
offlineBanner: {
  backgroundColor: '#FF6B35',
  padding: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginHorizontal: 20,
  marginTop: 10,
  borderRadius: 8,
},
offlineText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
  flex: 1,
  marginLeft: 8,
},
offlineCount: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},
manualUploadBanner: {
  backgroundColor: '#4CAF50',
  padding: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginHorizontal: 20,
  marginTop: 10,
  borderRadius: 8,
},
section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCategoryCard: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  dropdownButton: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderWidth: 2,
  borderColor: '#D0D0D0',
  borderRadius: 12,
  padding: 18,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},
dropdownText: {
  fontSize: 16,
  color: '#333',
  fontWeight: '600',
},
dropdownList: {
  backgroundColor: '#FFFFFF',
  borderWidth: 2,
  borderColor: '#D0D0D0',
  borderRadius: 12,
  marginTop: 8,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},
dropdownItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  padding: 18,
  borderBottomWidth: 1,
  borderBottomColor: '#E8E8E8',
  backgroundColor: '#FAFAFA',
  marginHorizontal: 4,
  marginVertical: 2,
  borderRadius: 8,
},
dropdownItemText: {
  fontSize: 16,
  marginLeft: 12,
  color: '#222',
  fontWeight: '700',
},
categoryTextContainer: {
  flex: 1,
  marginLeft: 12,
},
categoryDescription: {
  fontSize: 12,
  color: '#555',
  marginTop: 3,
  lineHeight: 16,
  fontWeight: '500',
},

  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  imageUploadCard: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 4,
  },
  locationCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLoadingText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  refreshButton: {
    padding: 4,
  },
  getLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getLocationText: {
    fontSize: 16,
    color: '#FF6B35',
    marginLeft: 8,
    fontWeight: '600',
  },
  submitSection: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  submitLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  submitNote: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  
  // Audio Recording Styles
  audioContainer: {
    marginTop: 12,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 14,
    color: '#666666',
  },
  removeAudioButton: {
    padding: 8,
  },
  audioRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginTop: 12,
  },
  recordingCard: {
    borderColor: '#F44336',
    backgroundColor: '#FFF5F5',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  recordInfo: {
    flex: 1,
  },
  recordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  recordingText: {
    color: '#F44336',
  },
  recordDuration: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'monospace',
  },
  
  // Media Upload Styles
  mediaScrollView: {
    marginTop: 12,
    marginBottom: 8,
  },
  mediaItemContainer: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mediaUploadCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 12,
  },
  mediaUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 8,
  },
  mediaUploadSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
});
