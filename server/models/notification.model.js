const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'welcome',
      'file_upload',
      'chart_download',
      'chart_save',
      'chart_delete',
      'profile_update',
      'system_update',
      'security_alert',
      'data_export',
      'analysis_complete',
      'error',
      'info',
      'success',
      'warning'
    ],
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500,
  },
  icon: {
    type: String,
    default: '🔔',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['system', 'user_action', 'security', 'update', 'error'],
    default: 'user_action',
  },
  metadata: {
    fileName: String,
    chartName: String,
    fileSize: Number,
    chartType: String,
    action: String,
    relatedId: String,
    url: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 30 days from now
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
  },
  actionUrl: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Virtual for formatting priority
notificationSchema.virtual('priorityColor').get(function() {
  const colors = {
    low: '#10b981',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  };
  return colors[this.priority] || colors.medium;
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Static method to get notification templates
notificationSchema.statics.getTemplate = function(type, data = {}) {
  const templates = {
    welcome: {
      title: '🎉 Welcome to Analytics Platform!',
      message: 'Get started by uploading your first Excel file to create amazing visualizations.',
      icon: '🎉',
      priority: 'medium',
      category: 'system',
      actionText: 'Get Started',
      actionUrl: '/dashboard',
    },
    file_upload: {
      title: '📁 File Uploaded Successfully',
      message: `Your file "${data.fileName}" has been uploaded and is ready for analysis.`,
      icon: '📁',
      priority: 'medium',
      category: 'user_action',
      actionText: 'View Data',
      actionUrl: `/analysis?file=${data.fileName}`,
    },
    chart_download: {
      title: '📊 Chart Downloaded',
      message: `Your ${data.chartType} chart has been downloaded successfully.`,
      icon: '📊',
      priority: 'low',
      category: 'user_action',
    },
    chart_save: {
      title: '💾 Chart Saved',
      message: `Your chart "${data.chartName}" has been saved to your collection.`,
      icon: '💾',
      priority: 'low',
      category: 'user_action',
      actionText: 'View Charts',
      actionUrl: '/saved-charts',
    },
    chart_delete: {
      title: '🗑️ Chart Deleted',
      message: `Chart "${data.chartName}" has been removed from your collection.`,
      icon: '🗑️',
      priority: 'low',
      category: 'user_action',
    },
    profile_update: {
      title: '👤 Profile Updated',
      message: 'Your profile information has been updated successfully.',
      icon: '👤',
      priority: 'low',
      category: 'user_action',
      actionText: 'View Profile',
      actionUrl: '/settings',
    },
    data_export: {
      title: '📤 Data Export Complete',
      message: `Your data has been exported successfully. File: ${data.fileName}`,
      icon: '📤',
      priority: 'medium',
      category: 'user_action',
    },
    analysis_complete: {
      title: '🔍 Analysis Complete',
      message: 'Your data analysis has been completed. Results are now available.',
      icon: '🔍',
      priority: 'medium',
      category: 'user_action',
      actionText: 'View Results',
      actionUrl: '/dashboard',
    },
    system_update: {
      title: '🔄 System Update',
      message: 'Analytics Platform has been updated with new features and improvements.',
      icon: '🔄',
      priority: 'medium',
      category: 'system',
    },
    security_alert: {
      title: '🔒 Security Alert',
      message: 'We detected a new sign-in from a different device or location.',
      icon: '🔒',
      priority: 'high',
      category: 'security',
      actionText: 'Review Activity',
      actionUrl: '/settings',
    },
    error: {
      title: '❌ Error Occurred',
      message: data.message || 'An error occurred while processing your request.',
      icon: '❌',
      priority: 'high',
      category: 'error',
    },
    success: {
      title: '✅ Success',
      message: data.message || 'Operation completed successfully.',
      icon: '✅',
      priority: 'low',
      category: 'user_action',
    },
  };

  return templates[type] || templates.info;
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to archive
notificationSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
