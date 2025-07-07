// API configuration for different environments
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use Netlify Functions
    return '/.netlify/functions';
  } else {
    // In development, use local server
    return 'http://localhost:5000';
  }
};

export const API_BASE_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  HISTORY: `${API_BASE_URL}/history`,
  HISTORY_ADD: `${API_BASE_URL}/history`, // POST to same endpoint
  HISTORY_DELETE: (id) => `${API_BASE_URL}/history-delete?id=${id}`, // DELETE with ID as query param
};
