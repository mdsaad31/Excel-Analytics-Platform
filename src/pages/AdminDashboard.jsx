import React, { useState } from 'react';
import UserManagement from '../components/admin/UserManagement';
import ChartManagement from '../components/admin/ChartManagement';
import FileManagement from '../components/admin/FileManagement';
import Analytics from '../components/admin/Analytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'charts':
        return <ChartManagement />;
      case 'files':
        return <FileManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'charts' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Chart Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'files' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          File Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
