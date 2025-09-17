import axios from 'axios';

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

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a message to the chatbot
 * @param {string} message - User's message
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response with AI reply
 */
export const sendMessage = async (message, userId) => {
  try {
    console.log('🤖 Sending message to chatbot:', message);

    const response = await apiClient.post('/messages', {
      message: message,
      userId: userId
    });

    console.log('📥 Chatbot response:', response.data);

    return {
      success: true,
      aiResponse: response.data.aiResponse,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error sending message:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Server error',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      return {
        success: false,
        message: error.message || 'Unknown error',
        error: error
      };
    }
  }
};

/**
 * Get chat history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response with messages array
 */
export const getMessages = async (userId) => {
  try {
    console.log('📚 Fetching chat history for user:', userId);

    const response = await apiClient.get('/messages', {
      params: { userId: userId }
    });

    console.log('📥 Messages response:', response.data);

    return {
      success: true,
      messages: response.data.messages || [],
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error fetching messages:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch messages',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      return {
        success: false,
        message: error.message || 'Unknown error',
        error: error
      };
    }
  }
};

/**
 * Delete all messages for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response confirmation
 */
export const deleteMessages = async (userId) => {
  try {
    console.log('🗑️ Deleting messages for user:', userId);

    const response = await apiClient.delete('/messages', {
      params: { userId: userId }
    });

    console.log('📥 Delete response:', response.data);

    return {
      success: true,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error deleting messages:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to delete messages',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error
      };
    } else {
      return {
        success: false,
        message: error.message || 'Unknown error',
        error: error
      };
    }
  }
};