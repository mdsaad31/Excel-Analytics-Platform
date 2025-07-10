import React, { useEffect, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown = () => {
  const {
    notifications,
    loading,
    showNotifications,
    setShowNotifications,
    markAllAsRead,
    unreadCount,
  } = useNotifications();
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, setShowNotifications]);

  if (!showNotifications) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="notification-action-btn"
              title="Mark all as read"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowNotifications(false)}
            className="notification-action-btn"
            title="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="notification-content">
        {loading ? (
          <div className="notification-loading">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="empty-icon">🔔</div>
            <p>No notifications yet</p>
            <small>You'll see updates about your activities here</small>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-footer">
          <button
            className="view-all-btn"
            onClick={() => {
              setShowNotifications(false);
              // Navigate to notifications page if you have one
              // window.location.href = '/notifications';
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
