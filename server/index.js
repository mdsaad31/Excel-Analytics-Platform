const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://excel-analytics-frontend.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
const historyRouter = require('./routes/history');
app.use('/history', historyRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
