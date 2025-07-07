const connectToDatabase = require('./db');
const FileHistory = require('./models/fileHistory.model');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    await connectToDatabase();
    
    const { httpMethod, queryStringParameters } = event;
    
    // Extract ID from query parameters for DELETE requests
    const id = queryStringParameters?.id;
    
    if (httpMethod === 'DELETE' && id) {
      await FileHistory.findByIdAndDelete(id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'File history deleted.' }),
      };
    }
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message }),
    };
  }
};
