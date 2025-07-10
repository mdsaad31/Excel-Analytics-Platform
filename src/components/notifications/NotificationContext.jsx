import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../../config/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  // Load notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadNotifications();
      loadUnreadCount();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUser]);

  const loadNotifications = async (options = {}) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20,
        unreadOnly: options.unreadOnly || false,
        ...options.filters,
      });

      console.log('Loading notifications for user:', currentUser.sub);
      console.log('API URL:', `${api.API_BASE_URL}/notifications/${currentUser.sub}?${queryParams}`);

      const response = await fetch(`${api.API_BASE_URL}/notifications/${currentUser.sub}?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications loaded:', data);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        return data;
      } else {
        console.error('Failed to load notifications:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications/${currentUser.sub}/unread-count`);
      const data = await response.json();
      
      if (response.ok) {
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const createNotification = async (type, customData = {}) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.sub,
          type,
          customData,
        }),
      });

      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        return newNotification;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications/${currentUser.sub}/mark-all-read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date(),
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const archiveNotification = async (notificationId) => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications/${notificationId}/archive`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        
        // Decrease unread count if the notification was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        
        // Decrease unread count if the notification was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Helper functions for specific notification types
  const notifyFileUpload = (fileName, fileSize) => {
    return createNotification('file_upload', { fileName, fileSize });
  };

  const notifyChartDownload = (chartType, chartName) => {
    return createNotification('chart_download', { chartType, chartName });
  };

  const notifyChartSave = (chartName, chartType) => {
    return createNotification('chart_save', { chartName, chartType });
  };

  const notifyChartDelete = (chartName) => {
    return createNotification('chart_delete', { chartName });
  };

  const notifyProfileUpdate = () => {
    return createNotification('profile_update');
  };

  const notifyDataExport = (fileName, format) => {
    return createNotification('data_export', { fileName, format });
  };

  const notifyAnalysisComplete = (analysisType) => {
    return createNotification('analysis_complete', { analysisType });
  };

  const notifyError = (message) => {
    return createNotification('error', { message });
  };

  const notifySuccess = (message) => {
    return createNotification('success', { message });
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    showNotifications,
    loadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    toggleNotifications,
    setShowNotifications,
    // Helper functions
    notifyFileUpload,
    notifyChartDownload,
    notifyChartSave,
    notifyChartDelete,
    notifyProfileUpdate,
    notifyDataExport,
    notifyAnalysisComplete,
    notifyError,
    notifySuccess,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
