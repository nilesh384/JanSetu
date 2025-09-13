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
    
    const response = await fetch(`${API_BASE_URL}/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create profile');
    }

    return {
      success: true,
      message: data.message,
      user: data.user
    };

  } catch (error) {
    console.error('Error creating profile:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};