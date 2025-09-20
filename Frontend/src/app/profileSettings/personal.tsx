import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';

import { useAuth } from '@/src/context/AuthContext';
import { updateUserProfile } from '@/src/api/user';
import UniversalHeader from '@/src/components/UniversalHeader';
import { useTranslation } from 'react-i18next';

export default function PersonalInfo() {
    const { user, logout, refreshUser } = useAuth();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
    });

    console.log('Current user:', user);

    // Initialize form data when user data is available
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user?.id) {
            Alert.alert(t('profile.error'), t('profile.userNotFound'));
            return;
        }

        // Validate required fields
        if (!formData.fullName.trim()) {
            Alert.alert(t('profile.validationError'), t('profile.enterFullNameError'));
            return;
        }

        if (!formData.email.trim()) {
            Alert.alert(t('profile.validationError'), t('profile.enterEmailError'));
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert(t('profile.validationError'), t('profile.invalidEmailError'));
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔄 Updating user profile...');
            const result = await updateUserProfile(user.id, {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                profileImageUrl: user.profileImageUrl // Keep existing profile image
            }) as any;

            if (result.success) {
                // Refresh user data in context
                await refreshUser();
                Alert.alert(t('profile.success'), t('profile.profileUpdated'));
                router.back();
            } else {
                Alert.alert(t('profile.error'), result.message || t('profile.updateProfileError'));
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            Alert.alert(t('profile.error'), t('profile.connectionError'));
        } finally {
            setIsLoading(false);
        }
    };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <UniversalHeader title={t('profile.personalInformation')} showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          {t('profile.updatePersonalDetails')}
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{t('profile.basicInformation')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder={t('profile.enterFullName')}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.emailAddress')}</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder={t('profile.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.phoneNumber')}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.phoneNumber}
              placeholder={t('profile.phonePlaceholder')}
              keyboardType="phone-pad"
              editable={false}
            />
            <Text style={styles.inputNote}>
              {t('profile.phoneSecurityNote')}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{t('profile.saving')}</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>{t('profile.cancel')}</Text>
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
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999999',
  },
  inputNote: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  saveButtonDisabled: {
    backgroundColor: '#FFAB8A',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
