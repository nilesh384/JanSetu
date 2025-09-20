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

import { useAuth } from '@/src/context/AuthContext';
import { deleteUser } from '@/src/api/user';
import UniversalHeader from '@/src/components/UniversalHeader';
import { useTranslation } from 'react-i18next';

interface AdvancedSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  danger?: boolean;
}

export default function Advanced() {

  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [settings, setSettings] = useState<AdvancedSetting[]>([
    {
      id: 'debug_mode',
      title: 'Debug Mode',
      description: 'Enable detailed logging for troubleshooting',
      enabled: false,
    },
    {
      id: 'beta_features',
      title: 'Beta Features',
      description: 'Try new features before they are released',
      enabled: false,
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed usage statistics and insights',
      enabled: true,
    },
    {
      id: 'offline_mode',
      title: 'Offline Mode',
      description: 'Cache data for offline access',
      enabled: true,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t('profile.clearCache'),
      t('profile.clearCacheMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.clearCache'),
          onPress: () => Alert.alert(t('profile.success'), t('profile.cacheCleared'))
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      t('profile.resetSettings'),
      t('profile.resetSettingsMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.resetSettings'),
          style: 'destructive',
          onPress: () => {
            setSettings(prev => prev.map(setting => ({ ...setting, enabled: false })));
            Alert.alert(t('profile.success'), t('profile.settingsReset'));
          }
        },
      ]
    );
  };

  const handleExportLogs = () => {
    Alert.alert(
      t('profile.exportLogs'),
      t('profile.exportLogsMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.exportLogs'),
          onPress: () => Alert.alert(t('profile.success'), t('profile.logsExported'))
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            // Call API to delete account using phoneNumber
            if (!user?.phoneNumber) {
              Alert.alert(t('profile.error'), t('profile.phoneNotFound'));
              return;
            }

            deleteUser(user.phoneNumber).then((result) => {
              if (result.success) {
                // First logout the user to clear local data
                logout();
                Alert.alert(t('profile.accountDeleted'), t('profile.accountDeletedMessage'));
                router.replace('/auth/phone' as any);
              } else {
                Alert.alert(t('profile.error'), result.message || t('profile.deleteAccountFailed'));
              }
            }).catch((error) => {
              console.error('Delete account error:', error);
              Alert.alert(t('profile.error'), t('profile.deleteAccountFailed'));
            });
          }
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert('Success', 'Advanced settings updated successfully!');
    router.back();
  };

  const advancedActions = [
    {
      id: 'clear_cache',
      title: 'Clear Cache',
      subtitle: 'Free up storage space',
      icon: 'trash-outline',
      action: handleClearCache,
      color: '#FF6B35',
    },
    {
      id: 'reset_settings',
      title: 'Reset Settings',
      subtitle: 'Restore default settings',
      icon: 'refresh',
      action: handleResetSettings,
      color: '#FF8800',
    },
    {
      id: 'export_logs',
      title: 'Export Debug Logs',
      subtitle: 'Help us troubleshoot issues',
      icon: 'document-text',
      action: handleExportLogs,
      color: '#666666',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <UniversalHeader title={t('profile.advancedSettings')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* <View style={styles.warningSection}>
          <View style={styles.warningItem}>
            <Ionicons name="warning" size={20} color="#FF8800" />
            <Text style={styles.warningText}>
              These settings are for advanced users. Changing them may affect app performance.
            </Text>
          </View>
        </View> */}

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Options</Text>

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
        </View> */}

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance</Text>

          {advancedActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={action.action}
              activeOpacity={0.8}
            >
              <View style={styles.actionLeft}>
                <Ionicons name={action.icon as any} size={20} color={action.color} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.accountManagement')}</Text>
          <Text style={styles.dangerDescription}>
            {t('profile.irreversibleActions')}
          </Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Ionicons name="person-remove" size={20} color="#F44336" />
            <View style={styles.dangerText}>
              <Text style={styles.dangerTitle}>{t('profile.deleteAccount')}</Text>
              <Text style={styles.dangerSubtitle}>{t('profile.permanentlyDelete')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Need help with these settings? Contact our support team.
            </Text>
          </View>
        </View> */}

        
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
  warningSection: {
    marginBottom: 24,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    lineHeight: 18,
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
  dangerDescription: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 16,
    fontStyle: 'italic',
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
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  dangerText: {
    flex: 1,
    marginLeft: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
    marginBottom: 2,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#F44336',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
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
