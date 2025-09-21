import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import UniversalHeader from '@/src/components/UniversalHeader';
import { getUserById } from '@/src/api/user';

interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  profileImageUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export default function UserDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: any = await getUserById(userId);

      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.message || 'Failed to fetch user details');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const maskPhoneNumber = (phoneNumber: string) => {
    // Assuming format: +91XXXXXXXXXX
    if (phoneNumber.length < 10) return phoneNumber;
    const countryCode = phoneNumber.slice(0, 3); // +91
    const lastDigits = phoneNumber.slice(-3); // last 3 digits
    const maskedLength = phoneNumber.length - 6; // total length minus country code and last 3 digits
    const masked = '*'.repeat(maskedLength);
    return `${countryCode}${masked}${lastDigits}`;
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;

    const firstChar = localPart.charAt(0);
    const lastChar = localPart.charAt(localPart.length - 1);
    const maskedLength = localPart.length - 2;
    const masked = '*'.repeat(maskedLength);

    return `${firstChar}${masked}${lastChar}@${domain}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <UniversalHeader title="User Details" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <UniversalHeader title="User Details" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B35" />
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <UniversalHeader title="User Details" showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.profileImageUrl ? (
              <Image source={{ uri: user.profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userFullName}>{user.fullName}</Text>
            <View style={styles.actionButtons}>
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.reportButton]}
                  onPress={() => Alert.alert('Report User', 'Are you sure you want to report this user?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'User has been reported successfully.') }
                  ])}
                >
                  <Ionicons name="warning" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.actionButtonText}>Report</Text>
              </View>
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={() => Alert.alert('Message User', 'Messaging feature coming soon!')}
                >
                  <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.actionButtonText}>Message</Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.detailRow}>
            <Ionicons name="call" size={20} color="#666666" />
            <Text style={styles.detailText}>{maskPhoneNumber(user.phoneNumber)}</Text>
          </View>

          {user.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color="#666666" />
              <Text style={styles.detailText}>{maskEmail(user.email)}</Text>
            </View>
          )}
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#666666" />
            <Text style={styles.detailText}>Joined: {formatDate(user.createdAt)}</Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionButtonContainer: {
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#FF6B35',
  },
  messageButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000ff',
    textAlign: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userFullName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  },
});