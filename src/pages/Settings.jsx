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
  const [newSkill, setNewSkill] = useState('');

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

  const addSkill = () => {
    if (newSkill.trim() && newSkill.trim().length <= 50) {
      const skills = profile.skills || [];
      if (!skills.includes(newSkill.trim())) {
        setProfile(prev => ({
          ...prev,
          skills: [...skills, newSkill.trim()]
        }));
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
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
        className={`${size} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
        style={{ 
          background: gradient,
          fontSize: size.includes('w-20') ? '28px' : 
                    size.includes('w-16') ? '24px' :
                    size.includes('w-12') ? '20px' : '16px'
        }}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
            <div className="flex flex-col space-y-2 lg:items-end w-full lg:w-auto">
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded w-full lg:w-auto">
                  {successMessage}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full lg:w-auto"
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

                  {/* Skills */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(profile?.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={handleSkillKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Add a skill (e.g., Data Analysis, Python, Excel)"
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        disabled={!newSkill.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Press Enter or click Add to include a skill. Skills help others understand your expertise.
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
                      { 
                        key: 'linkedin', 
                        label: 'LinkedIn', 
                        placeholder: 'https://linkedin.com/in/username',
                        icon: (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                          </svg>
                        )
                      },
                      { 
                        key: 'github', 
                        label: 'GitHub', 
                        placeholder: 'https://github.com/username',
                        icon: (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                          </svg>
                        )
                      },
                      { 
                        key: 'twitter', 
                        label: 'Twitter', 
                        placeholder: 'https://twitter.com/username',
                        icon: (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        )
                      },
                      { 
                        key: 'website', 
                        label: 'Website', 
                        placeholder: 'https://yourwebsite.com',
                        icon: (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                          </svg>
                        )
                      },
                    ].map((social) => (
                      <div key={social.key} className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span className="mr-2 text-gray-600">{social.icon}</span>
                          {social.label}
                        </label>
                        <input
                          type="url"
                          value={profile?.socialLinks?.[social.key] || ''}
                          onChange={(e) => handleNestedInputChange('socialLinks', social.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={social.placeholder}
                        />
                        <p className="text-xs text-gray-500">
                          Enter the full URL (including https://)
                        </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Your Avatar</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select an emoji and background that represents you</p>
                </div>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {availableAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleInputChange('avatar', avatar);
                      setShowAvatarModal(false);
                    }}
                    className={`avatar-selector-btn relative group transition-all duration-200 rounded-xl ${
                      profile?.avatar === avatar
                        ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800 scale-105'
                        : 'hover:scale-110 hover:shadow-lg'
                    }`}
                  >
                    <AvatarDisplay avatar={avatar} size="w-14 h-14" />
                    {profile?.avatar === avatar && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
