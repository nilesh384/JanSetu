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
 * Create a new social post from a report
 * @param {Object} postData - Post data object
 * @param {string} postData.userId - User ID creating the post
 * @param {string} postData.reportId - Report ID to create post from
 * @param {string} postData.title - Post title (optional, will use report title if not provided)
 * @param {string} postData.content - Post content (optional, will use report description if not provided)
 * @returns {Promise<Object>} Response object with post data
 */
export const createSocialPost = async (postData) => {
  try {
    console.log('📱 Creating social post:', postData.title || 'New Post');
    console.log('📡 API URL:', `${API_BASE_URL}/social/posts`);

    const response = await apiClient.post('/social/posts', {
      userId: postData.userId,
      reportId: postData.reportId,
      title: postData.title,
      content: postData.content
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      post: response.data.post,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error creating social post:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to create social post',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Get social posts with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Posts per page (default: 10)
 * @param {string} params.sortBy - Sort by field (default: 'created_at')
 * @param {string} params.sortOrder - Sort order 'asc' or 'desc' (default: 'desc')
 * @param {string} params.category - Filter by category (optional)
 * @param {string} params.department - Filter by department (optional)
 * @param {string} params.priority - Filter by priority (optional)
 * @param {string} params.userId - Filter by user ID (optional)
 * @param {number} params.latitude - User latitude for distance calculation (optional)
 * @param {number} params.longitude - User longitude for distance calculation (optional)
 * @returns {Promise<Object>} Response object with posts data
 */
export const getSocialPosts = async (params = {}) => {
  try {
    console.log('📱 Fetching social posts with params:', params);
    console.log('📡 API URL:', `${API_BASE_URL}/social/posts`);

    const response = await apiClient.get('/social/posts', { params });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data count:', response.data.posts?.length || 0);

    return {
      success: true,
      posts: response.data.posts,
      totalCount: response.data.totalCount,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      hasMore: response.data.hasMore
    };

  } catch (error) {
    console.error('❌ Error fetching social posts:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch social posts',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Vote on a social post (upvote or downvote)
 * @param {string} postId - Post ID to vote on
 * @param {string} userId - User ID casting the vote
 * @param {string} voteType - Vote type: 'upvote' or 'downvote'
 * @returns {Promise<Object>} Response object with vote data
 */
export const voteOnPost = async (postId, userId, voteType) => {
  try {
    console.log(`👍 ${voteType} on post:`, postId);
    console.log('📡 API URL:', `${API_BASE_URL}/social/posts/${postId}/vote`);

    const response = await apiClient.post(`/social/posts/${postId}/vote`, {
      userId,
      voteType
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      vote: response.data.vote,
      upvoteCount: response.data.upvoteCount,
      downvoteCount: response.data.downvoteCount,
      userVote: response.data.userVote,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error voting on post:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to cast vote',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Add a comment to a social post
 * @param {string} postId - Post ID to comment on
 * @param {string} userId - User ID adding the comment
 * @param {string} content - Comment content
 * @param {string} parentCommentId - Parent comment ID for replies (optional)
 * @returns {Promise<Object>} Response object with comment data
 */
export const addComment = async (postId, userId, content, parentCommentId = null) => {
  try {
    console.log('💬 Adding comment to post:', postId);
    console.log('📡 API URL:', `${API_BASE_URL}/social/posts/${postId}/comments`);

    const response = await apiClient.post(`/social/posts/${postId}/comments`, {
      userId,
      content,
      parentCommentId
    });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      comment: response.data.comment,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error adding comment:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to add comment',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Get comments for a social post
 * @param {string} postId - Post ID to get comments for
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Comments per page (default: 20)
 * @param {string} params.sortBy - Sort by field (default: 'created_at')
 * @param {string} params.sortOrder - Sort order 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Response object with comments data
 */
export const getPostComments = async (postId, params = {}) => {
  try {
    console.log('💬 Fetching comments for post:', postId);
    console.log('📡 API URL:', `${API_BASE_URL}/social/posts/${postId}/comments`);

    const response = await apiClient.get(`/social/posts/${postId}/comments`, { params });

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data count:', response.data.comments?.length || 0);

    return {
      success: true,
      comments: response.data.comments,
      totalCount: response.data.totalCount,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages,
      hasMore: response.data.hasMore
    };

  } catch (error) {
    console.error('❌ Error fetching comments:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch comments',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Get social statistics for a user
 * @param {string} userId - User ID to get stats for
 * @returns {Promise<Object>} Response object with user stats
 */
export const getSocialStats = async (userId) => {
  try {
    console.log('📊 Fetching social stats for user:', userId);
    console.log('📡 API URL:', `${API_BASE_URL}/social/stats/${userId}`);

    const response = await apiClient.get(`/social/stats/${userId}`);

    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', response.data);

    return {
      success: true,
      stats: response.data.stats
    };

  } catch (error) {
    console.error('❌ Error fetching social stats:', error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to fetch social stats',
        error: error
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: error
      };
    } else {
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error
      };
    }
  }
};

/**
 * Track a post view
 * @param {string} postId - Post ID to track view for
 * @param {string} userId - User ID viewing the post
 * @returns {Promise<Object>} Response object
 */
export const trackPostView = async (postId, userId) => {
  try {
    console.log('👁️ Tracking view for post:', postId);
    console.log('📡 API URL:', `${API_BASE_URL}/social/posts/${postId}/view`);

    const response = await apiClient.post(`/social/posts/${postId}/view`, {
      userId
    });

    console.log('📥 Response status:', response.status);

    return {
      success: true,
      message: response.data.message
    };

  } catch (error) {
    console.error('❌ Error tracking post view:', error);

    // For view tracking, we can silently fail since it's not critical
    return {
      success: false,
      message: 'Failed to track view',
      error: error
    };
  }
};

export default {
  createSocialPost,
  getSocialPosts,
  voteOnPost,
  addComment,
  getPostComments,
  getSocialStats,
  trackPostView
};
