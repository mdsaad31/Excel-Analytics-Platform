const router = require('express').Router();
const { pool } = require('../db');

// Get all history for a user
router.route('/').get(async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM file_history WHERE "user" = $1 ORDER BY uploadDate DESC', [req.query.user]);
    res.json(rows);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add new file history
router.route('/add').post(async (req, res) => {
  try {
    const { fileName, uploadDate, size, user } = req.body;

    await pool.query(
      'INSERT INTO file_history (fileName, uploadDate, size, "user") VALUES ($1, $2, $3, $4)',
      [fileName, uploadDate, size, user]
    );
    res.json('File history added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete a file history entry by ID
router.route('/:id').delete(async (req, res) => {
  try {
    await pool.query('DELETE FROM file_history WHERE id = $1', [req.params.id]);
    res.json('File history deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;