# JanSetu User App

This is the citizen-facing mobile app for JanSetu. It lets users sign in, file complaints, attach media, track status, chat with support helpers, and manage their profile settings.

## Main Features

- Phone and OTP authentication
- Complaint creation with categories, media, and location support
- Nearby complaints and my reports views
- Report detail and status tracking
- Profile setup and profile settings screens
- Biometric onboarding and biometric prompt support
- In-app chatbot access
- Push notification and offline storage helpers

## Tech Stack

- Expo React Native
- TypeScript
- Expo Router
- Axios
- Firebase Messaging
- AsyncStorage and custom offline storage
- i18next for localization
- React Native WebView for embedded experiences
- Expo AV, Camera, Image Picker, and Location

## Route Layout

- `src/app/(tabs)/` - home, complaints, social, profile, and post flows
- `src/app/auth/` - phone number, OTP, and profile setup screens
- `src/app/complaints/` - nearby and my complaint lists
- `src/app/profileSettings/` - personal, privacy, notifications, biometric, help, and about screens
- `src/app/chatbot.tsx` - chatbot entry point
- `src/app/reportDetails.tsx` - complaint details screen

## Supporting Components

- `src/components/` - auth wrappers, headers, prompts, chatbot button, and reusable UI pieces
- `src/api/` - request helpers for user, complaint, OTP, notification, media, chat, and social APIs
- `src/services/` - notification and offline storage services
- `src/context/` - auth state
- `src/utils/` - biometric and date helpers

## Scripts

```bash
npm install
npx expo start
npm run android
npm run ios
npm run web
npm run lint
```

## Notes

- Set the backend API URL and Firebase configuration before running the app
- Use the biometric documentation in `BIOMETRIC_AUTHENTICATION.md` for setup details
