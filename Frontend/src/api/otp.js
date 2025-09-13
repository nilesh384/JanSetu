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
 * Send OTP to a phone number
 * @param {string} phoneNumber - 10-digit phone number
 * @returns {Promise<Object>} Response object with success status and message
 */
export const sendOTP = async (phoneNumber) => {
  try {
    console.log('🚀 Sending OTP to:', phoneNumber);
    console.log('📡 API URL:', `${API_BASE_URL}/otp/send`);
    
    const response = await fetch(`${API_BASE_URL}/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber
      }),
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return {
      success: true,
      message: data.message,
      messageSid: data.messageSid
    };

  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};

/**
 * Verify OTP for a phone number
 * @param {string} phoneNumber - 10-digit phone number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} Response object with success status and message
 */
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        otp: otp
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }

    return {
      success: true,
      message: data.message
    };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};

/**
 * Send test OTP (for testing with verified number)
 * @returns {Promise<Object>} Response object with success status and test OTP
 */
export const sendTestOTP = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test OTP');
    }

    return {
      success: true,
      message: data.message,
      testOTP: data.testOTP,
      messageSid: data.messageSid
    };

  } catch (error) {
    console.error('Error sending test OTP:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};

/**
 * Get stored OTPs for debugging (development only)
 * @returns {Promise<Object>} Response object with stored OTPs
 */
export const getStoredOTPs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp/debug`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get stored OTPs');
    }

    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Error getting stored OTPs:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};
