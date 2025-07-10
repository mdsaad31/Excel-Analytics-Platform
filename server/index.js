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

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL, 
          'https://excel-analytics-frontend.onrender.com',
          /\.onrender\.com$/
        ]
      : ['http://localhost:3000', 'http://localhost:5173'];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

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

// Import keep-alive service and cron jobs
const keepAliveService = require('./utils/keepAlive');
const cronJobService = require('./utils/cronJobs');

const historyRouter = require('./routes/history');
const savedChartsRouter = require('./routes/savedCharts');
const healthRouter = require('./routes/health');
const userProfileRouter = require('./routes/userProfile');
const notificationsRouter = require('./routes/notifications');

app.use('/history', historyRouter);
app.use('/saved-charts', savedChartsRouter);
app.use('/health', healthRouter);
app.use('/user-profile', userProfileRouter);
app.use('/notifications', notificationsRouter);

// Legacy health endpoint for backward compatibility
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  
  // Start keep-alive service only in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🚀 Starting production services...');
    
    // Start keep-alive service after a short delay
    setTimeout(() => {
      keepAliveService.start();
    }, 5000); // 5 second delay
    
    // Start cron job service
    setTimeout(() => {
      cronJobService.start();
    }, 10000); // 10 second delay
  } else {
    console.log('⚠️ Development mode - keep-alive service disabled');
    console.log('💡 To test keep-alive locally, set NODE_ENV=production');
  }
});
