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

  const handleDownload = async (id, fileName) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/history/${id}/download`, {
        responseType: 'blob',
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleViewData = async (id) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/history/${id}/data`);
      
      // Navigate to dashboard with parsed data
      navigate('/dashboard', { 
        state: { 
          parsedData: response.data.parsedData,
          fileName: response.data.fileName 
        } 
      });
    } catch (error) {
      console.error('Error fetching parsed data:', error);
      alert('Failed to load file data. Please try again.');
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

  const handleReuse = async (id) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/history/${id}/data`);
      
      // Navigate to analysis page with parsed data (Reuse functionality)
      navigate('/analysis', { 
        state: { 
          parsedData: response.data.parsedData,
          fileName: response.data.fileName 
        } 
      });
    } catch (error) {
      console.error('Error fetching parsed data:', error);
      alert('Failed to load file data. Please try again.');
    }
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
                    Data Available
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
                      <div className="flex flex-col">
                        <p className="text-gray-900 whitespace-no-wrap">{item.size}</p>
                        {item.originalSize && item.originalSize > 1024 * 1024 && (
                          <span className="text-xs text-amber-600">
                            File too large (&gt;{((item.originalSize / (1024 * 1024)).toFixed(2))}MB)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex flex-col">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.fileContent ? 'bg-green-100 text-green-800' : 
                          item.originalSize && item.originalSize > 1024 * 1024 ? 'bg-amber-100 text-amber-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.fileContent ? 'Complete File' : 
                           item.originalSize && item.originalSize > 1024 * 1024 ? 'Size Limited' : 
                           'Metadata Only'}
                        </span>
                        {item.parsedData && (
                          <span className="text-xs text-gray-500 mt-1">
                            {Object.keys(item.parsedData.sheets || {}).length} sheets
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                        {item.parsedData && (
                          <button
                            onClick={() => handleReuse(item._id)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Reuse
                          </button>
                        )}
                        {item.fileContent && (
                          <button
                            onClick={() => handleDownload(item._id, item.fileName)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Download
                          </button>
                        )}
                        {item.parsedData && (
                          <button
                            onClick={() => handleViewData(item._id)}
                            className="text-purple-600 hover:text-purple-900 text-sm"
                          >
                            View Data
                          </button>
                        )}
                      </div>
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
