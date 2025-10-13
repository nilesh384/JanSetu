import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://81cq2mbl-4000.inc1.devtunnels.ms'; // Replace with your backend URL

// Save FCM token to server
export const saveFCMToken = async (fcmToken, platform) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken,
        platform,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

// Update FCM token for a specific user
export const updateUserFCMToken = async (userId, fcmToken, platform) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/update-fcm-token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fcmToken,
        platform,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating FCM token for user:', error);
    throw error;
  }
};

// Send notification when report is resolved
export const sendReportResolvedNotification = async (userId, reportId, reportTitle) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/report-resolved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        reportId,
        reportTitle,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending report resolved notification:', error);
    throw error;
  }
};