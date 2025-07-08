import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/health`);
      setTestResult(`✅ Health check successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Health check failed: ${error.message}`);
      console.error('Health check error:', error);
    }
    setLoading(false);
  };

  const testHistoryEndpoint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/history?user=test-user`);
      setTestResult(`✅ History endpoint successful: Found ${response.data.length} items`);
    } catch (error) {
      setTestResult(`❌ History endpoint failed: ${error.message}`);
      console.error('History endpoint error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 rounded p-4 m-4">
      <h3 className="font-bold text-lg mb-4">API Debug Panel</h3>
      <p className="mb-2"><strong>API URL:</strong> {config.API_BASE_URL}</p>
      <p className="mb-2"><strong>Environment:</strong> {import.meta.env.MODE}</p>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={testHealthEndpoint}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Health Endpoint
        </button>
        <button 
          onClick={testHistoryEndpoint}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Test History Endpoint
        </button>
      </div>
      
      {loading && <p>Testing...</p>}
      {testResult && (
        <div className="bg-white p-3 rounded border">
          <strong>Result:</strong> {testResult}
        </div>
      )}
    </div>
  );
};

export default ApiTest;
