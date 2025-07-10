import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../../config/api';
import NotificationUtil from '../../utils/notificationUtil';

const SaveChartModal = ({ isOpen, onClose, chartData, onSaveSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    isPublic: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chartData || !currentUser) return;

    setSaving(true);
    setError('');

    try {
      // Capture chart as image data
      const chartElement = document.querySelector('.recharts-wrapper') || 
                          document.querySelector('.chart-container') ||
                          document.querySelector('[data-testid="recharts-wrapper"]');
      
      let chartImageData = '';
      
      if (chartElement) {
        try {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 1.5, // Reduced from 2 to 1.5 to reduce file size
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: 800, // Set max width
            height: 600 // Set max height
          });
          chartImageData = canvas.toDataURL('image/png', 0.8); // Added quality parameter to reduce size
        } catch (captureError) {
          console.warn('Could not capture chart image:', captureError);
        }
      }

      const payload = {
        title: formData.title.trim(),
        chartType: chartData.chartType,
        chartConfig: {
          xAxis: chartData.xAxis,
          yAxis: chartData.yAxis,
          chartData: chartData.chartData,
          colors: chartData.colors,
          startRow: chartData.startRow,
          endRow: chartData.endRow,
          activeSheet: chartData.activeSheet
        },
        chartImageData,
        fileName: chartData.fileName || 'Unknown File',
        user: currentUser.sub,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublic: formData.isPublic
      };

      const response = await fetch(`${api.API_BASE_URL}/saved-charts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save chart';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is HTML (server error), extract meaningful message
          if (errorText.includes('PayloadTooLargeError')) {
            errorMessage = 'Chart image is too large. Please try with a smaller chart.';
          } else if (errorText.includes('<!DOCTYPE')) {
            errorMessage = 'Server error occurred. Please try again.';
          } else {
            errorMessage = errorText.substring(0, 100) + '...';
          }
        }
        
        throw new Error(errorMessage);
      }

      const savedChart = await response.json();
      
      // Send chart save notification
      await NotificationUtil.sendChartSaveNotification(
        currentUser.sub,
        formData.title.trim(),
        chartData.chartType
      );
      
      // Reset form
      setFormData({ title: '', tags: '', isPublic: false });
      
      // Call success callback
      if (onSaveSuccess) {
        onSaveSuccess(savedChart);
      }
      
      // Close modal
      onClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Save Chart
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Chart Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title for your chart"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="sales, revenue, quarterly (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Make this chart public
              </label>
            </div>

            {chartData && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Chart Details:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Type:</strong> {chartData.chartType}</p>
                  <p><strong>X-Axis:</strong> {chartData.xAxis}</p>
                  <p><strong>Y-Axis:</strong> {Array.isArray(chartData.yAxis) ? chartData.yAxis.join(', ') : chartData.yAxis}</p>
                  {chartData.fileName && <p><strong>File:</strong> {chartData.fileName}</p>}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.title.trim()}
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Chart'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaveChartModal;
