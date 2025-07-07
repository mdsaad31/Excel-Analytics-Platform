const express = require('express');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Import database connection and table creation
require('./db');

const historyRouter = require('./routes/history');
app.use('/history', historyRouter);

module.exports.handler = serverless(app, { base: '/.netlify/functions/api' });