# Biometric Authentication Implementation

This document explains the biometric authentication feature implemented in the JanSetu app.

## Features Implemented

### 1. **App-level Biometric Lock**
- When the app starts and the user has a valid session, they will be prompted for biometric authentication
- If authentication fails, the user session is cleared and they're redirected to login

### 2. **Auto-login with Biometrics**
- If the user has no active session but has previously enabled biometrics, they can use fingerprint/Face ID to automatically log in
- Fallback to mobile number login is available if biometric authentication fails

### 3. **Biometric Settings Management**
- Users can enable/disable biometric authentication from Profile → Biometric Security
- Test biometric authentication functionality
- View biometric capability information

### 4. **Onboarding Experience**
- After successful login, users are prompted once to enable biometric authentication
- Users can skip this and enable it later from settings

## Files Added/Modified

### Core Files:
- `src/utils/biometrics.ts` - Biometric utility functions
- `src/context/AuthContext.tsx` - Enhanced with biometric authentication logic
- `src/components/BiometricSettings.tsx` - Settings screen for biometric management
- `src/components/BiometricPrompt.tsx` - Modal for biometric authentication
- `src/components/BiometricOnboarding.tsx` - First-time setup modal
- `src/utils/useBiometricOnboarding.ts` - Hook for managing onboarding state

### Updated Files:
- `app.json` - Added biometric permissions
- `src/app/(tabs)/Profile.tsx` - Added biometric settings option
- `src/app/(tabs)/Home.tsx` - Added biometric onboarding
- `src/app/profileSettings/biometric.tsx` - New settings screen
- `src/components/AuthWrapper.tsx` - Enhanced authentication flow

## How It Works

### 1. **App Launch Flow**
```
App Start → AuthContext.checkAuthStatus() → Check if user has session
├─ If session exists + biometrics enabled → Prompt for biometric auth
├─ If no session + biometrics enabled → Prompt for auto-login
└─ Otherwise → Normal flow
```

### 2. **Login Flow**
```
OTP Verification → Login Success → Store user data
└─ Show biometric onboarding (if supported and not shown before)
```

### 3. **Biometric Enable Flow**
```
User goes to Profile → Biometric Security → Toggle ON
└─ Test biometric auth → Save preference → Done
```

## Storage Keys Used

- `@crowdsource_biometric_enabled` - Whether biometric is enabled for the user
- `@crowdsource_last_logged_user` - Minimal user data for auto-login
- `@biometric_onboarding_shown_{userId}` - Whether onboarding was shown to this user

## User Experience

### First Time User:
1. User logs in with mobile number + OTP
2. App shows biometric onboarding modal (if device supports it)
3. User can enable biometrics or skip

### Returning User (Biometrics Enabled):
1. App opens and prompts for biometric authentication
2. Success → User is logged in automatically
3. Failure → Session cleared, redirected to login

### Settings Management:
1. User goes to Profile → Biometric Security
2. Can toggle biometric authentication on/off
3. Can test biometric functionality
4. See device capability information

## Error Handling

- **No biometric hardware**: Settings screen shows unavailable message
- **No biometric enrolled**: Settings screen shows setup instruction
- **Authentication fails**: Graceful fallback to mobile login
- **Permission denied**: Falls back to normal login flow

## Security Considerations

- Biometric data never leaves the device
- Only minimal user data stored for auto-login (ID, phone, name, email)
- Session expiry still applies (30 days)
- Users can always disable biometrics and use mobile login

## Testing

To test the implementation:

1. **Enable biometrics in device settings** (fingerprint/Face ID)
2. **Run the app** and login with mobile number
3. **Accept biometric onboarding** when prompted
4. **Close and reopen app** - should prompt for biometric auth
5. **Go to Profile → Biometric Security** to test settings

## Future Enhancements

- Biometric authentication for sensitive actions within the app
- Multiple biometric enrollment support
- Biometric authentication analytics
- Enhanced security with app background lock