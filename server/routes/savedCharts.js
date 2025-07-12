const router = require('express').Router();
const SavedChart = require('../models/savedChart.model');

// Get public charts for explore page (must be before /:userId route)
router.get('/public/explore', async (req, res) => {
  try {
    const { page = 1, limit = 12, chartType, sortBy = 'createdAt', sortOrder = 'desc', search, userId } = req.query;
    
    const filter = { isPublic: true };
    if (chartType && chartType !== 'all') {
      filter.chartType = chartType;
    }
    
    if (userId) {
      filter.user = userId;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const charts = await SavedChart.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-chartImageData');

    // If we need user info and don't have userId filter, populate user data
    if (!userId) {
      const UserProfile = require('../models/userProfile.model');
      const chartsWithUsers = await Promise.all(
        charts.map(async (chart) => {
          const user = await UserProfile.findOne({ userId: chart.user }).select('nickname avatar bio jobTitle company location socialLinks skills');
          return {
            ...chart.toObject(),
            user: user || { nickname: 'Anonymous', avatar: '💻|linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
          };
        })
      );
      
      const total = await SavedChart.countDocuments(filter);

      return res.json({
        charts: chartsWithUsers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    }

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
    console.error('Error fetching public charts:', error);
    res.status(500).json({ error: 'Failed to fetch public charts' });
  }
});

// Like/Unlike a chart
router.post('/:chartId/like', async (req, res) => {
  try {
    const { chartId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const chart = await SavedChart.findById(chartId);
    if (!chart) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    // Initialize likes array if it doesn't exist
    if (!chart.likes) {
      chart.likes = [];
    }

    const likeIndex = chart.likes.indexOf(userId);
    let liked = false;

    if (likeIndex > -1) {
      // Unlike - remove user from likes array
      chart.likes.splice(likeIndex, 1);
    } else {
      // Like - add user to likes array
      chart.likes.push(userId);
      liked = true;
    }

    await chart.save();

    res.json({
      liked,
      likesCount: chart.likes.length,
      message: liked ? 'Chart liked' : 'Chart unliked'
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Get public charts for a specific user (for profile viewing)
router.get('/public/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 6 } = req.query;
    
    const filter = { user: userId, isPublic: true };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const charts = await SavedChart.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title chartType createdAt tags likes downloads');

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
    console.error('Error fetching user public charts:', error);
    res.status(500).json({ error: 'Failed to fetch user public charts' });
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

    // Increment download count if it's a public chart being accessed
    if (chart.isPublic) {
      chart.downloads = (chart.downloads || 0) + 1;
      await chart.save();
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

// Development route to create sample public charts (remove in production)
router.post('/create-samples', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Sample creation not allowed in production' });
  }

  try {
    const sampleCharts = [
      {
        title: 'Sales Performance Q1',
        chartType: 'bar',
        chartConfig: {
          xAxis: 'month',
          yAxis: ['sales'],
          chartData: [
            { month: 'Jan', sales: 45000 },
            { month: 'Feb', sales: 52000 },
            { month: 'Mar', sales: 48000 }
          ],
          colors: ['#8884d8']
        },
        fileName: 'Q1_Sales.xlsx',
        user: 'sample_user_1',
        tags: ['sales', 'quarterly', 'performance'],
        isPublic: true,
        likes: ['user1', 'user2'],
        downloads: 25
      },
      {
        title: 'Website Traffic Analytics',
        chartType: 'line',
        chartConfig: {
          xAxis: 'date',
          yAxis: ['visitors'],
          chartData: [
            { date: '2024-01', visitors: 1200 },
            { date: '2024-02', visitors: 1450 },
            { date: '2024-03', visitors: 1680 },
            { date: '2024-04', visitors: 1920 }
          ],
          colors: ['#82ca9d']
        },
        fileName: 'Traffic_Analytics.xlsx',
        user: 'sample_user_2',
        tags: ['analytics', 'web', 'traffic'],
        isPublic: true,
        likes: ['user3', 'user4', 'user5'],
        downloads: 18
      },
      {
        title: 'Market Share Distribution',
        chartType: 'pie',
        chartConfig: {
          xAxis: 'company',
          yAxis: ['share'],
          chartData: [
            { company: 'Company A', share: 35 },
            { company: 'Company B', share: 28 },
            { company: 'Company C', share: 22 },
            { company: 'Others', share: 15 }
          ],
          colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300']
        },
        fileName: 'Market_Share.xlsx',
        user: 'sample_user_3',
        tags: ['market', 'competition', 'analysis'],
        isPublic: true,
        likes: ['user1', 'user6'],
        downloads: 32
      }
    ];

    const createdCharts = await SavedChart.insertMany(sampleCharts);
    res.json({ message: 'Sample charts created successfully', count: createdCharts.length });
  } catch (error) {
    console.error('Error creating sample charts:', error);
    res.status(500).json({ error: 'Failed to create sample charts' });
  }
});

module.exports = router;
