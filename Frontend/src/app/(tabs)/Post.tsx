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

import { createReport } from '../../api/report.js';
import { uploadReportMedia } from '../../api/media';
import { useAuth } from '@/src/context/AuthContext';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const issueCategories = [
  { 
    id: 1, 
    name: "Roads & Infrastructure", 
    description: "Report potholes, damaged pavements, unsafe road conditions, or encroachments.",
    department: "Municipal Engineering Division",
    icon: 'map'
  },
  { 
    id: 2, 
    name: "Street Lighting & Electrical", 
    description: "Non-functional streetlights, exposed wires, or electrical pole issues.",
    department: "Municipal Electrical Wing",
    icon: 'lightbulb'
  },
  { 
    id: 3, 
    name: "Sanitation & Waste", 
    description: "Overflowing garbage bins, irregular pickup, open drains, or illegal dumping.",
    department: "Municipal Sanitation Department",
    icon: 'delete'
  },
  { 
    id: 4, 
    name: "Water Supply & Sewerage", 
    description: "Water leakage, blocked sewers, no water supply, or contaminated water.",
    department: "Municipal Water Supply & Sewerage",
    icon: 'water'
  },
  { 
    id: 5, 
    name: "Public Health & Hygiene", 
    description: "Mosquito breeding, stagnant water, animal carcasses, or unhygienic surroundings.",
    department: "Municipal Health Department",
    icon: 'healing'
  },
  { 
    id: 6, 
    name: "Parks & Greenery", 
    description: "Unmaintained parks, broken benches, damaged trees, or need for plantation.",
    department: "Municipal Horticulture Division",
    icon: 'park'
  },
  { 
    id: 7, 
    name: "Traffic & Transport", 
    description: "Broken signals, missing signage, illegal parking, or road encroachments.",
    department: "Municipal Traffic Engineering Division",
    icon: 'traffic'
  },
  { 
    id: 8, 
    name: "Public Safety & Emergency", 
    description: "Fire hazards, building collapse, unsafe structures, or accidents.",
    department: "Fire & Emergency Services",
    icon: 'warning'
  },
  { 
    id: 9, 
    name: "Education & Amenities", 
    description: "Damaged school toilets, poor upkeep of libraries, or community halls.",
    department: "Municipal Public Amenities Department",
    icon: 'school'
  },
  { 
    id: 10, 
    name: "Encroachments & Illegal Constructions", 
    description: "Unauthorized shops, hawkers blocking pathways, or illegal structures.",
    department: "Municipal Urban Planning & Encroachment Removal",
    icon: 'domain'
  },
  { 
    id: 11, 
    name: "Environment & Pollution", 
    description: "Air/noise pollution, waste burning, or polluted lakes and ponds.",
    department: "Municipal Environment Cell",
    icon: 'public'
  },
  { 
    id: 12, 
    name: "Animal Control", 
    description: "Stray dogs, cattle menace, or injured/abandoned animals.",
    department: "Municipal Veterinary Department",
    icon: 'pets'
  },
  { 
    id: 13, 
    name: "Citizen Services", 
    description: "Delays in birth/death certificates, property tax disputes, billing issues.",
    department: "Municipal Citizen Service Centre",
    icon: 'assignment'
  },
  { 
    id: 14, 
    name: "Others", 
    description: "Any issues excluding the given categories",
    department: "General Administrative Office",
    icon: 'ellipsis-horizontal'
  }
];

export default function Post() {
  const { user } = useAuth();
  const router = useRouter();
  
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
        address: 'Location unavailable - Please enable GPS and retry',
      });
      Alert.alert('Location Error', 'Unable to get current location. Please check GPS settings and try again.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const pickMedia = async () => {
    if (mediaItems.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 photos/videos');
      return;
    }

    // Check if there's already a video
    const hasVideo = mediaItems.some(item => item.type === 'video');
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera roll permission is required to select media');
      return;
    }

    const options: any[] = [
      { text: 'Take Photo', onPress: () => openCamera('image') },
      { text: 'Choose Photo', onPress: () => openMediaPicker('image') },
    ];

    if (!hasVideo) {
      options.splice(1, 0, { text: 'Record Video', onPress: () => openCamera('video') });
      options.splice(3, 0, { text: 'Choose Video', onPress: () => openMediaPicker('video') });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Select Media',
      hasVideo ? 'You can only add one video. Add photos only.' : 'Choose how you want to add media',
      options
    );
  };

  const openCamera = async (mediaType: 'image' | 'video') => {
    // Check video limit
    if (mediaType === 'video' && mediaItems.some(item => item.type === 'video')) {
      Alert.alert('Video Limit', 'You can only add one video. Remove the existing video to add a new one.');
      return;
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to capture media');
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
      Alert.alert('Missing Location', 'Location is required to submit a report');
      return false;
    }
    return true;
  };

  const submitReport = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsUploadingMedia(false);
    setUploadProgress('');
    
    try {
      let uploadedMediaUrls: string[] = [];
      let uploadedAudioUrl: string = '';

      // Step 1: Upload media files to Cloudinary if any exist
      if (mediaItems.length > 0 || recordingUri) {
        setIsUploadingMedia(true);
        setUploadProgress('Uploading media files...');
        console.log('📁 Uploading media files to Cloudinary...');
        
        // Retry logic for media upload
        let uploadAttempts = 0;
        const maxRetries = 3;
        let uploadResult = null;
        
        while (uploadAttempts < maxRetries && !uploadResult?.success) {
          try {
            uploadAttempts++;
            if (uploadAttempts > 1) {
              setUploadProgress(`Retrying upload... (${uploadAttempts}/${maxRetries})`);
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
        setUploadProgress('Media uploaded successfully!');
      }

      // Get department from selected category
      const selectedCategoryData = issueCategories.find(cat => cat.id === selectedCategory);
      
      setUploadProgress('Creating report...');
      
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
            setUploadProgress(`Retrying report creation... (${reportAttempts}/${maxReportRetries})`);
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

      setUploadProgress('Report submitted successfully!');

      Alert.alert(
        'Report Submitted Successfully!',
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
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Please check your connection and try again';
      setUploadProgress('');
      setIsUploadingMedia(false);
      
      // Show retry option for network errors
      Alert.alert(
        'Submission Failed',
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
  <Text style={styles.headerTitle}>Report Civic Issue</Text>
  <View style={{ width: 24 }} />
</View>


        {/* Issue Category Selection */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Issue Category</Text>
  <TouchableOpacity 
    style={styles.dropdownButton}
    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
  >
    <Text style={styles.dropdownText}>
      {selectedCategory !== null ? issueCategories.find(c => c.id === selectedCategory)?.name : 'Select Category'}
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
          <Text style={styles.sectionTitle}>Issue Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Brief title describing the issue"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Issue Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community..."
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
          <Text style={styles.sectionTitle}>Photos & Videos</Text>
          <Text style={styles.sectionSubtitle}>Add up to 3 photos/videos (max 30s for videos)</Text>
          
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
              <Text style={styles.mediaUploadText}>Add Media</Text>
              <Text style={styles.mediaUploadSubtext}>
                Photo/Video • {3 - mediaItems.length} remaining
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Audio Recording */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Recording</Text>
          <Text style={styles.sectionSubtitle}>Add voice description (max 60 seconds)</Text>
          
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
                  <Text style={styles.audioTitle}>Voice Recording</Text>
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
                  {isRecording ? "Recording..." : "Tap to Record"}
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
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            {isLocationLoading ? (
              <View style={styles.locationLoading}>
                <ActivityIndicator size="small" color="#FF6B35" />
                <Text style={styles.locationLoadingText}>Getting location...</Text>
              </View>
            ) : location ? (
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={20} color="#4CAF50" />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationText}>{location.address || 'Current Location'}</Text>
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
                <Text style={styles.getLocationText}>Get Current Location</Text>
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
                  {isUploadingMedia ? 'Uploading...' : uploadProgress || 'Submitting...'}
                </Text>
              </View>
            ) : (
              <View style={styles.submitContentContainer}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {uploadProgress && isSubmitting && (
            <Text style={styles.progressText}>{uploadProgress}</Text>
          )}
          
          <Text style={styles.submitNote}>
            Your report will be automatically routed to the appropriate department and you'll receive updates on its status.
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
