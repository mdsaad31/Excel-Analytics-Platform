import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../config/api';
import { useAuth0 } from '@auth0/auth0-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  const fetchUsers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${api.API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId, role) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.put(
        `${api.API_BASE_URL}/admin/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh users after update
    } catch (error) {
      console.error('Error updating user role', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = await getAccessTokenSilently();
        await axios.delete(`${api.API_BASE_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers(); // Refresh users after delete
      } catch (error) {
        console.error('Error deleting user', error);
      }
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nickname</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td className="border px-4 py-2">{user.nickname}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.userId, e.target.value)}
                  className="mr-2"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  onClick={() => deleteUser(user.userId)}
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

export default UserManagement;
