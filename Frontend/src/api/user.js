import { Platform } from 'react-native';
import axios from 'axios';

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

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create or login user (called after OTP verification)
 * @param {string} phoneNumber - Phone number with country code
 * @returns {Promise<Object>} Response object with user data
 */
export const createOrLoginUser = async (phoneNumber) => {
  try {
    console.log('👤 Creating/logging in user:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/users/create-or-login`);

    const response = await apiClient.post('/users/create-or-login', { phoneNumber });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      user: response.data.user,
      isNewUser: response.data.isNewUser,
      requiresProfileSetup: response.data.requiresProfileSetup,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error in createOrLoginUser:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to create/login user',
        error: error
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Update user profile
 * @param {string} userId - User's unique ID
 * @param {Object} profileData - Profile data {fullName, email, profileImageUrl}
 * @returns {Promise<Object>} Response object with updated user data
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('📝 Updating user profile:', userId, profileData);
    console.log('📡 API URL:', `${API_BASE_URL}/users/update-profile`);

    const response = await apiClient.put('/users/update-profile', {
      userId,
      fullName: profileData.fullName,
      email: profileData.email,
      profileImageUrl: profileData.profileImageUrl,
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error updating profile:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to update profile',
        error: error
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Get user by ID
 * @param {string} userId - User's unique ID
 * @returns {Promise<Object>} Response object with user data
 */
export const getUserById = async (userId) => {
  try {
    console.log('🔍 Fetching user by ID:', userId);
    console.log('📡 API URL:', `${API_BASE_URL}/users/user/${userId}`);

    const response = await apiClient.get(`/users/user/${userId}`);

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      user: response.data.user,
      requiresProfileSetup: response.data.requiresProfileSetup
    };

  } catch (error) {
    console.error('❌ Error fetching user:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch user',
        error: error
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Upload profile image to Cloudinary
 * @param {string} userId - User's unique ID
 * @param {string} imageUri - Local image URI from ImagePicker
 * @returns {Promise<Object>} Response object with updated user data and image URL
 */
export const uploadProfileImage = async (userId, imageUri) => {
  try {
    console.log('📸 Uploading profile image for user:', userId);
    console.log('📡 API URL:', `${API_BASE_URL}/users/upload-profile-image`);

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('profileImage', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile_image.jpg',
    });

    const response = await apiClient.post('/users/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      user: response.data.user,
      imageUrl: response.data.imageUrl,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error uploading profile image:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to upload profile image',
        error: error
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Get user by phone number
 * @param {string} phoneNumber - Phone number with country code
 * @returns {Promise<Object>} Response object with user data
 */
export const getUserByPhone = async (phoneNumber) => {
  try {
    console.log('🔍 Fetching user by phone:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/users/phone/${encodeURIComponent(phoneNumber)}`);

    const response = await apiClient.get(`/users/phone/${encodeURIComponent(phoneNumber)}`);

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      user: response.data.user,
      requiresProfileSetup: response.data.requiresProfileSetup
    };

  } catch (error) {
    console.error('❌ Error fetching user by phone:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch user',
        error: error
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
      };
    }
  }
};

export const deleteUser = async (phoneNumber) => {
  try {
    console.log('🗑 Deleting user with phone:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/users/delete`);

    const response = await apiClient.delete('/users/delete', {
      data: { phoneNumber }
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      message: 'User deleted successfully',
    };

  } catch (error) {
    console.error('❌ Error deleting user:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to delete user',
        error: error
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
      };
    }
  }
};