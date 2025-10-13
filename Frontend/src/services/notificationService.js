import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveFCMToken, updateUserFCMToken } from '../api/notifications';
import { router } from 'expo-router';

class NotificationService {
  constructor() {
    this.fcmToken = null;
  }

  // Request permission and get FCM token
  async initialize() {
    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted:', authStatus);
        
        // Get FCM token
        const fcmToken = await messaging().getToken();
        this.fcmToken = fcmToken;
        console.log('FCM Token:', fcmToken);
        
        // Store token locally
        await AsyncStorage.setItem('fcmToken', fcmToken);
        
        // Send token to your backend
        await this.sendTokenToServer(fcmToken);
        
        // Set up message handlers
        this.setupMessageHandlers();
        
        return fcmToken;
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  // Send FCM token to your backend server
  async sendTokenToServer(token) {
    try {
      const result = await saveFCMToken(token, Platform.OS);
      if (result.success) {
        console.log('FCM token sent to server successfully');
      } else {
        console.error('Failed to send FCM token to server:', result.message);
      }
    } catch (error) {
      console.error('Error sending FCM token to server:', error);
    }
  }

  // Set up message handlers
  setupMessageHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in foreground!', remoteMessage);
      
      // Show alert for foreground messages
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || 'You have a new notification',
          [
            {
              text: 'OK',
              onPress: () => {
                // Handle notification tap if needed
                if (remoteMessage.data) {
                  this.handleNotificationData(remoteMessage.data);
                }
              }
            }
          ]
        );
      }
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      
      if (remoteMessage.data) {
        this.handleNotificationData(remoteMessage.data);
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
          
          if (remoteMessage.data) {
            this.handleNotificationData(remoteMessage.data);
          }
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh(async token => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      await AsyncStorage.setItem('fcmToken', token);
      await this.sendTokenToServer(token);
    });
  }

  // Handle notification data and navigate accordingly
  handleNotificationData(data) {
    console.log('Handling notification data:', data);
    
    // Handle different notification types
    switch (data.type) {
      case 'report_resolved':
        // Navigate to report details
        console.log('Report resolved notification:', data.reportId);
        if (data.reportId) {
          router.push(`/reportDetails?id=${data.reportId}`);
        }
        break;
      case 'report_update':
        console.log('Report update notification:', data.reportId);
        if (data.reportId) {
          router.push(`/reportDetails?id=${data.reportId}`);
        }
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  // Get stored FCM token
  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem('fcmToken');
      return token;
    } catch (error) {
      console.error('Error getting stored FCM token:', error);
      return null;
    }
  }

  // Update user's FCM token on server (call when user logs in)
  async updateTokenForUser(userId) {
    const token = await this.getStoredToken() || this.fcmToken;
    if (token && userId) {
      try {
        const result = await updateUserFCMToken(userId, token, Platform.OS);
        if (result.success) {
          console.log('FCM token updated for user successfully');
        } else {
          console.error('Failed to update FCM token for user:', result.message);
        }
      } catch (error) {
        console.error('Error updating FCM token for user:', error);
      }
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;