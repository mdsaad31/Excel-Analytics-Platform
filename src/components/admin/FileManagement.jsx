import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../config/api';
import { useAuth0 } from '@auth0/auth0-react';

const FileManagement = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  const fetchFiles = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${api.API_BASE_URL}/admin/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const deleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const token = await getAccessTokenSilently();
        await axios.delete(`${api.API_BASE_URL}/admin/files/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchFiles(); // Refresh files after delete
      } catch (error) {
        console.error('Error deleting file', error);
      }
    }
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">File Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">File Name</th>
            <th className="py-2">Uploaded By</th>
            <th className="py-2">Upload Date</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file._id}>
              <td className="border px-4 py-2">{file.originalName}</td>
              <td className="border px-4 py-2">{file.userId}</td>
              <td className="border px-4 py-2">{new Date(file.uploadDate).toLocaleDateString()}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => deleteFile(file._id)}
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

export default FileManagement;
