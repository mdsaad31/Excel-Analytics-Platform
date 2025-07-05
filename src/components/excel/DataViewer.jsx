import React, { useState, useEffect } from 'react';
import { getDataSummary } from './ExcelParser';

const DataViewer = ({ data, activeSheet }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  
  const sheetData = data?.sheets?.[activeSheet] || [];
  const headers = data?.headers?.[activeSheet] || [];

  useEffect(() => {
    if (sheetData.length > 0) {
      const dataSummary = getDataSummary(sheetData);
      setSummary(dataSummary);
    }
  }, [sheetData]);

  const filteredData = sheetData.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        No data available. Please upload an Excel file.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {activeSheet} ({filteredData.length} rows)
        </h2>
        
        <div className="flex space-x-4 items-center mt-2 sm:mt-0">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            onClick={() => setShowSummary(!showSummary)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            {showSummary ? 'Hide Summary' : 'Show Summary'}
          </button>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search data..."
              className="border rounded px-3 py-1 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
      
      {showSummary && Object.keys(summary).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <h3 className="text-md font-medium text-gray-700 mb-2">Numerical Summary</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Column</th>
                <th className="py-2 px-3 text-right">Count</th>
                <th className="py-2 px-3 text-right">Min</th>
                <th className="py-2 px-3 text-right">Max</th>
                <th className="py-2 px-3 text-right">Sum</th>
                <th className="py-2 px-3 text-right">Mean</th>
                <th className="py-2 px-3 text-right">Median</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([column, stats]) => (
                <tr key={column} className="border-t">
                  <td className="py-2 px-3 font-medium">{column}</td>
                  <td className="py-2 px-3 text-right">{stats.count}</td>
                  <td className="py-2 px-3 text-right">{stats.min.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{stats.max.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{stats.sum.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{stats.mean.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right">{stats.median.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredData.length > rowsPerPage && (
        <div className="flex items-center justify-between py-3 bg-white border-t mt-4">
          <div className="flex items-center">
            <select
              className="text-sm border-gray-300 rounded mr-2"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>
                  {n} rows
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
            </span>
          </div>
          
          <div className="flex">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-l border border-r-0 bg-white disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map((page) => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`px-3 py-1 text-sm border-t border-b ${
                  currentPage === page + 1
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'bg-white'
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-r border border-l-0 bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataViewer;