const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB database connection established successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const historyRouter = require('../../server/routes/history');
app.use('/api/history', historyRouter);

module.exports.handler = serverless(app);
