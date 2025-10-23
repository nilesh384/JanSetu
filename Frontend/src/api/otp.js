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
    return 'https://your-production-api.com/API/v1';
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
 * Send OTP to a phone number
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {Promise<Object>} Response object with success status and message
 */
export const sendOTP = async (phoneNumber) => {
  try {
    console.log('🚀 Sending OTP to:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/otp/send`);

    const response = await apiClient.post('/otp/send', {
      phoneNumber: phoneNumber
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      message: response.data.message,
      messageSid: response.data.messageSid
    };

  } catch (error) {
    console.error('Error sending OTP:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to send OTP',
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
 * Verify OTP for a phone number
 * @param {string} phoneNumber - 10-digit phone number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} Response object with success status, message, and user data
 */
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    console.log('🔍 Verifying OTP for:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/otp/verify`);

    const response = await apiClient.post('/otp/verify', {
      phoneNumber: phoneNumber,
      otp: otp
    });

    console.log('📥 Verify response status:', response.status);
    console.log('📄 Verify response data:', response.data);

    return {
      success: true,
      message: response.data.message,
      user: response.data.user || null,
      isNewUser: response.data.isNewUser || false,
      requiresProfileSetup: response.data.requiresProfileSetup || false,
      warning: response.data.warning || null
    };

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to verify OTP',
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
 * Send test OTP (for testing with verified number)
 * @returns {Promise<Object>} Response object with success status and test OTP
 */
export const sendTestOTP = async () => {
  try {
    const response = await apiClient.post('/otp/send-test');

    console.log('📥 Test OTP response status:', response.status);
    console.log('📄 Test OTP response data:', response.data);

    return {
      success: true,
      message: response.data.message,
      testOTP: response.data.testOTP,
      messageSid: response.data.messageSid
    };

  } catch (error) {
    console.error('Error sending test OTP:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to send test OTP',
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
 * Get stored OTPs for debugging (development only)
 * @returns {Promise<Object>} Response object with stored OTPs
 */
export const getStoredOTPs = async () => {
  try {
    const response = await apiClient.get('/otp/debug');

    console.log('📥 Debug OTPs response status:', response.status);
    console.log('📄 Debug OTPs response data:', response.data);

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('Error getting stored OTPs:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to get stored OTPs',
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
