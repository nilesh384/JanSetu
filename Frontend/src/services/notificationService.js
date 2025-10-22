import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveFCMToken, updateUserFCMToken } from '../api/notifications';
import { router } from 'expo-router';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.pendingNavigation = null;
    this.navigationQueue = [];
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
      console.log('🔔 Push notification opened app from background:', remoteMessage);
      console.log('📊 Notification data:', remoteMessage.data);
      
      if (remoteMessage.data && remoteMessage.data.reportId) {
        // Create deep link URL
        const deepLinkUrl = `jansetu://reportDetails?id=${remoteMessage.data.reportId}&t=${Date.now()}`;
        console.log('🔗 Opening deep link from background:', deepLinkUrl);
        
        // Use Linking to open the deep link
        setTimeout(async () => {
          try {
            await Linking.openURL(deepLinkUrl);
            console.log('✅ Deep link opened successfully from background');
          } catch (error) {
            console.error('❌ Deep link failed from background:', error);
            // Fallback to notification handler
            this.handleNotificationData(remoteMessage.data);
          }
        }, 500);
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🔔 Push notification opened app from quit state:', remoteMessage);
          console.log('📊 Initial notification data:', remoteMessage.data);
          
          if (remoteMessage.data && remoteMessage.data.reportId) {
            // Create deep link URL for initial notification
            const deepLinkUrl = `jansetu://reportDetails?id=${remoteMessage.data.reportId}&t=${Date.now()}`;
            console.log('🔗 Opening deep link from quit state:', deepLinkUrl);
            
            // Store for processing after app initialization
            this.storeNotificationData({
              ...remoteMessage.data,
              deepLinkUrl,
              source: 'initial_notification'
            });
            
            // Use Linking to open the deep link with longer delay
            setTimeout(async () => {
              try {
                await Linking.openURL(deepLinkUrl);
                console.log('✅ Deep link opened successfully from quit state');
              } catch (error) {
                console.error('❌ Deep link failed from quit state:', error);
                // Fallback to notification handler
                this.handleNotificationData(remoteMessage.data);
              }
            }, 2000);
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

  // Handle notification data using deep linking approach
  handleNotificationData(data) {
    console.log('📱 Handling notification data with deep linking:', data);
    
    // Store in AsyncStorage for app restart scenarios
    this.storeNotificationData(data);
    
    // Handle different notification types
    switch (data.type) {
      case 'report_resolved':
      case 'report_update':
        console.log(`📱 ${data.type} notification for report:`, data.reportId);
        if (data.reportId) {
          this.navigateUsingDeepLink(data.reportId);
        }
        break;
      default:
        console.log('❓ Unknown notification type:', data.type);
    }
  }

  // Store notification data for later processing
  async storeNotificationData(data) {
    try {
      await AsyncStorage.setItem('lastNotificationData', JSON.stringify({
        ...data,
        timestamp: Date.now(),
        processed: false
      }));
      console.log('💾 Notification data stored for processing');
    } catch (error) {
      console.error('❌ Error storing notification data:', error);
    }
  }

  // Navigate using deep linking
  async navigateUsingDeepLink(reportId) {
    console.log('🔗 Attempting deep link navigation to report:', reportId);
    
    const timestamp = Date.now();
    const deepLinkUrl = `jansetu://reportDetails?id=${reportId}&t=${timestamp}`;
    
    try {
      console.log('🔗 Opening deep link:', deepLinkUrl);
      
      // Always try to open the deep link
      await Linking.openURL(deepLinkUrl);
      console.log('✅ Deep link navigation successful');
      
      // Mark as processed
      await AsyncStorage.setItem('lastNotificationData', JSON.stringify({
        reportId,
        timestamp,
        processed: true
      }));
      
    } catch (error) {
      console.warn('⚠️ Deep link failed, trying router fallback:', error);
      
      // Method 2: Fallback to router navigation with delay
      this.fallbackRouterNavigation(reportId, timestamp);
    }
  }

  // Fallback router navigation
  fallbackRouterNavigation(reportId, timestamp) {
    console.log('🔄 Using router fallback navigation');
    
    // Use multiple delays to handle different app states
    const delays = [500, 1500, 3000];
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        console.log(`🔄 Router attempt ${index + 1} after ${delay}ms delay`);
        this.attemptRouterNavigation(reportId, timestamp);
      }, delay);
    });
  }

  // Attempt router navigation
  attemptRouterNavigation(reportId, timestamp) {
    if (!router) {
      console.warn('⚠️ Router not available yet');
      return;
    }

    try {
      // Try the most reliable method first
      router.push({
        pathname: '/reportDetails',
        params: { id: reportId, t: timestamp }
      });
      console.log('✅ Router navigation successful');
      
      // Mark as processed
      AsyncStorage.setItem('lastNotificationData', JSON.stringify({
        reportId,
        timestamp,
        processed: true
      }));
      
    } catch (error) {
      console.error('❌ Router navigation failed:', error);
      
      // Store for retry when app is ready
      this.navigationQueue.push({ reportId, timestamp });
    }
  }

  // Process any pending notifications (call this when app is fully loaded)
  async processPendingNotifications() {
    try {
      const stored = await AsyncStorage.getItem('lastNotificationData');
      if (stored) {
        const data = JSON.parse(stored);
        if (!data.processed && Date.now() - data.timestamp < 300000) { // 5 minutes
          console.log('� Processing pending notification:', data);
          
          if (data.reportId) {
            this.attemptRouterNavigation(data.reportId, Date.now());
          }
        }
      }
      
      // Process navigation queue
      while (this.navigationQueue.length > 0) {
        const item = this.navigationQueue.shift();
        console.log('� Processing queued navigation:', item);
        this.attemptRouterNavigation(item.reportId, item.timestamp);
      }
      
    } catch (error) {
      console.error('❌ Error processing pending notifications:', error);
    }
  }

  // Method to retry pending navigation (call this when app is fully loaded)
  retryPendingNavigation() {
    if (this.pendingNavigation && Date.now() - this.pendingNavigation.timestamp < 60000) {
      const { reportId, retryCount = 0, source } = this.pendingNavigation;
      
      if (retryCount < 5) {
        console.log(`🔄 Retrying pending navigation (attempt ${retryCount + 1}):`, reportId);
        console.log(`📍 Original source: ${source || 'unknown'}`);
        
        this.handleNotificationData({ 
          type: 'report_resolved', 
          reportId: reportId 
        });
      } else {
        console.warn('⚠️ Max retry attempts reached for notification navigation');
        this.pendingNavigation = null;
      }
    }
  }

  // Method to force navigation (call from Home screen when fully loaded)
  forceNavigationIfPending() {
    if (this.pendingNavigation) {
      console.log('🎯 Forcing navigation from Home screen load');
      this.retryPendingNavigation();
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