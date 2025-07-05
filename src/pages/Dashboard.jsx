import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import ExcelUploader from '../components/excel/ExcelUploader';
import DataViewer from '../components/excel/DataViewer';

const Dashboard = () => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center">
            <div className="mr-4">
              <span className="text-sm text-gray-600">Welcome, </span>
              <span className="font-semibold">{currentUser?.name || 'User'}</span>
            </div>
            <button
              onClick={logout}
              className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
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
      </main>
    </div>
  );
};

export default Dashboard;