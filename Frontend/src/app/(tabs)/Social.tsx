import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Post {
  id: string;
  user: string;
  avatar: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';
  timestamp: string;
  supports: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: '1',
    user: 'Rajesh Kumar',
    avatar: 'RK',
    title: 'Pothole on MG Road',
    description: 'Large pothole causing traffic hazards near the intersection. Multiple vehicles have been damaged.',
    location: 'MG Road, Ranchi',
    category: 'Roads & Transport',
    priority: 'High',
    status: 'In Progress',
    timestamp: '2 hours ago',
    supports: 24,
    comments: 8,
  },
  {
    id: '2',
    user: 'Priya Singh',
    avatar: 'PS',
    title: 'Street Light Malfunction',
    description: 'Street light has been out for 3 days, creating safety concerns in the evening.',
    location: 'Sector 5, Bokaro',
    category: 'Electricity',
    priority: 'Medium',
    status: 'Under Review',
    timestamp: '5 hours ago',
    supports: 12,
    comments: 3,
  },
  {
    id: '3',
    user: 'Amit Sharma',
    avatar: 'AS',
    title: 'Overflowing Garbage Bin',
    description: 'Garbage bin near the park has not been emptied for a week. Creating health hazards.',
    location: 'City Park, Dhanbad',
    category: 'Sanitation',
    priority: 'High',
    status: 'Submitted',
    timestamp: '1 day ago',
    supports: 31,
    comments: 15,
  },
];

export default function Social() {
  const [activeTab, setActiveTab] = useState('all');
  const [posts] = useState<Post[]>(mockPosts);

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

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user}</Text>
            <Text style={styles.postTime}>{item.timestamp}</Text>
          </View>
        </View>
        <View style={styles.postMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postDescription}>{item.description}</Text>

      <View style={styles.postFooter}>
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={14} color="#666666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#666666" />
          <Text style={styles.actionText}>{item.supports} Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666666" />
          <Text style={styles.actionText}>{item.comments} Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#666666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Community Hub</Text>
          <Text style={styles.headerSubtitle}>Connect, Report, Resolve Together</Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>247</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Active Issues</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>158</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Community</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
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
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
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
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
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
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
            onPress={() => setActiveTab('nearby')}
          >
            <Ionicons
              name="location"
              size={20}
              color={activeTab === 'nearby' ? '#FFFFFF' : '#666666'}
            />
            <Text style={[styles.tabText, activeTab === 'nearby' && styles.activeTabText]}>
              Nearby
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="add-circle" size={32} color="#FF6B35" />
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="map" size={32} color="#FF6B35" />
            <Text style={styles.quickActionText}>View Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="stats-chart" size={32} color="#FF6B35" />
            <Text style={styles.quickActionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Feed */}
        <View style={styles.feedContainer}>
          <Text style={styles.sectionTitle}>Recent Community Reports</Text>
          <Text style={styles.sectionSubtitle}>Stay updated with local issues and community progress</Text>

          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  postTime: {
    fontSize: 12,
    color: '#999999',
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    lineHeight: 22,
  },
  postDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
    fontWeight: '500',
  },
});
