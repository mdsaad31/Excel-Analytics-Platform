import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import ChartSelector from '../components/excel/ChartSelector';
import DataViewer from '../components/excel/DataViewer';

const Analysis = () => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if parsed data was passed from history (for Reuse button)
    if (location.state && location.state.parsedData) {
      setExcelData(location.state.parsedData);
      if (location.state.parsedData.firstSheet) {
        setActiveSheet(location.state.parsedData.firstSheet);
      }
      // Store in localStorage for consistency
      localStorage.setItem('lastExcelData', JSON.stringify(location.state.parsedData));
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    // Otherwise, load from localStorage
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem('lastExcelData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setExcelData(parsedData);
          if (parsedData.firstSheet) {
            setActiveSheet(parsedData.firstSheet);
          }
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        navigate('/dashboard');
      }
    };

    loadSavedData();
  }, [location, navigate]);

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (!excelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Visualization Tools</h2>
            <button
              onClick={goToDashboard}
              className="flex items-center px-4 py-2 border border-blue-600 text-sm leading-5 font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition ease-in-out duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Sheet tabs */}
          {excelData && excelData.sheets && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {Object.keys(excelData.sheets).map((sheetName) => (
                  <button
                    key={sheetName}
                    onClick={() => setActiveSheet(sheetName)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeSheet === sheetName
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {sheetName}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Chart selector */}
          <div className="mb-8 overflow-x-auto">
            <ChartSelector data={excelData} activeSheet={activeSheet} />
          </div>
          
          {/* Data preview */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h3>
            <DataViewer data={excelData} activeSheet={activeSheet} />
          </div>
          
          {/* AI Insights section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Coming Soon
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Automated insights from your data will be available in a future update. This feature will:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Identify trends and patterns automatically</li>
              <li>Suggest optimal visualization formats for your data</li>
              <li>Provide text summaries of key findings</li>
              <li>Offer predictive analysis based on historical data</li>
            </ul>
          </div>
        </div>
        </div>
  );
};

export default Analysis;