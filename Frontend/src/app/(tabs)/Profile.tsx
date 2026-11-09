import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { uploadProfileImage } from '../../api/user.js';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows, Spacing, Typography } from '@/src/styles/designSystem';

interface ProfileOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  iconType: 'Ionicons' | 'MaterialIcons';
  onPress: () => void;
}

export default function Profile() {
  const { user, logout, refreshUser, isLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [zoom, setZoom] = useState(0);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setZoom(0);
      setCameraModalVisible(true);
    } else {
      Alert.alert(t('profile.error') || 'Error', t('profile.cameraPermissionNeeded') || 'Camera permission required');
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    if (!user?.id) {
      Alert.alert(t('profile.error') || 'Error', t('profile.userNotFound') || 'User not found');
      return;
    }

    setIsUpdatingImage(true);
    try {
      const result = (await uploadProfileImage(user.id, imageUri)) as any;
      if (result.success) {
        await refreshUser();
        Alert.alert(t('profile.success') || 'Success', t('profile.profileImageUpdated') || 'Profile image updated');
      } else {
        Alert.alert(t('profile.error') || 'Error', result.message || 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert(t('profile.error') || 'Error', 'Failed to upload profile picture');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCameraModalVisible(false);
        if (photo?.uri) {
          await updateProfileImage(photo.uri);
        }
      } catch (error) {
        Alert.alert(t('profile.error') || 'Error', 'Failed to take photo');
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on': return 'flash';
      case 'auto': return 'flash-outline';
      default: return 'flash-off';
    }
  };

  const zoomIn = () => setZoom((c) => Math.min(c + 0.1, 1));
  const zoomOut = () => setZoom((c) => Math.max(c - 0.1, 0));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('profile.permissionNeeded') || 'Gallery permission needed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await updateProfileImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option to update your photo',
      [
        {
          text: '📸 Take Photo',
          onPress: () => {
            ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            }).then((result) => {
              if (!result.canceled && result.assets?.[0]?.uri) {
                updateProfileImage(result.assets[0].uri);
              }
            }).catch(() => {
              Alert.alert('Error', 'Could not open camera');
            });
          },
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: pickImage,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Name, email, and phone verification',
      icon: 'person-outline',
      iconBg: '#FFF7ED',
      iconColor: Colors.primary,
      iconType: 'Ionicons',
      onPress: () => router.push('/profileSettings/personal'),
    },
    {
      id: 'biometric',
      title: 'Biometric Security',
      subtitle: Platform.OS === 'android' ? 'Fingerprint login & security' : 'Face ID & Biometrics',
      icon: 'finger-print-outline',
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
      iconType: 'Ionicons',
      onPress: () => router.push('/profileSettings/biometric'),
    },
    {
      id: 'help',
      title: 'Citizen Help & Grievance FAQ',
      subtitle: 'Guide to filing & tracking complaints',
      icon: 'help-buoy-outline',
      iconBg: '#FAF5FF',
      iconColor: '#7C3AED',
      iconType: 'Ionicons',
      onPress: () => router.push('/profileSettings/help'),
    },
    {
      id: 'about',
      title: 'About JanSetu',
      subtitle: 'App version, terms, privacy & mission',
      icon: 'information-circle-outline',
      iconBg: '#ECFDF5',
      iconColor: Colors.successDark,
      iconType: 'Ionicons',
      onPress: () => router.push('/profileSettings/about'),
    },
    {
      id: 'advanced',
      title: 'Preferences & Cache',
      subtitle: 'Offline data, notifications & storage',
      icon: 'settings-outline',
      iconBg: '#F1F5F9',
      iconColor: '#475569',
      iconType: 'Ionicons',
      onPress: () => router.push('/profileSettings/advanced'),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout') || 'Log Out',
      t('profile.logoutConfirm') || 'Are you sure you want to log out of JanSetu?',
      [
        { text: t('profile.cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('profile.confirmLogout') || 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/phone' as any);
            } catch (error) {
              Alert.alert('Error', 'Failed to log out');
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" backgroundColor="#F8FAFC" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" backgroundColor="#F8FAFC" />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Sign in to view your citizen profile</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace('/auth/phone' as any)}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reportsSubmitted = user?.totalReports || 0;
  const reportsResolved = user?.resolvedReports || 0;
  const civicScore = Math.max(10, reportsSubmitted * 15 + reportsResolved * 35);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#F8FAFC" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileGlow} />

          {/* Citizen Verification Badge */}
          <View style={styles.citizenBadgeRow}>
            <View style={styles.citizenBadge}>
              <Ionicons name="shield-checkmark" size={13} color={Colors.primaryDark} />
              <Text style={styles.citizenBadgeText}>Verified Citizen • JanSetu</Text>
            </View>
          </View>

          {/* Avatar Container */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarBorder}>
              {user?.profileImageUrl ? (
                <Image 
                  source={{ uri: user.profileImageUrl }} 
                  style={styles.avatarImg}
                />
              ) : (
                <Ionicons name="person" size={44} color={Colors.primary} />
              )}
              {isUpdatingImage && (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.editCameraButton} 
              onPress={showImageOptions}
              disabled={isUpdatingImage}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Details */}
          <Text style={styles.nameText}>{user?.fullName || 'Citizen User'}</Text>
          <Text style={styles.phoneText}>{user?.phoneNumber || '+91 • Registered Phone'}</Text>
          {user?.email ? <Text style={styles.emailText}>{user.email}</Text> : null}
        </View>

        {/* Civic Statistics */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{reportsSubmitted}</Text>
            <Text style={styles.statLabel}>Grievances</Text>
            <Text style={styles.statSub}>Submitted</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: Colors.successDark }]}>{reportsResolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={styles.statSub}>Closed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#0284C7' }]}>{civicScore}</Text>
            <Text style={styles.statLabel}>Civic Score</Text>
            <Text style={styles.statSub}>Impact Pts</Text>
          </View>
        </View>

        {/* Settings Group */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionHeaderTitle}>Account & Settings</Text>
          <View style={styles.optionsCard}>
            {profileOptions.map((opt, index) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionRow,
                  index < profileOptions.length - 1 && styles.optionRowBorder,
                ]}
                onPress={opt.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconBox, { backgroundColor: opt.iconBg }]}>
                  <Ionicons name={opt.icon as any} size={20} color={opt.iconColor} />
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Action */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.dangerDark} />
            <Text style={styles.logoutButtonText}>Log Out from JanSetu</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerVersion}>JanSetu Citizen App • v1.0.0 (SIH Edition)</Text>
          <Text style={styles.footerNotice}>Empowering transparent governance & community collaboration.</Text>
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={cameraModalVisible}
        animationType="slide"
        onRequestClose={() => setCameraModalVisible(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            flash={flashMode}
            zoom={zoom}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setCameraModalVisible(false)}
                >
                  <Ionicons name="close" size={26} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                  <Ionicons name={getFlashIcon() as any} size={22} color="#FFFFFF" />
                  <Text style={styles.controlText}>Flash</Text>
                </TouchableOpacity>

                <View style={styles.zoomContainer}>
                  <TouchableOpacity style={styles.zoomButton} onPress={zoomOut} disabled={zoom <= 0}>
                    <Ionicons name="remove" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
                  <TouchableOpacity style={styles.zoomButton} onPress={zoomIn} disabled={zoom >= 1}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
                  <Ionicons name="camera-reverse" size={22} color="#FFFFFF" />
                  <Text style={styles.controlText}>Flip</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cameraFooter}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 95,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.pill,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radii.large,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.card,
  },
  profileGlow: {
    position: 'absolute',
    top: -50,
    width: 200,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  citizenBadgeRow: {
    marginBottom: Spacing.md,
  },
  citizenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  citizenBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF7ED',
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.soft,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  statSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  optionsSection: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionHeaderTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.soft,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  logoutSection: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: Radii.card,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dangerDark,
  },
  footerWrap: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 3,
  },
  footerNotice: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: 50,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  zoomButton: {
    padding: 4,
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraFooter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});
