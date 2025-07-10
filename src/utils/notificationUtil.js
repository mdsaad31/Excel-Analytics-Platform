import api from '../config/api';

class NotificationUtil {
  // Send any notification
  static async sendNotification(notificationData) {
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      if (!response.ok) {
        console.error('Failed to send notification');
      }
      
      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send file upload notification
  static async sendFileUploadNotification(userId, fileName, fileSize) {
    return this.sendNotification({
      userId,
      type: 'file_upload',
      title: 'File uploaded successfully! 📊',
      message: `${fileName} (${this.formatFileSize(fileSize)}) has been processed and is ready for analysis.`,
      icon: '📁',
      priority: 'high',
      actionUrl: '/analysis',
      actionLabel: 'View Analysis',
      metadata: {
        fileName,
        fileSize,
        source: 'file_upload',
      },
    });
  }

  // Send chart download notification
  static async sendChartDownloadNotification(userId, chartName, format) {
    return this.sendNotification({
      userId,
      type: 'chart_download',
      title: 'Chart downloaded! 📈',
      message: `${chartName} has been downloaded as ${format.toUpperCase()}.`,
      icon: '⬇️',
      priority: 'low',
      metadata: {
        chartName,
        format,
        source: 'chart_export',
      },
    });
  }

  // Send chart save notification
  static async sendChartSaveNotification(userId, chartName, chartType) {
    return this.sendNotification({
      userId,
      type: 'chart_save',
      title: 'Chart saved! 💾',
      message: `${chartName} (${chartType}) has been saved to your collection.`,
      icon: '✅',
      priority: 'medium',
      actionUrl: '/saved-charts',
      actionLabel: 'View Saved Charts',
      metadata: {
        chartName,
        chartType,
        source: 'chart_save',
      },
    });
  }

  // Send profile update notification
  static async sendProfileUpdateNotification(userId) {
    return this.sendNotification({
      userId,
      type: 'profile_update',
      title: 'Profile updated! ✨',
      message: 'Your profile information has been successfully updated.',
      icon: '👤',
      priority: 'low',
      actionUrl: '/settings',
      actionLabel: 'View Profile',
      metadata: {
        source: 'profile_update',
      },
    });
  }

  // Send analysis complete notification
  static async sendAnalysisCompleteNotification(userId, fileName, analysisType) {
    return this.sendNotification({
      userId,
      type: 'analysis_complete',
      title: 'Analysis complete! 🎯',
      message: `${analysisType} analysis for ${fileName} has been completed.`,
      icon: '🔍',
      priority: 'high',
      actionUrl: '/analysis',
      actionLabel: 'View Results',
      metadata: {
        fileName,
        analysisType,
        source: 'analysis',
      },
    });
  }

  // Send success notification
  static async sendSuccessNotification(userId, title, message, actionUrl = null, actionLabel = null) {
    return this.sendNotification({
      userId,
      type: 'success',
      title,
      message,
      icon: '✅',
      priority: 'medium',
      actionUrl,
      actionLabel,
      metadata: {
        source: 'success',
      },
    });
  }

  // Send error notification
  static async sendErrorNotification(userId, title, message, context = {}) {
    return this.sendNotification({
      userId,
      type: 'error',
      title,
      message,
      icon: '❌',
      priority: 'urgent',
      metadata: {
        context,
        source: 'error',
      },
    });
  }

  // Send warning notification
  static async sendWarningNotification(userId, title, message, actionUrl = null, actionLabel = null) {
    return this.sendNotification({
      userId,
      type: 'warning',
      title,
      message,
      icon: '⚠️',
      priority: 'high',
      actionUrl,
      actionLabel,
      metadata: {
        source: 'warning',
      },
    });
  }

  // Send info notification
  static async sendInfoNotification(userId, title, message, actionUrl = null, actionLabel = null) {
    return this.sendNotification({
      userId,
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      priority: 'medium',
      actionUrl,
      actionLabel,
      metadata: {
        source: 'info',
      },
    });
  }

  // Helper function to format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default NotificationUtil;
