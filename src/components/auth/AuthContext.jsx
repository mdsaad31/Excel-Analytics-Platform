import React, { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { user, loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  // Send welcome notification when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      sendWelcomeNotification(user);
    }
  }, [isAuthenticated, user]);

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
