const router = require('express').Router();
const fileHistoryQueries = require('../models/fileHistory.model');

// Get all history for a user
router.route('/').get(async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { user } = req.query;
    
    if (!user) {
      return res.status(400).json({ error: 'User parameter is required' });
    }
    
    const result = await pool.query(fileHistoryQueries.findByUser, [user]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching file history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new file history
router.route('/add').post(async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { fileName, uploadDate, size, user } = req.body;
    
    if (!fileName || !uploadDate || !size || !user) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const result = await pool.query(fileHistoryQueries.create, [fileName, uploadDate, size, user]);
    res.json({ message: 'File history added!', data: result.rows[0] });
  } catch (err) {
    console.error('Error adding file history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a file history entry by ID
router.route('/:id').delete(async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid ID is required' });
    }
    
    const result = await pool.query(fileHistoryQueries.deleteById, [parseInt(id)]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'File history not found' });
    }
    
    res.json({ message: 'File history deleted.' });
  } catch (err) {
    console.error('Error deleting file history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
