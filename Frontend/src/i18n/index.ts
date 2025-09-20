import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

// Simple language detection for Expo (fallback to English)
const getDeviceLanguage = () => {
  // For Expo, we'll default to English and let users change it
  // You can enhance this later with better device language detection
  return 'en';
};

// Get stored language or fallback to device language
const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    return storedLanguage || getDeviceLanguage();
  } catch {
    return getDeviceLanguage();
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Will be updated after async check
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Set initial language asynchronously
getInitialLanguage().then((language) => {
  console.log('Setting initial language to:', language);
  i18n.changeLanguage(language);
});

export default i18n;