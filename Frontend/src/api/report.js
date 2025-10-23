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
 * Create a new report
 * @param {Object} reportData - Report data object
 * @param {string} reportData.userId - User ID creating the report
 * @param {string} reportData.title - Report title
 * @param {string} reportData.description - Report description
 * @param {string} reportData.category - Report category
 * @param {string} reportData.priority - Report priority
 * @param {Array<string>} reportData.mediaUrls - Array of media URLs
 * @param {string} reportData.audioUrl - Audio URL (optional)
 * @param {number} reportData.latitude - Location latitude
 * @param {number} reportData.longitude - Location longitude
 * @param {string} reportData.address - Location address
 * @param {string} reportData.department - Responsible department
 * @returns {Promise<Object>} Response object with report data
 */
export const createReport = async (reportData) => {
  try {
    console.log('📝 Creating new report:', reportData.title);
    console.log('📡 API URL:', `${API_BASE_URL}/reports/create`);

    const response = await apiClient.post('/reports/create', {
      userId: reportData.userId,
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      priority: reportData.priority,
      mediaUrls: reportData.mediaUrls || [],
      audioUrl: reportData.audioUrl || null,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      address: reportData.address,
      department: reportData.department
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      report: response.data.report,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error creating report:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to create report',
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
 * Get all reports for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (optional)
 * @param {number} options.limit - Number of items per page (optional)
 * @param {string} options.status - Filter by status: 'resolved', 'pending' (optional)
 * @returns {Promise<Object>} Response object with user reports
 */
export const getUserReports = async (userId, options = {}) => {
  try {
    console.log('📋 Fetching reports for user:', userId);

    // Build query parameters
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;

    const response = await apiClient.get(`/reports/user/${userId}`, { params });

    console.log('� Response status:', response.status);
    // console.log('📄 Response data:', response.data);

    return {
      success: true,
      reports: response.data.reports,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error fetching user reports:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch user reports',
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
 * Get a specific report by ID
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Response object with report data
 */
export const getReportById = async (reportId) => {
  try {
    console.log('🔍 Fetching report by ID:', reportId);
    console.log('📡 API URL:', `${API_BASE_URL}/reports/${reportId}`);

    const response = await apiClient.get(`/reports/${reportId}`);

    console.log('📥 Response status:', response.status);
    // console.log('� Response data:', response.data);

    return {
      success: true,
      report: response.data.report,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error fetching report:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch report',
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
 * Delete a report
 * @param {string} reportId - Report ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Response object
 */
// export const deleteReport = async (reportId, userId) => {
//   try {
//     console.log('🗑️ Deleting report:', reportId, 'by user:', userId);
//     console.log('📡 API URL:', `${API_BASE_URL}/reports/${reportId}`);
    
//     const response = await fetch(`${API_BASE_URL}/reports/${reportId}?userId=${userId}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     console.log('📥 Response status:', response.status);
    
//     let data;
//     try {
//       data = await response.json();
//     } catch (parseError) {
//       console.error('❌ JSON parse error:', parseError);
//       throw new Error('Invalid response from server');
//     }
    
//     console.log('📄 Response data:', data);

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to delete report');
//     }

//     return {
//       success: true,
//       message: data.message
//     };

//   } catch (error) {
//     console.error('❌ Error deleting report:', error);
//     return {
//       success: false,
//       message: error.message || 'Network error. Please check your connection.',
//       error: error
//     };
//   }
// };

/**
 * Get nearby reports based on location
 * @param {Object} location - Location object
 * @param {number} location.latitude - Current latitude
 * @param {number} location.longitude - Current longitude
 * @param {number} radius - Search radius in kilometers (default: 5)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (optional)
 * @param {number} options.limit - Number of items per page (optional)
 * @param {string} options.category - Filter by category (optional)
 * @param {string} options.priority - Filter by priority (optional)
 * @returns {Promise<Object>} Response object with nearby reports
 */
export const getNearbyReports = async (location, radius = 5, options = {}) => {
  try {
    console.log('📍 Fetching nearby reports:', location, 'radius:', radius);

    // Validate location object
    if (!location || typeof location.latitude === 'undefined' || typeof location.longitude === 'undefined') {
      throw new Error('Invalid location object. Must have latitude and longitude properties.');
    }

    // Build query parameters
    const params = {
      latitude: location.latitude,
      longitude: location.longitude,
      radius: radius
    };

    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.category) params.category = options.category;
    if (options.priority) params.priority = options.priority;
    if (options.userId) params.userId = options.userId;

    const response = await apiClient.get('/reports/nearby', { params });

    console.log('📥 Response status:', response.status);
    // console.log('📄 Response data:', response.data);

    // Handle backend response structure
    if (response.data && response.data.success && response.data.reports) {
      return {
        success: true,
        reports: response.data.reports || [],
        total: response.data.reports ? response.data.reports.length : 0,
        pagination: response.data.pagination || {},
        message: response.data.message || 'Reports fetched successfully'
      };
    } else {
      return {
        success: false,
        reports: [],
        total: 0,
        message: response.data?.message || 'No reports found'
      };
    }

  } catch (error) {
    console.error('❌ Error fetching nearby reports:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch nearby reports',
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
 * Get user report statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response object with user stats
 */
export const getUserReportsStats = async (userId) => {
  try {
    console.log('📊 Fetching report stats for user:', userId);
    console.log('📡 API URL:', `${API_BASE_URL}/reports/user/${userId}/stats`);

    const response = await apiClient.get(`/reports/user/${userId}/stats`);

    console.log('📥 Response status:', response.status);
    // console.log('� Response data:', response.data);

    return {
      success: true,
      stats: response.data.stats,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch user stats',
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
 * Update an existing report
 * @param {string} reportId - Report ID
 * @param {Object} updateData - Data to update
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Response object with updated report data
 */
export const updateReport = async (reportId, updateData, userId) => {
  try {
    console.log('✏️ Updating report:', reportId);
    console.log('📡 API URL:', `${API_BASE_URL}/reports/${reportId}`);

    const response = await apiClient.put(`/reports/${reportId}`, {
      ...updateData,
      userId: userId // For authorization
    });

    console.log('📥 Response status:', response.status);
    // console.log('📄 Response data:', response.data);

    return {
      success: true,
      report: response.data.report,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error updating report:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to update report',
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
 * Get community statistics for the stats grid
 * @returns {Promise<Object>} Response object with community stats
 */
export const getCommunityStats = async () => {
  try {
    console.log('📊 Fetching community statistics');
    console.log('📡 API URL:', `${API_BASE_URL}/reports/community-stats`);

    const response = await apiClient.get('/reports/community-stats');

    console.log('📥 Response status:', response.status);
    // console.log('� Response data:', response.data);

    return {
      success: true,
      stats: response.data.stats,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error fetching community statistics:', error);

    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch community statistics',
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
