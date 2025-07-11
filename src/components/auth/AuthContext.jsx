import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { user, loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Send welcome notification when user logs in (not on page reload)
  useEffect(() => {
    if (isAuthenticated && user && !hasShownWelcome) {
      // Check if this is a fresh login vs page reload
      const lastLoginTime = sessionStorage.getItem(`lastLogin_${user.sub}`);
      const currentTime = new Date().getTime();
      const fiveMinutesAgo = currentTime - (5 * 60 * 1000);
      
      // Only send welcome if no recent login recorded or it's been more than 5 minutes
      if (!lastLoginTime || parseInt(lastLoginTime) < fiveMinutesAgo) {
        sendWelcomeNotification(user);
        setHasShownWelcome(true);
        sessionStorage.setItem(`lastLogin_${user.sub}`, currentTime.toString());
      }
    }
  }, [isAuthenticated, user, hasShownWelcome]);

  const sendWelcomeNotification = async (user) => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          type: 'welcome',
          title: `Welcome back, ${user.name || user.nickname || 'there'}! 👋`,
          message: 'Ready to dive into your analytics? Let\'s create something amazing today!',
          icon: '🎉',
          priority: 'medium',
          actionUrl: '/dashboard',
          actionLabel: 'Go to Dashboard',
          metadata: {
            source: 'auth',
            loginTime: new Date(),
          },
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send welcome notification');
      }
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }
  };

  const value = {
    currentUser: user,
    login: loginWithRedirect,
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
