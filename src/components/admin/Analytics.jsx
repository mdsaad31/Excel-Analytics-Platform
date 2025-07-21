import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../config/api';
import { useAuth0 } from '@auth0/auth0-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${api.API_BASE_URL}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>Could not load analytics.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl">{analytics.userCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Total Charts</h3>
          <p className="text-3xl">{analytics.chartCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Public Charts</h3>
          <p className="text-3xl">{analytics.publicChartCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Total Files Uploaded</h3>
          <p className="text-3xl">{analytics.fileCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
