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
    
    const { httpMethod, queryStringParameters, body } = event;
    
    switch (httpMethod) {
      case 'GET':
        // Get all history for a user
        const user = queryStringParameters?.user;
        if (!user) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User parameter is required' }),
          };
        }
        
        const history = await FileHistory.find({ user });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(history),
        };
        
      case 'POST':
        // Add new file history
        const { fileName, uploadDate, size, user: postUser } = JSON.parse(body);
        
        const newFileHistory = new FileHistory({
          fileName,
          uploadDate,
          size,
          user: postUser,
        });
        
        await newFileHistory.save();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'File history added!' }),
        };
        
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message }),
    };
  }
};
