import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../config/api';
import { useAuth0 } from '@auth0/auth0-react';

const ChartManagement = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  const fetchCharts = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${api.API_BASE_URL}/admin/charts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCharts(response.data);
    } catch (error) {
      console.error('Error fetching charts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  const deleteChart = async (chartId) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      try {
        const token = await getAccessTokenSilently();
        await axios.delete(`${api.API_BASE_URL}/admin/charts/${chartId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCharts(); // Refresh charts after delete
      } catch (error) {
        console.error('Error deleting chart', error);
      }
    }
  };

  if (loading) {
    return <div>Loading charts...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Chart Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Chart Name</th>
            <th className="py-2">Chart Type</th>
            <th className="py-2">Created By</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {charts.map((chart) => (
            <tr key={chart._id}>
              <td className="border px-4 py-2">{chart.chartName}</td>
              <td className="border px-4 py-2">{chart.chartType}</td>
              <td className="border px-4 py-2">{chart.userId}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => deleteChart(chart._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChartManagement;
