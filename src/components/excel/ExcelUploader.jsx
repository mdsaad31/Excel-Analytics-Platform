import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { parseExcelFile } from './ExcelParser';
import config from '../../config/api';
import NotificationUtil from '../../utils/notificationUtil';

const ExcelUploader = ({ onDataParsed }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Please select a valid Excel or CSV file.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsedData = await parseExcelFile(selectedFile);
      onDataParsed(parsedData);

      // Send file upload notification
      if (currentUser) {
        await NotificationUtil.sendFileUploadNotification(currentUser.sub, selectedFile.name, selectedFile.size);
      }

      if (currentUser) {
        // Check file size (1MB = 1024 * 1024 bytes)
        const MAX_FILE_SIZE = 1024 * 1024; // 1MB
        const fileSizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
        
        // Create a file hash for duplicate detection
        const fileHash = await generateFileHash(selectedFile);
        
        // Check if file already exists
        const existingFile = await checkFileExists(fileHash, currentUser.sub);
        
        if (existingFile) {
          // File already exists, just update the upload date
          const updateData = {
            uploadDate: new Date(),
          };
          
          try {
            await axios.put(`${config.API_BASE_URL}/history/${existingFile._id}`, updateData);
            setError(''); // Clear any previous errors
            alert(`File already exists! Linked to existing file uploaded on ${new Date(existingFile.uploadDate).toLocaleDateString()}`);
          } catch (updateError) {
            console.error('Error updating existing file:', updateError);
            // Continue with normal upload if update fails
          }
        } else {
          // New file, proceed with upload
          let fileContent = null;
          
          if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File size (${fileSizeInMB} MB) exceeds the 1MB limit. Only metadata will be stored.`);
            // Don't return here, continue with metadata-only storage
          } else {
            // Convert file to base64 for storage
            const fileReader = new FileReader();
            const fileContentPromise = new Promise((resolve, reject) => {
              fileReader.onload = (e) => resolve(e.target.result);
              fileReader.onerror = reject;
              fileReader.readAsDataURL(selectedFile);
            });

            fileContent = await fileContentPromise;
          }

          const historyData = {
            fileName: selectedFile.name,
            uploadDate: new Date(),
            size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
            user: currentUser.sub,
            fileContent: fileContent, // Base64 encoded file content (null if too large)
            parsedData: parsedData, // Parsed Excel data
            fileType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            originalSize: selectedFile.size,
            fileHash: fileHash, // Add file hash for duplicate detection
          };
          
          try {
            await axios.post(`${config.API_BASE_URL}/history/add`, historyData);
          } catch (historyError) {
            console.error('Error saving to history:', historyError);
            // Don't throw this error as the file parsing was successful
          }
        }
      }

    } catch (err) {
      console.error('Error parsing or uploading Excel file:', err);
      setError(`Failed to process file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Please drop a valid Excel or CSV file.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  // Helper function to generate file hash for duplicate detection
  const generateFileHash = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Helper function to check if file already exists
  const checkFileExists = async (fileHash, userId) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/history/check-duplicate`, {
        params: { fileHash, user: userId }
      });
      return response.data.exists ? response.data.file : null;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-500 transition-all"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          accept=".xlsx,.xls,.csv" 
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        <p className="mt-2 text-sm text-gray-600">
          {selectedFile 
            ? `Selected: ${selectedFile.name}` 
            : 'Drop your Excel file here or click to browse'
          }
        </p>
        
        <p className="mt-1 text-xs text-gray-500">
          Supports .xlsx, .xls, .csv files (max 1MB for complete storage)
        </p>
        
        {selectedFile && selectedFile.size > 1024 * 1024 && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <strong>Note:</strong> File size ({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds 1MB limit. 
            Only metadata and parsed data will be stored.
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Processing...' : 'Upload and Process File'}
        </button>
      </div>
    </div>
  );
};

export default ExcelUploader;
