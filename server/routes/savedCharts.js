const router = require('express').Router();
const SavedChart = require('../models/savedChart.model');

// Get all saved charts for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, chartType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filter = { user: userId };
    if (chartType && chartType !== 'all') {
      filter.chartType = chartType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const charts = await SavedChart.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-chartImageData'); // Exclude large image data from list view

    const total = await SavedChart.countDocuments(filter);

    res.json({
      charts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching saved charts:', error);
    res.status(500).json({ error: 'Failed to fetch saved charts' });
  }
});

// Get a specific saved chart with full data
router.get('/chart/:chartId', async (req, res) => {
  try {
    const { chartId } = req.params;
    const chart = await SavedChart.findById(chartId);
    
    if (!chart) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    res.json(chart);
  } catch (error) {
    console.error('Error fetching chart:', error);
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

// Save a new chart
router.post('/', async (req, res) => {
  try {
    const {
      title,
      chartType,
      chartConfig,
      chartImageData,
      fileName,
      user,
      tags = [],
      isPublic = false
    } = req.body;

    // Validate required fields
    if (!title || !chartType || !chartConfig || !fileName || !user) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, chartType, chartConfig, fileName, user' 
      });
    }

    const newChart = new SavedChart({
      title,
      chartType,
      chartConfig,
      chartImageData,
      fileName,
      user,
      tags,
      isPublic
    });

    const savedChart = await newChart.save();
    
    // Return chart without image data to reduce response size
    const { chartImageData: _, ...chartResponse } = savedChart.toObject();
    
    res.status(201).json(chartResponse);
  } catch (error) {
    console.error('Error saving chart:', error);
    res.status(500).json({ error: 'Failed to save chart' });
  }
});

// Update a saved chart
router.put('/:chartId', async (req, res) => {
  try {
    const { chartId } = req.params;
    const updateData = req.body;

    const updatedChart = await SavedChart.findByIdAndUpdate(
      chartId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedChart) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    res.json(updatedChart);
  } catch (error) {
    console.error('Error updating chart:', error);
    res.status(500).json({ error: 'Failed to update chart' });
  }
});

// Delete a saved chart
router.delete('/:chartId', async (req, res) => {
  try {
    const { chartId } = req.params;
    
    const deletedChart = await SavedChart.findByIdAndDelete(chartId);
    
    if (!deletedChart) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    res.json({ message: 'Chart deleted successfully' });
  } catch (error) {
    console.error('Error deleting chart:', error);
    res.status(500).json({ error: 'Failed to delete chart' });
  }
});

// Get chart statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalCharts = await SavedChart.countDocuments({ user: userId });
    
    const chartTypeStats = await SavedChart.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$chartType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentCharts = await SavedChart.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title chartType createdAt');

    res.json({
      totalCharts,
      chartTypeStats,
      recentCharts
    });
  } catch (error) {
    console.error('Error fetching chart statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
