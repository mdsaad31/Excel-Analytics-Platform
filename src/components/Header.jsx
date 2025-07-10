import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { useNotifications } from './notifications/NotificationContext';
import NotificationBell from './notifications/NotificationBell';
import NotificationDropdown from './notifications/NotificationDropdown';
import api from '../config/api';
import '../styles/header.css';
import '../styles/notifications.css';

const Header = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { showNotifications, setShowNotifications, unreadCount } = useNotifications();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserProfile();
    }
  }, [isAuthenticated, currentUser]);

  // Close all dropdowns when clicking outside or opening another
  const closeAllDropdowns = () => {
    setIsProfileOpen(false);
    setShowNotifications(false);
  };

  const toggleProfileDropdown = () => {
    if (showNotifications) setShowNotifications(false); // Close notifications if open
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleNotificationDropdown = () => {
    console.log('Toggling notification dropdown. Current state:', showNotifications);
    if (isProfileOpen) setIsProfileOpen(false); // Close profile if open
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserProfile();
    }
  }, [isAuthenticated, currentUser]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/user-profile/${currentUser.sub}?email=${currentUser.email}`);
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const parseAvatar = (avatarString) => {
    if (!avatarString) return { emoji: '🎯', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    const [emoji, gradient] = avatarString.split('|');
    return { emoji, gradient };
  };

  const AvatarDisplay = ({ avatar, size = 'w-8 h-8' }) => {
    const { emoji, gradient } = parseAvatar(avatar);
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center text-white font-bold text-sm`}
        style={{ background: gradient }}
      >
        {emoji}
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="md:hidden mr-4 text-gray-500 focus:outline-none focus:text-gray-900"
            aria-label="Open sidebar"
          >
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <div className="text-xl font-bold text-indigo-600">Analytics Dashboard</div>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={toggleNotificationDropdown}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full transition-colors"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown />
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative">
              <button 
                onClick={toggleProfileDropdown} 
                className="profile-avatar-btn flex items-center focus:outline-none"
              >
                {userProfile?.avatar ? (
                  <AvatarDisplay avatar={userProfile.avatar} />
                ) : (
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </button>
              {isProfileOpen && (
                <div className="header-dropdown absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="profile-section space-x-3">
                      {userProfile?.avatar ? (
                        <AvatarDisplay avatar={userProfile.avatar} size="w-12 h-12" />
                      ) : (
                        <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="profile-info">
                        <p className="profile-name">
                          {userProfile?.nickname || currentUser.name || 'User'}
                        </p>
                        <p className="profile-email" title={currentUser.email}>
                          {currentUser.email}
                        </p>
                        {userProfile?.profileCompleteness !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Profile</span>
                              <span>{userProfile.profileCompleteness}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="profile-progress h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${userProfile.profileCompleteness}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      Settings
                    </Link>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    <Link 
                      to="/saved-charts" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Saved Charts
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        logout();
                        closeAllDropdowns();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
