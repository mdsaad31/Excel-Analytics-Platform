import React from 'react';
import { useNotifications } from './NotificationContext';
import '../styles/notifications.css';

const NotificationItem = ({ notification }) => {
  const { markAsRead, archiveNotification, deleteNotification } = useNotifications();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    archiveNotification(notification._id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNotification(notification._id);
  };

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent',
    };
    return classes[priority] || classes.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      welcome: '🎉',
      file_upload: '📁',
      chart_download: '📊',
      chart_save: '💾',
      chart_delete: '🗑️',
      profile_update: '👤',
      data_export: '📤',
      analysis_complete: '🔍',
      system_update: '🔄',
      security_alert: '🔒',
      error: '❌',
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
    };
    return icons[type] || '🔔';
  };

  return (
    <div
      className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        {notification.icon || getTypeIcon(notification.type)}
      </div>
      
      <div className="notification-body">
        <div className="notification-header-item">
          <h4 className="notification-title-item">{notification.title}</h4>
          <span className="notification-time">{notification.timeAgo}</span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        {notification.actionText && notification.actionUrl && (
          <div className="notification-action">
            <span className="action-text">{notification.actionText}</span>
            <svg
              className="action-arrow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="notification-actions">
        {!notification.isRead && (
          <div className="unread-indicator" title="Unread"></div>
        )}
        
        <button
          onClick={handleArchive}
          className="action-btn archive-btn"
          title="Archive"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8l6 6 6-6"
            />
          </svg>
        </button>
        
        <button
          onClick={handleDelete}
          className="action-btn delete-btn"
          title="Delete"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
