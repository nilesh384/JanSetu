import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricSupport {
  isSupported: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export const checkBiometricSupport = async (): Promise<BiometricSupport> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      isSupported: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      supportedTypes
    };
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return { 
      isSupported: false, 
      hasHardware: false, 
      isEnrolled: false, 
      supportedTypes: [] 
    };
  }
};

export const promptBiometricAuth = async (
  reason: string = 'Authenticate to access JanSetu'
): Promise<BiometricAuthResult> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use mobile number instead',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });
    
    return {
      success: result.success,
      error: result.success ? undefined : 'Authentication failed'
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
};

export const getBiometricType = async (): Promise<string> => {
  try {
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return 'Biometric';
  }
};

export const isDeviceSecure = async (): Promise<boolean> => {
  try {
    return await LocalAuthentication.isEnrolledAsync();
  } catch (error) {
    console.error('Error checking device security:', error);
    return false;
  }
};