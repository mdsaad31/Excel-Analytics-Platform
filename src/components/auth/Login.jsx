import React from 'react';
import { useAuth } from './AuthContext';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome to Excel Analytics</h2>
        <p className="text-gray-600 mb-8">Please log in to continue</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          onClick={() => login({ screen_hint: 'signup' })}
        >
          Log In or Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
