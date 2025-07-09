const router = require('express').Router();
let FileHistory = require('../models/fileHistory.model');

router.route('/').get(async (req, res) => {
  try {
    const history = await FileHistory.find({ user: req.query.user })
      .select('-fileContent') // Exclude large file content from list view
      .sort({ uploadDate: -1 }); // Sort by newest first
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(400).json({ error: 'Error fetching history', details: err.message });
  }
});

router.route('/add').post(async (req, res) => {
  try {
    const { 
      fileName, 
      uploadDate, 
      size, 
      user, 
      fileContent, 
      parsedData, 
      fileType, 
      originalSize,
      fileHash
    } = req.body;

    // Validate required fields
    if (!fileName || !uploadDate || !size || !user) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newFileHistory = new FileHistory({
      fileName,
      uploadDate,
      size,
      user,
      fileContent,
      parsedData,
      fileType,
      originalSize,
      fileHash,
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

// Get file content for download
router.route('/:id/download').get(async (req, res) => {
  try {
    const fileHistory = await FileHistory.findById(req.params.id);
    
    if (!fileHistory) {
      return res.status(404).json({ error: 'File history item not found' });
    }
    
    if (!fileHistory.fileContent) {
      return res.status(404).json({ error: 'File content not available' });
    }
    
    // Extract the base64 content (remove data:mime;base64, prefix)
    const base64Data = fileHistory.fileContent.split(',')[1];
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    // Set appropriate headers
    res.setHeader('Content-Type', fileHistory.fileType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileHistory.fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
  } catch (err) {
    console.error('Error downloading file:', err);
    res.status(500).json({ error: 'Error downloading file', details: err.message });
  }
});

// Get parsed data for a file
router.route('/:id/data').get(async (req, res) => {
  try {
    const fileHistory = await FileHistory.findById(req.params.id);
    
    if (!fileHistory) {
      return res.status(404).json({ error: 'File history item not found' });
    }
    
    if (!fileHistory.parsedData) {
      return res.status(404).json({ error: 'Parsed data not available' });
    }
    
    res.json({ 
      parsedData: fileHistory.parsedData,
      fileName: fileHistory.fileName,
      uploadDate: fileHistory.uploadDate
    });
  } catch (err) {
    console.error('Error fetching parsed data:', err);
    res.status(500).json({ error: 'Error fetching parsed data', details: err.message });
  }
});

// Get full file details including content
router.route('/:id').get(async (req, res) => {
  try {
    const fileHistory = await FileHistory.findById(req.params.id);
    
    if (!fileHistory) {
      return res.status(404).json({ error: 'File history item not found' });
    }
    
    res.json(fileHistory);
  } catch (err) {
    console.error('Error fetching file history:', err);
    res.status(500).json({ error: 'Error fetching file history', details: err.message });
  }
});

// Check if file already exists (duplicate detection)
router.route('/check-duplicate').get(async (req, res) => {
  try {
    const { fileHash, user } = req.query;
    
    if (!fileHash || !user) {
      return res.status(400).json({ error: 'Missing fileHash or user parameter' });
    }
    
    const existingFile = await FileHistory.findOne({ fileHash, user });
    
    if (existingFile) {
      res.json({ exists: true, file: existingFile });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking duplicate file:', err);
    res.status(500).json({ error: 'Error checking duplicate file', details: err.message });
  }
});

// Update file history entry
router.route('/:id').put(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedFile = await FileHistory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedFile) {
      return res.status(404).json({ error: 'File history item not found' });
    }
    
    res.json({ message: 'File history updated successfully', data: updatedFile });
  } catch (err) {
    console.error('Error updating file history:', err);
    res.status(500).json({ error: 'Error updating file history', details: err.message });
  }
});

module.exports = router;
