import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radii, Shadows } from '../src/styles/designSystem';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const changeLanguage = async (languageCode: string) => {
    try {
      await AsyncStorage.setItem('userLanguage', languageCode);
      await i18n.changeLanguage(languageCode);
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
          currentLanguage.startsWith('en') && styles.activeButton
        ]}
        onPress={() => changeLanguage('en')}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.buttonText,
          currentLanguage.startsWith('en') && styles.activeButtonText
        ]}>
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          currentLanguage.startsWith('hi') && styles.activeButton
        ]}
        onPress={() => changeLanguage('hi')}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.buttonText,
          currentLanguage.startsWith('hi') && styles.activeButtonText
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
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.soft,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});

export default LanguageSwitcher;
