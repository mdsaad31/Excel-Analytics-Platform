const Notification = require('../models/notification.model');

class NotificationService {
  // Create a notification
  static async createNotification(userId, type, customData = {}) {
    try {
      const template = Notification.getTemplate(type, customData);
      
      const notificationData = {
        userId,
        type,
        ...template,
        metadata: customData,
      };

      const notification = await Notification.createNotification(notificationData);
      console.log(`Notification created for user ${userId}: ${type}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create welcome notification
  static async createWelcomeNotification(userId) {
    return this.createNotification(userId, 'welcome');
  }

  // Create file upload notification
  static async createFileUploadNotification(userId, fileName, fileSize) {
    return this.createNotification(userId, 'file_upload', {
      fileName,
      fileSize,
      action: 'upload',
    });
  }

  // Create chart download notification
  static async createChartDownloadNotification(userId, chartType, chartName) {
    return this.createNotification(userId, 'chart_download', {
      chartType,
      chartName,
      action: 'download',
    });
  }

  // Create chart save notification
  static async createChartSaveNotification(userId, chartName, chartType) {
    return this.createNotification(userId, 'chart_save', {
      chartName,
      chartType,
      action: 'save',
    });
  }

  // Create chart delete notification
  static async createChartDeleteNotification(userId, chartName) {
    return this.createNotification(userId, 'chart_delete', {
      chartName,
      action: 'delete',
    });
  }

  // Create profile update notification
  static async createProfileUpdateNotification(userId) {
    return this.createNotification(userId, 'profile_update');
  }

  // Create data export notification
  static async createDataExportNotification(userId, fileName, format) {
    return this.createNotification(userId, 'data_export', {
      fileName,
      format,
      action: 'export',
    });
  }

  // Create analysis complete notification
  static async createAnalysisCompleteNotification(userId, analysisType) {
    return this.createNotification(userId, 'analysis_complete', {
      analysisType,
      action: 'analyze',
    });
  }

  // Create security alert notification
  static async createSecurityAlertNotification(userId, alertType, metadata = {}) {
    return this.createNotification(userId, 'security_alert', {
      alertType,
      ...metadata,
    });
  }

  // Create error notification
  static async createErrorNotification(userId, message, metadata = {}) {
    return this.createNotification(userId, 'error', {
      message,
      ...metadata,
    });
  }

  // Create success notification
  static async createSuccessNotification(userId, message, metadata = {}) {
    return this.createNotification(userId, 'success', {
      message,
      ...metadata,
    });
  }

  // Get user notifications
  static async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type,
      priority,
      category
    } = options;

    const query = { userId, isArchived: false };
    
    if (unreadOnly) query.isRead = false;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false, 
      isArchived: false 
    });

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  // Get unread count
  static async getUnreadCount(userId) {
    return await Notification.countDocuments({ 
      userId, 
      isRead: false, 
      isArchived: false 
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markAsRead();
    }
    return notification;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false, isArchived: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  }

  // Archive notification
  static async archiveNotification(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.archive();
    }
    return notification;
  }

  // Delete old notifications (cleanup)
  static async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isArchived: true,
    });

    console.log(`Cleaned up ${result.deletedCount} old notifications`);
    return result;
  }

  // Send bulk notifications
  static async sendBulkNotifications(userIds, type, customData = {}) {
    try {
      const template = Notification.getTemplate(type, customData);
      
      const notifications = userIds.map(userId => ({
        userId,
        type,
        ...template,
        metadata: customData,
      }));

      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`${createdNotifications.length} bulk notifications created`);
      return createdNotifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId) {
    const stats = await Notification.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          }
        }
      }
    ]);

    const priorityStats = await Notification.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    return { 
      byType: stats,
      byPriority: priorityStats 
    };
  }
}

module.exports = NotificationService;
