import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_REPORTS_KEY = '@crowdsource_offline_reports';

class OfflineStorage {
  constructor() {
    this.isOnline = true;
    this.setupNetworkListener();
  }

  // Setup network status monitoring
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      console.log('🌐 Network status changed:', {
        wasOffline,
        isOnline: this.isOnline,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable
      });

      // If we just came back online, try to upload pending reports
      if (wasOffline && this.isOnline) {
        console.log('🌐 Back online! Starting upload of pending reports...');
        setTimeout(() => {
          this.uploadPendingReports();
        }, 2000); // Delay to ensure network is stable
      }
    });
  }

  // Check if device is online
  async checkNetworkStatus() {
    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected && state.isInternetReachable;
      return this.isOnline;
    } catch (error) {
      console.error('❌ Error checking network status:', error);
      return false;
    }
  }

  // Save report for offline submission
  async saveOfflineReport(reportData) {
    try {
      const existingReports = await this.getOfflineReports();
      const reportWithId = {
        ...reportData,
        offlineId: Date.now().toString(),
        savedAt: new Date().toISOString(),
        retryCount: 0,
        status: 'pending'
      };

      existingReports.push(reportWithId);
      await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(existingReports));

      console.log('💾 Report saved offline:', reportWithId.offlineId);
      return reportWithId.offlineId;
    } catch (error) {
      console.error('❌ Error saving offline report:', error);
      throw error;
    }
  }

  // Get all offline reports
  async getOfflineReports() {
    try {
      const reportsJson = await AsyncStorage.getItem(OFFLINE_REPORTS_KEY);
      return reportsJson ? JSON.parse(reportsJson) : [];
    } catch (error) {
      console.error('❌ Error getting offline reports:', error);
      return [];
    }
  }

  // Remove uploaded report from offline storage
  async removeOfflineReport(offlineId) {
    try {
      const reports = await this.getOfflineReports();
      const filteredReports = reports.filter(report => report.offlineId !== offlineId);
      await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(filteredReports));
      console.log('🗑️ Removed uploaded report:', offlineId);
    } catch (error) {
      console.error('❌ Error removing offline report:', error);
    }
  }

  // Update report status (for retry tracking)
  async updateReportStatus(offlineId, status, error = null) {
    try {
      const reports = await this.getOfflineReports();
      const reportIndex = reports.findIndex(report => report.offlineId === offlineId);

      if (reportIndex !== -1) {
        reports[reportIndex].status = status;
        reports[reportIndex].lastAttempt = new Date().toISOString();
        reports[reportIndex].retryCount = (reports[reportIndex].retryCount || 0) + 1;

        if (error) {
          reports[reportIndex].lastError = error.message;
        }

        await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(reports));
        console.log('📝 Updated report status:', offlineId, status);
      }
    } catch (error) {
      console.error('❌ Error updating report status:', error);
    }
  }

  // Upload all pending reports
  async uploadPendingReports() {
    try {
      const reports = await this.getOfflineReports();
      const pendingReports = reports.filter(report => report.status === 'pending' || report.status === 'failed');

      if (pendingReports.length === 0) {
        console.log('✅ No pending reports to upload');
        return;
      }

      console.log(`📤 Uploading ${pendingReports.length} pending reports...`);

      for (const report of pendingReports) {
        try {
          console.log(`📤 Uploading report ${report.offlineId} (${report.title})`);
          await this.uploadSingleReport(report);
        } catch (error) {
          console.error(`❌ Failed to upload report ${report.offlineId}:`, error);
          await this.updateReportStatus(report.offlineId, 'failed', error);
        }
      }
    } catch (error) {
      console.error('❌ Error in uploadPendingReports:', error);
    }
  }

  // Upload a single report
  async uploadSingleReport(report) {
    try {
      // Re-upload media files if they exist
      let uploadedMediaUrls = [];
      let uploadedAudioUrl = '';

      if (report.mediaItems && report.mediaItems.length > 0) {
        console.log('📁 Re-uploading media files for offline report...');
        
        // Import the media upload function
        const { uploadReportMedia } = await import('../api/media');
        
        try {
          const uploadResult = await uploadReportMedia(report.mediaItems, report.recordingUri || undefined, report.userId);
          
          if (uploadResult.success) {
            uploadedMediaUrls = uploadResult.mediaUrls || [];
            uploadedAudioUrl = uploadResult.audioUrl || '';
            console.log('✅ Media re-uploaded successfully:', {
              mediaUrls: uploadedMediaUrls,
              audioUrl: uploadedAudioUrl
            });
          } else {
            throw new Error(uploadResult.message || 'Failed to re-upload media');
          }
        } catch (mediaError) {
          console.error('❌ Failed to re-upload media:', mediaError);
          throw new Error(`Media upload failed: ${mediaError.message}`);
        }
      }

      // Import your existing report submission API
      const { createReport } = await import('../api/report');

      // Prepare the report data for submission
      const reportData = {
        userId: report.userId,
        title: report.title,
        description: report.description,
        category: report.category,
        priority: 'auto',
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address,
        department: report.department,
        mediaUrls: uploadedMediaUrls,
        audioUrl: uploadedAudioUrl
      };

      // Submit the report
      const result = await createReport(reportData);

      if (result.success) {
        // Remove from offline storage on success
        await this.removeOfflineReport(report.offlineId);
        console.log('✅ Successfully uploaded offline report:', report.offlineId);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      // Update status for retry
      await this.updateReportStatus(report.offlineId, 'failed', error);
      throw error;
    }
  }

  // Get offline reports count
  async getOfflineReportsCount() {
    const reports = await this.getOfflineReports();
    return reports.length;
  }

  // Trigger automatic upload of pending reports
  async triggerAutoUpload() {
    console.log('🔄 Auto upload triggered');
    const wasOffline = !this.isOnline;
    const isOnline = await this.checkNetworkStatus();

    // Update current online status
    this.isOnline = isOnline;

    if (isOnline) {
      // If we just came back online, this is a network restoration
      if (wasOffline) {
        console.log('🌐 Network restored! Automatically starting upload of pending reports...');
        // Add a small delay to ensure network is stable
        setTimeout(async () => {
          try {
            await this.uploadPendingReports();
            console.log('✅ Auto upload completed after network restoration');
          } catch (error) {
            console.log('⚠️ Auto upload had some issues, but manual upload button is available for remaining reports');
          }
        }, 2000);
      } else {
        console.log('🌐 Device is online, starting automatic upload...');
        await this.uploadPendingReports();
      }
    } else {
      console.log('❌ Cannot auto upload - device is offline');
    }
  }

  // Get pending reports count
  async getPendingReportsCount() {
    const reports = await this.getOfflineReports();
    const pendingReports = reports.filter(report => report.status === 'pending' || report.status === 'failed');
    return pendingReports.length;
  }

  // Clear all offline reports (for testing or manual cleanup)
  async clearAllOfflineReports() {
    try {
      await AsyncStorage.removeItem(OFFLINE_REPORTS_KEY);
      console.log('🧹 Cleared all offline reports');
    } catch (error) {
      console.error('❌ Error clearing offline reports:', error);
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();
export default offlineStorage;