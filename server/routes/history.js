const router = require('express').Router();
let FileHistory = require('../models/fileHistory.model');

router.route('/').get(async (req, res) => {
  try {
    const history = await FileHistory.find({ user: req.query.user });
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(400).json({ error: 'Error fetching history', details: err.message });
  }
});

router.route('/add').post(async (req, res) => {
  try {
    const { fileName, uploadDate, size, user } = req.body;

    // Validate required fields
    if (!fileName || !uploadDate || !size || !user) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newFileHistory = new FileHistory({
      fileName,
      uploadDate,
      size,
      user,
    });

    const savedHistory = await newFileHistory.save();
    res.json({ message: 'File history added!', data: savedHistory });
  } catch (err) {
    console.error('Error adding file history:', err);
    res.status(400).json({ error: 'Error adding file history', details: err.message });
  }
});

router.route('/:id').delete(async (req, res) => {
  try {
    const deletedItem = await FileHistory.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: 'File history item not found' });
    }
    
    res.json({ message: 'File history deleted.', data: deletedItem });
  } catch (err) {
    console.error('Error deleting file history:', err);
    res.status(400).json({ error: 'Error deleting file history', details: err.message });
  }
});

module.exports = router;
