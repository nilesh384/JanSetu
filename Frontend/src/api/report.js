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
    
    const response = await fetch(`${API_BASE_URL}/reports/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
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
      throw new Error(data.message || 'Failed to create report');
    }

    return {
      success: true,
      report: data.report,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error creating report:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.status) queryParams.append('status', options.status);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/reports/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(data.message || 'Failed to fetch user reports');
    }

    return {
      success: true,
      reports: data.reports,
      total: data.total,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error fetching user reports:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(data.message || 'Failed to fetch report');
    }

    return {
      success: true,
      report: data.report,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error fetching report:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: radius.toString()
    });
    
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.category) queryParams.append('category', options.category);
    if (options.priority) queryParams.append('priority', options.priority);
    
    const url = `${API_BASE_URL}/reports/nearby?${queryParams.toString()}`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(data.message || 'Failed to fetch nearby reports');
    }

    return {
      success: true,
      reports: data.reports,
      total: data.total,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error fetching nearby reports:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    const response = await fetch(`${API_BASE_URL}/reports/user/${userId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(data.message || 'Failed to fetch user stats');
    }

    return {
      success: true,
      stats: data.stats,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
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
    
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updateData,
        userId: userId // For authorization
      }),
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
      throw new Error(data.message || 'Failed to update report');
    }

    return {
      success: true,
      report: data.report,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error updating report:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};

/**
 * Mark a report as resolved (admin function)
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Response object
 */
export const resolveReport = async (reportId) => {
  try {
    console.log('✅ Resolving report:', reportId);
    console.log('📡 API URL:', `${API_BASE_URL}/reports/${reportId}/resolve`);
    
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
      throw new Error(data.message || 'Failed to resolve report');
    }

    return {
      success: true,
      report: data.report,
      message: data.message
    };

  } catch (error) {
    console.error('❌ Error resolving report:', error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
      error: error
    };
  }
};
