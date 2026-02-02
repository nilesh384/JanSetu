import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { 
  getSocialPosts, 
  voteOnPost, 
  addComment, 
  getPostComments, 
  getSocialStats, 
  trackPostView,
  createSocialPost 
} from '../../api/social.js';
import { useFocusEffect } from '@react-navigation/native';

// Type definitions for API responses
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

interface CommentsResponse extends ApiResponse {
  comments: Comment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

interface AddCommentResponse extends ApiResponse {
  comment: Comment;
}

interface SocialPost {
  id: string;
  userId: string;
  reportId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  userVote?: 'upvote' | 'downvote' | null;
  // Report details (joined from reports table)
  report?: {
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';
    latitude: number;
    longitude: number;
    address: string;
    department: string;
    mediaUrls?: string[];
  };
  // User details (joined from users table)
  user?: {
    id: string;
    fullName: string;
    profileImageUrl?: string;
  };
}

interface UserStats {
  totalPosts: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalComments: number;
  totalViews: number;
  engagementRate: number;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  user?: {
    fullName: string;
    profileImageUrl?: string;
  };
  replies?: Comment[];
}

interface SocialPostsResponse {
  success: boolean;
  posts?: SocialPost[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  hasMore?: boolean;
  message?: string;
  error?: any;
}

interface UserStatsResponse {
  success: boolean;
  stats?: UserStats;
  message?: string;
  error?: any;
}

interface VoteResponse {
  success: boolean;
  vote?: any;
  upvoteCount?: number;
  downvoteCount?: number;
  userVote?: 'upvote' | 'downvote' | null;
  message?: string;
  error?: any;
}

export default function Social() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Post detail modal state
  const [postDetailModalVisible, setPostDetailModalVisible] = useState(false);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<SocialPost | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Data fetching functions
  const fetchPosts = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
        tab: activeTab
      };

      // Always send userId if available (needed for vote status)
      if (user) {
        params.userId = user.id;
        console.log('📤 Fetching posts with userId:', user.id);
      } else {
        console.log('⚠️ Fetching posts without userId');
      }

      // Add specific filtering based on active tab
      if (activeTab === 'activity' && user) {
        // userId already added above
      }

      const result = await getSocialPosts(params) as SocialPostsResponse;

      if (result.success) {
        const newPosts = result.posts || [];
        
        if (page === 1 || refresh) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        // Track views for newly loaded posts
        if (user && newPosts.length > 0) {
          newPosts.forEach(post => {
            handlePostView(post.id);
          });
        }
        
        setHasMore(result.hasMore || false);
        setCurrentPage(page);
      } else {
        console.error('API Error:', result.message || 'Failed to load posts');
        // Don't show alert for API errors to prevent blocking UI
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Don't show alert for network errors to prevent blocking UI
      setPosts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab, user]);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await getSocialStats(user.id) as UserStatsResponse;
      if (result.success && result.stats) {
        setUserStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [user]);

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting) return;

    // Find the current post to calculate optimistic changes
    const currentPost = posts.find(p => p.id === postId) || selectedPostForDetail;
    if (!currentPost) return;

    const currentVote = currentPost.userVote;
    let newUpvoteCount = currentPost.upvoteCount;
    let newDownvoteCount = currentPost.downvoteCount;
    let newUserVote: 'upvote' | 'downvote' | null = null;

    // Calculate optimistic changes
    if (voteType === 'upvote') {
      if (currentVote === 'upvote') {
        // Remove upvote
        newUpvoteCount -= 1;
        newUserVote = null;
      } else if (currentVote === 'downvote') {
        // Change from downvote to upvote
        newDownvoteCount -= 1;
        newUpvoteCount += 1;
        newUserVote = 'upvote';
      } else {
        // Add upvote
        newUpvoteCount += 1;
        newUserVote = 'upvote';
      }
    } else {
      if (currentVote === 'downvote') {
        // Remove downvote
        newDownvoteCount -= 1;
        newUserVote = null;
      } else if (currentVote === 'upvote') {
        // Change from upvote to downvote
        newUpvoteCount -= 1;
        newDownvoteCount += 1;
        newUserVote = 'downvote';
      } else {
        // Add downvote
        newDownvoteCount += 1;
        newUserVote = 'downvote';
      }
    }

    // Optimistically update UI immediately
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            upvoteCount: newUpvoteCount,
            downvoteCount: newDownvoteCount,
            userVote: newUserVote
          }
        : post
    ));

    // Update selected post for detail modal
    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail({
        ...selectedPostForDetail,
        upvoteCount: newUpvoteCount,
        downvoteCount: newDownvoteCount,
        userVote: newUserVote
      });
    }

    // Now make the API call
    setIsVoting(postId);
    try {
      const result = await voteOnPost(postId, user.id, voteType) as VoteResponse;
      
      if (result.success) {
        // Update with actual server values
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? {
                ...post,
                upvoteCount: result.upvoteCount ?? post.upvoteCount,
                downvoteCount: result.downvoteCount ?? post.downvoteCount,
                userVote: result.userVote ?? post.userVote
              }
            : post
        ));

        // Update selected post if in modal
        if (selectedPostForDetail?.id === postId) {
          setSelectedPostForDetail(prev => prev ? {
            ...prev,
            upvoteCount: result.upvoteCount ?? prev.upvoteCount,
            downvoteCount: result.downvoteCount ?? prev.downvoteCount,
            userVote: result.userVote ?? prev.userVote
          } : null);
        }
      } else {
        // Revert optimistic update on error
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? {
                ...post,
                upvoteCount: currentPost.upvoteCount,
                downvoteCount: currentPost.downvoteCount,
                userVote: currentPost.userVote
              }
            : post
        ));
        if (selectedPostForDetail?.id === postId) {
          setSelectedPostForDetail(currentPost as SocialPost);
        }
        Alert.alert('Error', result.message || 'Failed to vote');
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              upvoteCount: currentPost.upvoteCount,
              downvoteCount: currentPost.downvoteCount,
              userVote: currentPost.userVote
            }
          : post
      ));
      if (selectedPostForDetail?.id === postId) {
        setSelectedPostForDetail(currentPost as SocialPost);
      }
      console.error('Error voting:', error);
      Alert.alert('Error', 'Something went wrong while voting');
    } finally {
      setIsVoting(null);
    }
  };

  const handlePostView = async (postId: string) => {
    if (!user) return;
    
    try {
      await trackPostView(postId, user.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Post detail modal functions
  const openPostDetailModal = async (post: SocialPost) => {
    setSelectedPostForDetail(post);
    setPostDetailModalVisible(true);
    
    // Load comments for this post
    await loadComments(post.id);
    
    // Track view
    await handlePostView(post.id);
  };

  const closePostDetailModal = () => {
    setPostDetailModalVisible(false);
    setSelectedPostForDetail(null);
    setComments([]);
    setCommentInput('');
  };

  const loadComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const result = await getPostComments(postId, { 
        page: 1, 
        limit: 50, 
        sortBy: 'created_at', 
        sortOrder: 'desc' 
      }) as CommentsResponse;
      if (result.success) {
        setComments(result.comments || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Something went wrong while loading comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!user || !selectedPostForDetail || !commentInput.trim()) return;

    setIsSubmittingComment(true);
    try {
      const result = await addComment(selectedPostForDetail.id, user.id, commentInput.trim()) as AddCommentResponse;
      
      if (result.success) {
        // Add the new comment to the local state
        const newComment: Comment = {
          id: result.comment.id,
          postId: selectedPostForDetail.id,
          userId: user.id,
          content: commentInput.trim(),
          createdAt: new Date().toISOString(),
          user: {
            fullName: user.fullName,
            profileImageUrl: user.profileImageUrl
          }
        };
        
        setComments(prev => [newComment, ...prev]);
        setCommentInput('');
        
        // Update comment count in posts
        setPosts(prev => prev.map(post => 
          post.id === selectedPostForDetail.id 
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        ));
      } else {
        Alert.alert('Error', result.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Something went wrong while adding comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(1, true);
      fetchUserStats();
    }
  }, [activeTab, isAuthenticated, fetchPosts, fetchUserStats]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchPosts(1, true);
      }
    }, [isAuthenticated, fetchPosts])
  );

  const onRefresh = useCallback(() => {
    fetchPosts(1, true);
    fetchUserStats();
  }, [fetchPosts, fetchUserStats]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !isLoading) {
      fetchPosts(currentPage + 1);
    }
  }, [hasMore, loadingMore, isLoading, currentPage, fetchPosts]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#FF4444';
      case 'Medium': return '#FF8800';
      case 'Low': return '#44AA44';
      default: return '#666666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return '#666666';
      case 'Under Review': return '#FF8800';
      case 'In Progress': return '#007AFF';
      case 'Resolved': return '#44AA44';
      default: return '#666666';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        {item.user?.profileImageUrl ? (
          <Image
            source={{ uri: item.user.profileImageUrl }}
            style={styles.commentProfilePhoto}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.commentAvatarText}>
            {item.user?.fullName ? getInitials(item.user.fullName) : 'U'}
          </Text>
        )}
      </View>
      <View>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserName}>
            {item.user?.fullName || 'Anonymous User'}
          </Text>
          <Text style={styles.commentTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: SocialPost }) => {
    return (
      <TouchableOpacity 
        style={styles.postListItem}
        onPress={() => openPostDetailModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.postListHeader}>
          <View style={styles.userInfo}>
            {item.user?.profileImageUrl ? (
              <View style={styles.profilePhotoContainer}>
                <Image
                  source={{ uri: item.user.profileImageUrl }}
                  style={styles.listProfilePhoto}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.listAvatar}>
                <Text style={styles.listAvatarText}>
                  {item.user?.fullName ? getInitials(item.user.fullName) : 'U'}
                </Text>
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.listUserName}>
                {item.user?.fullName || 'Anonymous User'}
              </Text>
              <Text style={styles.listPostTime}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.postListMeta}>
            {item.report?.priority && (
              <View style={[styles.listPriorityBadge, { backgroundColor: getPriorityColor(item.report.priority) }]} />
            )}
            {item.report?.status && (
              <View style={[styles.listStatusBadge, { backgroundColor: getStatusColor(item.report.status) }]} />
            )}
          </View>
        </View>

        <Text style={styles.listPostTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.listPostDescription} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.postListFooter}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={12} color="#666666" />
            <Text style={styles.listLocationText} numberOfLines={1}>
              {item.report?.address || 'Location not specified'}
            </Text>
          </View>
          <Text style={styles.listCategoryText}>
            {item.report?.category || 'General'}
          </Text>
        </View>

        <View style={styles.engagementRow}>
          <TouchableOpacity 
            style={styles.engagementItem}
            onPress={(e) => {
              e.stopPropagation();
              handleVote(item.id, 'upvote');
            }}
            activeOpacity={0.6}
          >
            <Ionicons 
              name={item.userVote === 'upvote' ? "thumbs-up" : "thumbs-up-outline"} 
              size={16} 
              color={item.userVote === 'upvote' ? "#10B981" : "#9CA3AF"} 
            />
            <Text style={[
              styles.engagementText,
              item.userVote === 'upvote' && styles.engagementTextActive
            ]}>{item.upvoteCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.engagementItem}
            onPress={(e) => {
              e.stopPropagation();
              handleVote(item.id, 'downvote');
            }}
            activeOpacity={0.6}
          >
            <Ionicons 
              name={item.userVote === 'downvote' ? "thumbs-down" : "thumbs-down-outline"} 
              size={16} 
              color={item.userVote === 'downvote' ? "#EF4444" : "#9CA3AF"} 
            />
            <Text style={[
              styles.engagementText,
              item.userVote === 'downvote' && styles.engagementTextActive
            ]}>{item.downvoteCount}</Text>
          </TouchableOpacity>
          <View style={styles.engagementItem}>
            <Ionicons name="chatbubble-outline" size={15} color="#9CA3AF" />
            <Text style={styles.engagementText}>{item.commentCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loginPrompt}>Please login to view social posts</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Statistics */}
        {userStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalPosts}</Text>
              <Text style={styles.statLabel}>My Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalUpvotes}</Text>
              <Text style={styles.statLabel}>Upvotes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalComments}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalViews}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Ionicons
              name="list"
              size={20}
              color={activeTab === 'all' ? '#FFFFFF' : '#666666'}
            />
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'trending' && styles.activeTab]}
            onPress={() => setActiveTab('trending')}
          >
            <Ionicons
              name="trending-up"
              size={20}
              color={activeTab === 'trending' ? '#FFFFFF' : '#666666'}
            />
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
              Trending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons
              name="person"
              size={20}
              color={activeTab === 'activity' ? '#FFFFFF' : '#666666'}
            />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
              My Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        <View style={styles.feedContainer}>
          <Text style={styles.sectionTitle}>Community Reports</Text>
          <Text style={styles.sectionSubtitle}>Stay updated with local issues and community progress</Text>

          {isLoading && posts.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={['#3B82F6']}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.centerContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" />
                    <Text style={styles.emptyText}>No posts to show</Text>
                    <Text style={styles.emptySubtext}>Be the first to share a community report!</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Post Detail Modal */}
      <Modal
        visible={postDetailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePostDetailModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closePostDetailModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Post Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedPostForDetail && (
            <ScrollView style={styles.postDetailContainer} showsVerticalScrollIndicator={false}>
              {/* Post Header */}
              <View style={styles.postDetailHeader}>
                <View style={styles.userInfo}>
                  {selectedPostForDetail.user?.profileImageUrl ? (
                    <View style={styles.profilePhotoContainer}>
                      <Image
                        source={{ uri: selectedPostForDetail.user.profileImageUrl }}
                        style={styles.detailProfilePhoto}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <View style={styles.detailAvatar}>
                      <Text style={styles.detailAvatarText}>
                        {selectedPostForDetail.user?.fullName ? getInitials(selectedPostForDetail.user.fullName) : 'U'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.detailUserName}>
                      {selectedPostForDetail.user?.fullName || 'Anonymous User'}
                    </Text>
                    <Text style={styles.detailPostTime}>
                      {formatTimeAgo(selectedPostForDetail.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.postMeta}>
                  {selectedPostForDetail.report?.priority && (
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedPostForDetail.report.priority) }]}>
                      <Text style={styles.priorityText}>{selectedPostForDetail.report.priority}</Text>
                    </View>
                  )}
                  {selectedPostForDetail.report?.status && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedPostForDetail.report.status) }]}>
                      <Text style={styles.statusText}>{selectedPostForDetail.report.status}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Post Content */}
              <Text style={styles.detailPostTitle}>
                {selectedPostForDetail.title}
              </Text>
              <Text style={styles.detailPostDescription}>
                {selectedPostForDetail.content}
              </Text>

              {/* Post Footer */}
              <View style={styles.detailPostFooter}>
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={14} color="#666666" />
                  <Text style={styles.locationText}>
                    {selectedPostForDetail.report?.address || 'Location not specified'}
                  </Text>
                </View>
                <Text style={styles.categoryText}>
                  {selectedPostForDetail.report?.category || 'General'}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.detailActionButtons}>
                <TouchableOpacity 
                  style={[
                    styles.detailActionButton,
                    selectedPostForDetail.userVote === 'upvote' && styles.activeUpvote
                  ]}
                  onPress={() => handleVote(selectedPostForDetail.id, 'upvote')}
                  disabled={isVoting === selectedPostForDetail.id}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={selectedPostForDetail.userVote === 'upvote' ? "thumbs-up" : "thumbs-up-outline"} 
                    size={22} 
                    color={selectedPostForDetail.userVote === 'upvote' ? "#10B981" : "#6B7280"} 
                  />
                  <Text style={[
                    styles.detailActionText,
                    selectedPostForDetail.userVote === 'upvote' && styles.activeUpvoteText
                  ]}>
                    {selectedPostForDetail.upvoteCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.detailActionButton,
                    selectedPostForDetail.userVote === 'downvote' && styles.activeDownvote
                  ]}
                  onPress={() => handleVote(selectedPostForDetail.id, 'downvote')}
                  disabled={isVoting === selectedPostForDetail.id}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={selectedPostForDetail.userVote === 'downvote' ? "thumbs-down" : "thumbs-down-outline"} 
                    size={22} 
                    color={selectedPostForDetail.userVote === 'downvote' ? "#EF4444" : "#6B7280"} 
                  />
                  <Text style={[
                    styles.detailActionText,
                    selectedPostForDetail.userVote === 'downvote' && styles.activeDownvoteText
                  ]}>
                    {selectedPostForDetail.downvoteCount}
                  </Text>
                </TouchableOpacity>

                <View style={styles.detailActionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                  <Text style={styles.detailActionText}>{selectedPostForDetail.commentCount}</Text>
                </View>
              </View>

              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <Text style={styles.commentsSectionTitle}>Comments ({selectedPostForDetail.commentCount})</Text>
                
                {isLoadingComments ? (
                  <View style={styles.centerContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading comments...</Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View style={styles.centerContainer}>
                    <Ionicons name="chatbubble-outline" size={48} color="#CCCCCC" />
                    <Text style={styles.emptyText}>No comments yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                  </View>
                ) : (
                  <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderComment}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    contentContainerStyle={styles.commentsList}
                  />
                )}
              </View>
            </ScrollView>
          )}

          {/* Comment Input */}
          {selectedPostForDetail && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentInput}
                onChangeText={setCommentInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!commentInput.trim() || isSubmittingComment) && styles.submitButtonDisabled
                ]}
                onPress={submitComment}
                disabled={!commentInput.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingBottom: 100,
    paddingTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  postsContainer: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePhotoContainer: {
    position: 'relative',
    marginRight: 14,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  profilePhotoGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
  },
  postMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 26,
  },
  postDescription: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 18,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 1,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 6,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  categoryContainer: {
    flexShrink: 1,
    marginLeft: 'auto',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 90,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginLeft: 6,
  },
  activeUpvote: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  activeUpvoteText: {
    color: '#10B981',
    fontWeight: '600',
  },
  activeDownvote: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  activeDownvoteText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginPrompt: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '400',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 60,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  postPreview: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  postPreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  postPreviewContent: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentsList: {
    paddingVertical: 16,
  },
  commentItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentProfilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  commentTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  commentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    color: '#000000',
    fontSize: 14,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Post List Item Styles
  postListItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  postListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listProfilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  listPostTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  postListMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  listPriorityBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listStatusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
    lineHeight: 22,
  },
  listPostDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  postListFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listLocationText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
    fontWeight: '400',
    flex: 1,
  },
  listCategoryText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '500',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  engagementTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  // Post Detail Modal Styles
  postDetailContainer: {
    flex: 1,
    padding: 20,
  },
  postDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailProfilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  detailUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  detailPostTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  detailPostTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 28,
  },
  detailPostDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 90,
    justifyContent: 'center',
    gap: 6,
  },
  detailActionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
});
