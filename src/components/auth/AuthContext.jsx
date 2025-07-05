import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('excelAnalyticsToken');
      
      if (token) {
        setCurrentUser({
          name: 'Demo User',
          email: 'user@example.com',
          id: 'demo-user-id'
        });
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    localStorage.setItem('excelAnalyticsToken', 'demo-token');
    setCurrentUser({
      name: 'Demo User',
      email,
      id: 'demo-user-id'
    });
    return true;
  };

  const register = async (name, email, password) => {
    localStorage.setItem('excelAnalyticsToken', 'demo-token');
    setCurrentUser({
      name,
      email,
      id: 'demo-user-id'
    });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('excelAnalyticsToken');
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;