import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../config/api';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const { user, loginWithRedirect, logout, isAuthenticated, isLoading: auth0Loading, getAccessTokenSilently } = useAuth0();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const response = await axios.get(`${api.API_BASE_URL}/user-profile/${user.sub}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser({ ...user, ...response.data });
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          setCurrentUser(user); // Fallback to auth0 user
        } finally {
          setIsLoading(false);
        }
      } else if (!auth0Loading) {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, user, auth0Loading, getAccessTokenSilently]);

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
    currentUser,
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
