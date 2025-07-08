const router = require('express').Router();
let FileHistory = require('../models/fileHistory.model');

router.route('/').get(async (req, res) => {
  try {
    console.log('Received GET request for history with user:', req.query.user);
    const history = await FileHistory.find({ user: req.query.user });
    console.log('Found history items:', history.length);
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(400).json({ error: 'Error fetching history', details: err.message });
  }
});

router.route('/add').post(async (req, res) => {
  try {
    console.log('Received POST request to /history/add');
    console.log('Request body:', req.body);
    
    const { fileName, uploadDate, size, user } = req.body;

    // Validate required fields
    if (!fileName || !uploadDate || !size || !user) {
      console.log('Missing required fields:', { fileName, uploadDate, size, user });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newFileHistory = new FileHistory({
      fileName,
      uploadDate,
      size,
      user,
    });

    console.log('Attempting to save:', newFileHistory);
    const savedHistory = await newFileHistory.save();
    console.log('Successfully saved:', savedHistory);
    
    res.json({ message: 'File history added!', data: savedHistory });
  } catch (err) {
    console.error('Error adding file history:', err);
    res.status(400).json({ error: 'Error adding file history', details: err.message });
  }
});

router.route('/:id').delete(async (req, res) => {
  try {
    console.log('Received DELETE request for ID:', req.params.id);
    
    const deletedItem = await FileHistory.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      console.log('No item found with ID:', req.params.id);
      return res.status(404).json({ error: 'File history item not found' });
    }
    
    console.log('Successfully deleted:', deletedItem);
    res.json({ message: 'File history deleted.', data: deletedItem });
  } catch (err) {
    console.error('Error deleting file history:', err);
    res.status(400).json({ error: 'Error deleting file history', details: err.message });
  }
});

module.exports = router;
