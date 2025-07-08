const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://excel-analytics-api.onrender.com',
  }
};

const environment = import.meta.env.MODE || 'development';

// Log the configuration for debugging
console.log('Environment:', environment);
console.log('API Base URL:', config[environment].API_BASE_URL);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

export default config[environment];
