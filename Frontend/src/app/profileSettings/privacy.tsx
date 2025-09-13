import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function PrivacySecurity() {
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Make your profile visible to other users',
      enabled: true,
    },
    {
      id: 'location_sharing',
      title: 'Location Sharing',
      description: 'Share your location with reported issues',
      enabled: false,
    },
    {
      id: 'data_collection',
      title: 'Data Collection',
      description: 'Allow collection of usage data for improvements',
      enabled: true,
    },
    {
      id: 'third_party_sharing',
      title: 'Third-party Sharing',
      description: 'Share data with trusted partners',
      enabled: false,
    },
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    biometric_auth: false,
    two_factor_auth: false,
    auto_lock: true,
  });

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const toggleSecuritySetting = (key: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Enter your current password and new password',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => Alert.alert('Success', 'Password changed successfully!')
        },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported and sent to your email',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => Alert.alert('Success', 'Data export request submitted!')
        },
      ]
    );
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Request Submitted', 'Data deletion request has been submitted.')
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert('Success', 'Privacy and security settings updated successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Control your privacy settings and manage your account security
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          {settings.map((setting) => (
            <View key={setting.id} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
                thumbColor={setting.enabled ? '#FFFFFF' : '#F5F5F5'}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>Use fingerprint or face ID to unlock</Text>
            </View>
            <Switch
              value={securitySettings.biometric_auth}
              onValueChange={() => toggleSecuritySetting('biometric_auth')}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
              thumbColor={securitySettings.biometric_auth ? '#FFFFFF' : '#F5F5F5'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>Add an extra layer of security</Text>
            </View>
            <Switch
              value={securitySettings.two_factor_auth}
              onValueChange={() => toggleSecuritySetting('two_factor_auth')}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
              thumbColor={securitySettings.two_factor_auth ? '#FFFFFF' : '#F5F5F5'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto-Lock</Text>
              <Text style={styles.settingDescription}>Automatically lock app after inactivity</Text>
            </View>
            <Switch
              value={securitySettings.auto_lock}
              onValueChange={() => toggleSecuritySetting('auto_lock')}
              trackColor={{ false: '#E0E0E0', true: '#FF6B35' }}
              thumbColor={securitySettings.auto_lock ? '#FFFFFF' : '#F5F5F5'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleChangePassword}
            activeOpacity={0.8}
          >
            <Ionicons name="key" size={20} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDataExport}
            activeOpacity={0.8}
          >
            <Ionicons name="download" size={20} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDataDeletion}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color="#F44336" />
            <Text style={styles.dangerButtonText}>Delete My Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>
              Your data is encrypted and securely stored
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  dangerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#F44336',
    marginLeft: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});
