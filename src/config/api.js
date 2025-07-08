const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://excel-analytics-api.onrender.com',
  }
};

const environment = import.meta.env.MODE || 'development';

export default config[environment];
