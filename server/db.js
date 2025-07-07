const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database!');
  client.query('CREATE TABLE IF NOT EXISTS file_history (id SERIAL PRIMARY KEY, fileName VARCHAR(255) NOT NULL, uploadDate TIMESTAMP NOT NULL, size VARCHAR(255) NOT NULL, "user" VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)', (err, result) => {
    release();
    if (err) {
      return console.error('Error creating table', err.stack);
    }
    console.log('file_history table ensured!');
  });
});

module.exports = { pool };
