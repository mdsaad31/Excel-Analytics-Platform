import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import ExcelUploader from '../components/excel/ExcelUploader';
import DataViewer from '../components/excel/DataViewer';

const Dashboard = () => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reuseFileName, setReuseFileName] = useState(null);

  useEffect(() => {
    // Check if parsed data was passed from history (for View Data button)
    if (location.state && location.state.parsedData) {
      handleDataParsed(location.state.parsedData);
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
      return; // Don't process fileName if we have parsed data
    }
    
    // Check if fileName was passed for reuse functionality
    if (location.state && location.state.fileName) {
      setReuseFileName(location.state.fileName);
      // Clear the state after using it to prevent message from reappearing on subsequent visits
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleDataParsed = (data) => {
    setExcelData(data);
    if (data.firstSheet) {
      setActiveSheet(data.firstSheet);
    }
    localStorage.setItem('lastExcelData', JSON.stringify(data));
  };

  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem('lastExcelData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setExcelData(parsedData);
          if (parsedData.firstSheet) {
            setActiveSheet(parsedData.firstSheet);
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  const goToAnalysis = () => {
    if (excelData) {
      navigate('/analysis');
    } else {
      alert('Please upload an Excel file first to access the analysis tools.');
    }
  };

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Excel Data Explorer</h2>
            <div className="flex space-x-4">
              <button
                onClick={goToAnalysis}
                className={`flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md ${
                  excelData 
                    ? 'text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700' 
                    : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                } transition ease-in-out duration-150`}
                disabled={!excelData}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Analyze Data
              </button>
            </div>
          </div>

          {/* Sheet tabs - only show if we have data */}
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

          {/* File uploader */}
          <div className={`mb-8 ${excelData ? 'bg-white p-6 rounded-lg shadow-sm' : ''}`}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Excel File</h3>
            {reuseFileName && (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
                <p className="font-bold">Reusing File</p>
                <p>Please re-upload the file named: <span className="font-semibold">{reuseFileName}</span></p>
              </div>
            )}
            <ExcelUploader onDataParsed={handleDataParsed} />
          </div>

          {/* Data viewer */}
          {excelData && (
            <div className="mb-8">
              <DataViewer data={excelData} activeSheet={activeSheet} />
            </div>
          )}

          {/* Instructions */}
          {!excelData && (
            <div className="text-center bg-white p-8 rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v20c0 4 4 8 8 8h16c4 0 8-4 8-8V14c0-4-4-8-8-8H16c-4 0-8 4-8 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 24l4 4 8-8" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading an Excel file
              </p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Dashboard;