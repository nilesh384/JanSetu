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
 * Create user profile after OTP verification
 * @param {Object} profileData - Profile data object
 * @param {string} profileData.phoneNumber - User's phone number
 * @param {string} profileData.name - User's full name
 * @param {string} profileData.email - User's email (optional)
 * @param {string} profileData.profileImage - Profile image URI (optional)
 * @returns {Promise<Object>} Response object with success status and user data
 */
export const createProfile = async (profileData) => {
  try {
    console.log('🚀 Creating profile for:', profileData.phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/profile/create`);

    const response = await apiClient.post('/profile/create', profileData);

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      message: response.data.message,
      user: response.data.user
    };

  } catch (error) {
    console.error('Error creating profile:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to create profile',
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