import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  console.log('Current language:', currentLanguage);
  console.log('Available languages:', i18n.languages);

  const changeLanguage = async (languageCode: string) => {
    try {
      console.log('=== Language Change Started ===');
      console.log('Target language:', languageCode);
      console.log('Current language before change:', i18n.language);

      await AsyncStorage.setItem('userLanguage', languageCode);
      console.log('Language saved to AsyncStorage');

      await i18n.changeLanguage(languageCode);
      console.log('i18n.changeLanguage called');
      console.log('Current language after change:', i18n.language);

      // Force re-render by updating state
      setTimeout(() => {
        console.log('Language change completed. Current language:', i18n.language);
      }, 100);
    } catch (error) {
      console.error('Failed to change language:', error);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          currentLanguage === 'en' && styles.activeButton
        ]}
        onPress={() => {
          console.log('EN button pressed');
          changeLanguage('en');
        }}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.buttonText,
          currentLanguage === 'en' && styles.activeButtonText
        ]}>
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          currentLanguage === 'hi' && styles.activeButton
        ]}
        onPress={() => {
          console.log('Hindi button pressed');
          changeLanguage('hi');
        }}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.buttonText,
          currentLanguage === 'hi' && styles.activeButtonText
        ]}>
          हिंदी
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
    minWidth: 50,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF6B35',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});

export default LanguageSwitcher;