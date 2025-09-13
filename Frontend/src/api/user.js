import { Platform } from 'react-native';

// API Base URL - Using VS Code dev tunnel from environment variable
const getBaseURL = () => {
  if (__DEV__) {
    // Development mode - using your dev tunnel from .env file
    const tunnelUrl = process.env.EXPO_PUBLIC_API_URL || 'https://81cq2mbl-4000.inc1.devtunnels.ms';
    return `${tunnelUrl}/api/v1`;
  } else {
    // Production mode
    return 'https://your-production-api.com/api/v1';
  }
};

const API_BASE_URL = getBaseURL();

/**
 * Create or login user (called after OTP verification)
 * @param {string} phoneNumber - Phone number with country code
 * @returns {Promise<Object>} Response object with user data
 */
export const createOrLoginUser = async (phoneNumber) => {
  try {
    console.log('👤 Creating/logging in user:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/users/create-or-login`);
    
    const response = await fetch(`${API_BASE_URL}/users/create-or-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create/login user');
    }

    return {
      success: true,
      user: data.user,
      isNewUser: data.isNewUser,
      requiresProfileSetup: data.requiresProfileSetup,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error in createOrLoginUser:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fullName: profileData.fullName,
        email: profileData.email,
        profileImageUrl: profileData.profileImageUrl,
      }),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return {
      success: true,
      user: data.user,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    const response = await fetch(`${API_BASE_URL}/users/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return {
      success: true,
      user: data.user,
      requiresProfileSetup: data.requiresProfileSetup
    };

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    console.log('� Uploading profile image for user:', userId);
    console.log('📡 API URL:', `${API_BASE_URL}/users/upload-profile-image`);
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('profileImage', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile_image.jpg',
    });

    const response = await fetch(`${API_BASE_URL}/users/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload profile image');
    }

    return {
      success: true,
      user: data.user,
      imageUrl: data.imageUrl,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error uploading profile image:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    const response = await fetch(`${API_BASE_URL}/users/phone/${encodeURIComponent(phoneNumber)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return {
      success: true,
      user: data.user,
      requiresProfileSetup: data.requiresProfileSetup
    };

  } catch (error) {
    console.error('❌ Error fetching user by phone:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};