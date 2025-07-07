const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_history (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        upload_date TIMESTAMP NOT NULL,
        size VARCHAR(50) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  } finally {
    client.release();
  }
}

// Initialize tables on startup
initializeTables();

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('PostgreSQL database connection established successfully');
    release();
  }
});

// Make pool available to routes
app.locals.pool = pool;

const historyRouter = require('./routes/history');
app.use('/history', historyRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
