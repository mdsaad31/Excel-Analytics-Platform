import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import api from '../config/api';
import NotificationUtil from '../utils/notificationUtil';
import '../styles/settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [theme, setTheme] = useState('light');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadProfile();
      loadAvatars();
    }
  }, [currentUser]);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/user-profile/${currentUser.sub}?email=${currentUser.email}`);
      const data = await response.json();
      setProfile(data);
      setTheme(data.preferences?.theme || 'light');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvatars = async () => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/user-profile/avatars/all`);
      const data = await response.json();
      setAvailableAvatars(data.avatars);
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  const updateProfile = async (updates) => {
    setSaving(true);
    try {
      const response = await fetch(`${api.API_BASE_URL}/user-profile/${currentUser.sub}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Send profile update notification
        await NotificationUtil.sendProfileUpdateNotification(currentUser.sub);
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const checkNicknameAvailability = async (nickname) => {
    if (!nickname || nickname.trim().length === 0) {
      setNicknameAvailable(null);
      return;
    }

    setCheckingNickname(true);
    try {
      const response = await fetch(`${api.API_BASE_URL}/user-profile/check-nickname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim(), userId: currentUser.sub }),
      });
      
      const data = await response.json();
      setNicknameAvailable(data.available);
    } catch (error) {
      console.error('Error checking nickname:', error);
      setNicknameAvailable(null);
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (profile.nickname && nicknameAvailable === false) {
      alert('Please choose a different nickname');
      return;
    }

    // Ensure email is set from Auth0
    const updatedProfile = {
      ...profile,
      email: currentUser.email,
      preferences: {
        ...profile.preferences,
        theme: theme
      }
    };

    const success = await updateProfile(updatedProfile);
    if (success) {
      console.log('Profile saved successfully');
    }
  };

  const parseAvatar = (avatarString) => {
    if (!avatarString) return { emoji: '💻', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    const [emoji, gradient] = avatarString.split('|');
    return { emoji, gradient };
  };

  const AvatarDisplay = ({ avatar, size = 'w-12 h-12' }) => {
    const { emoji, gradient } = parseAvatar(avatar);
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center text-white font-bold text-xl`}
        style={{ background: gradient }}
      >
        {emoji}
      </div>
    );
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: '👤' },
    { id: 'contact', name: 'Contact & Work', icon: '💼' },
    { id: 'social', name: 'Social Links', icon: '🔗' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <AvatarDisplay avatar={profile?.avatar} size="w-16 h-16" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{profile?.nickname}</h1>
                      <p className="text-gray-600">{currentUser?.email}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profile?.profileCompleteness || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{profile?.profileCompleteness || 0}% complete</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {successMessage && (
                      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                        {successMessage}
                      </div>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                  
                  {/* Avatar Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Avatar</label>
                    <div className="flex items-center space-x-4">
                      <AvatarDisplay avatar={profile?.avatar} size="w-20 h-20" />
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowAvatarModal(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Choose Avatar
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${api.API_BASE_URL}/user-profile/avatar/random`);
                              const data = await response.json();
                              handleInputChange('avatar', data.avatar);
                            } catch (error) {
                              console.error('Error generating random avatar:', error);
                            }
                          }}
                          className="block bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Random Avatar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nickname */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Nickname *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile?.nickname || ''}
                        onChange={(e) => {
                          handleInputChange('nickname', e.target.value);
                          checkNicknameAvailability(e.target.value);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          nicknameAvailable === false ? 'border-red-300' : 
                          nicknameAvailable === true ? 'border-green-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your nickname"
                      />
                      {checkingNickname && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        </div>
                      )}
                    </div>
                    {nicknameAvailable === false && (
                      <p className="text-sm text-red-600">This nickname is already taken</p>
                    )}
                    {nicknameAvailable === true && (
                      <p className="text-sm text-green-600">This nickname is available</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={profile?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <p className="text-sm text-gray-500">
                      {(profile?.bio || '').length}/500 characters
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Contact & Work Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        placeholder="your@email.com"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed as it's linked to your authentication account</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Job Title</label>
                      <input
                        type="text"
                        value={profile?.jobTitle || ''}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Data Analyst"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <input
                        type="text"
                        value={profile?.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Your Company"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <input
                        type="text"
                        value={profile?.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Analytics"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={profile?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Social Links</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
                      { key: 'github', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/username' },
                      { key: 'twitter', label: 'Twitter', icon: '🐦', placeholder: 'https://twitter.com/username' },
                      { key: 'website', label: 'Website', icon: '🌐', placeholder: 'https://yourwebsite.com' },
                    ].map((social) => (
                      <div key={social.key} className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span className="mr-2">{social.icon}</span>
                          {social.label}
                        </label>
                        <input
                          type="url"
                          value={profile?.socialLinks?.[social.key] || ''}
                          onChange={(e) => handleNestedInputChange('socialLinks', social.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={social.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
                  
                  {/* Theme */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                    <p className="text-sm text-gray-500">Choose your preferred theme. System will match your device's preference.</p>
                  </div>

                  {/* Date Format */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date Format</label>
                    <select
                      value={profile?.preferences?.dateFormat || 'DD/MM/YYYY'}
                      onChange={(e) => handleNestedInputChange('preferences', 'dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (European Format)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                    </select>
                  </div>

                  {/* Charts Per Page */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Charts Per Page</label>
                    <input
                      type="range"
                      min="6"
                      max="24"
                      value={profile?.preferences?.dashboard?.chartsPerPage || 12}
                      onChange={(e) => {
                        const newDashboard = {
                          ...profile?.preferences?.dashboard,
                          chartsPerPage: parseInt(e.target.value)
                        };
                        handleNestedInputChange('preferences', 'dashboard', newDashboard);
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>6</span>
                      <span className="font-medium">{profile?.preferences?.dashboard?.chartsPerPage || 12} charts</span>
                      <span>24</span>
                    </div>
                  </div>

                  {/* Auto-save Charts */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Auto-save Charts</p>
                      <p className="text-sm text-gray-500">Automatically save charts when you create them</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={profile?.preferences?.dashboard?.autoSaveCharts !== false}
                        onChange={(e) => {
                          const newDashboard = {
                            ...profile?.preferences?.dashboard,
                            autoSaveCharts: e.target.checked
                          };
                          handleNestedInputChange('preferences', 'dashboard', newDashboard);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Show Tutorials */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show Tutorials</p>
                      <p className="text-sm text-gray-500">Display helpful tips and onboarding tutorials</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={profile?.preferences?.dashboard?.showTutorials !== false}
                        onChange={(e) => {
                          const newDashboard = {
                            ...profile?.preferences?.dashboard,
                            showTutorials: e.target.checked
                          };
                          handleNestedInputChange('preferences', 'dashboard', newDashboard);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Choose Your Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-8 gap-3">
              {availableAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleInputChange('avatar', avatar);
                    setShowAvatarModal(false);
                  }}
                  className={`p-1 rounded-lg border-2 transition-all ${
                    profile?.avatar === avatar
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <AvatarDisplay avatar={avatar} size="w-12 h-12" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
