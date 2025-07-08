import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';
import config from '../config/api';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    if (currentUser) {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/history?user=${currentUser.sub}`);
        // Sort by newest first (most recent upload date)
        const sortedHistory = response.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setHistory(sortedHistory);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${config.API_BASE_URL}/history/${id}`);
      setHistory(history.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting history entry:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const formatDateTimeIndian = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  };

  const handleReuse = (fileName) => {
    navigate('/dashboard', { state: { fileName: fileName } });
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  return(
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
        <div>
          <h2 className="text-2xl font-semibold leading-tight">File Upload History</h2>
        </div>
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Upload Date & Time
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{item.fileName}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {formatDateTimeIndian(item.uploadDate)}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{item.size}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleReuse(item.fileName)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reuse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default History;
