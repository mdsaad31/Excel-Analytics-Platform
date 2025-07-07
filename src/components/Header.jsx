import React, { useState } from 'react';
import { useAuth } from './auth/AuthContext';

const Header = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();

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
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="flex items-center focus:outline-none"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    <p className="font-bold">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <button 
                    onClick={logout} 
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
