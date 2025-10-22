import { Platform } from 'react-native';

// Types for media handling
interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

interface UploadResponse {
  success: boolean;
  mediaUrls?: string[];
  audioUrl?: string | null;
  mediaUrl?: string;
  message?: string;
  error?: any;
}

// API Base URL - Using ngrok tunnel
const getBaseURL = () => {
  if (__DEV__) {
    // Development mode - using ngrok tunnel
    const tunnelUrl = process.env.EXPO_PUBLIC_API_URL || 'https://melba-ahistorical-alexa.ngrok-free.dev';
    return `${tunnelUrl}/api/v1`;
  } else {
    // Production mode
    return 'https://your-production-api.com/api/v1';
  }
};

const API_BASE_URL = getBaseURL();

/**
 * Upload multiple media files (images, videos, audio) to Cloudinary
 * @param {Array} mediaItems - Array of media objects with {uri, type}
 * @param {string} audioUri - Audio recording URI (optional)
 * @param {string} userId - User ID for organization
 * @returns {Promise<UploadResponse>} Response object with uploaded URLs
 */
export const uploadReportMedia = async (
  mediaItems: MediaItem[] = [], 
  audioUri?: string, 
  userId: string = ''
): Promise<UploadResponse> => {
  try {
    console.log('📁 Uploading report media for user:', userId);
    console.log('📡 API URL:', `${API_BASE_URL}/reports/upload-media`);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('userId', userId);

    // Add image/video files
    mediaItems.forEach((item, index) => {
      const fileExtension = item.type === 'video' ? 'mp4' : 'jpg';
      const fileName = `media_${index}.${fileExtension}`;
      
      (formData as any).append('mediaFiles', {
        uri: item.uri,
        type: item.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: fileName,
      });
    });

    // Add audio file if present
    if (audioUri) {
      (formData as any).append('audioFile', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio_recording.m4a',
      });
    }

    const response = await fetch(`${API_BASE_URL}/reports/upload-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    console.log('📥 Response status:', response.status);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }
    
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload media files');
    }

    return {
      success: true,
      mediaUrls: data.mediaUrls || [],
      audioUrl: data.audioUrl || null,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error uploading report media:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Network error. Please check your connection.';
    return {
      success: false,
      message: errorMessage,
      error: error
    };
  }
};

/**
 * Upload a single media file to Cloudinary
 * @param {string} mediaUri - Local media URI
 * @param {string} mediaType - Type of media (image, video, audio)
 * @param {string} userId - User ID for organization
 * @returns {Promise<UploadResponse>} Response object with uploaded URL
 */
export const uploadSingleMedia = async (
  mediaUri: string, 
  mediaType: string, 
  userId: string
): Promise<UploadResponse> => {
  try {
    console.log(`📁 Uploading single ${mediaType} for user:`, userId);
    
    const formData = new FormData();
    formData.append('userId', userId);
    
    let fileName, mimeType;
    switch (mediaType) {
      case 'image':
        fileName = 'image.jpg';
        mimeType = 'image/jpeg';
        break;
      case 'video':
        fileName = 'video.mp4';
        mimeType = 'video/mp4';
        break;
      case 'audio':
        fileName = 'audio.m4a';
        mimeType = 'audio/m4a';
        break;
      default:
        throw new Error('Unsupported media type');
    }
    
    (formData as any).append('mediaFile', {
      uri: mediaUri,
      type: mimeType,
      name: fileName,
    });

    const response = await fetch(`${API_BASE_URL}/reports/upload-single-media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload media file');
    }

    return {
      success: true,
      mediaUrl: data.mediaUrl,
      message: data.message
    };

  } catch (error) {
    console.error(`❌ Error uploading ${mediaType}:`, error);
    const errorMessage = (error instanceof Error) ? error.message : 'Network error. Please check your connection.';
    return {
      success: false,
      message: errorMessage,
      error: error
    };
  }
};