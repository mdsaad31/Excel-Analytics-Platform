const express = require('express');
const router = express.Router();
const UserProfile = require('../models/userProfile.model');
const SavedChart = require('../models/savedChart.model');
const FileHistory = require('../models/fileHistory.model');

const checkJwt = require('../middleware/auth');

// Middleware to check for admin role
const isAdmin = async (req, res, next) => {
  try {
    const user = await UserProfile.findOne({ userId: req.auth.payload.sub });
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Apply admin middleware to all routes in this file
router.use(checkJwt, isAdmin);

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await UserProfile.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const updatedUser = await UserProfile.findOneAndUpdate({ userId: req.params.userId }, { role }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const deletedUser = await UserProfile.findOneAndDelete({ userId: req.params.userId });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Chart Management
router.get('/charts', async (req, res) => {
    try {
        const charts = await SavedChart.find({ isPublic: true });
        res.json(charts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public charts' });
    }
});

router.delete('/charts/:chartId', async (req, res) => {
    try {
        const deletedChart = await SavedChart.findByIdAndDelete(req.params.chartId);
        if (!deletedChart) {
            return res.status(404).json({ message: 'Chart not found' });
        }
        res.json({ message: 'Chart deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting chart' });
    }
});

// File Management
router.get('/files', async (req, res) => {
    try {
        const files = await FileHistory.find();
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files' });
    }
});

router.delete('/files/:fileId', async (req, res) => {
    try {
        const deletedFile = await FileHistory.findByIdAndDelete(req.params.fileId);
        if (!deletedFile) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting file' });
    }
});


// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const userCount = await UserProfile.countDocuments();
    const chartCount = await SavedChart.countDocuments();
    const fileCount = await FileHistory.countDocuments();
    const publicChartCount = await SavedChart.countDocuments({ isPublic: true });

    res.json({
      userCount,
      chartCount,
      fileCount,
      publicChartCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

module.exports = router;
