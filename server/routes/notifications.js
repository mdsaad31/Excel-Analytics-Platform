const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      unreadOnly = false,
      type,
      priority,
      category 
    } = req.query;

    const query = { userId };
    
    // Add filters
    if (unreadOnly === 'true') query.isRead = false;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    // Don't show archived notifications by default
    query.isArchived = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false, 
      isArchived: false 
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({ 
      userId, 
      isRead: false, 
      isArchived: false 
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { userId, type, customData = {} } = req.body;
    
    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }

    // Get template for the notification type
    const template = Notification.getTemplate(type, customData);
    
    const notificationData = {
      userId,
      type,
      ...template,
      metadata: customData,
    };

    const notification = await Notification.createNotification(notificationData);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany(
      { userId, isRead: false, isArchived: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Archive notification
router.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.archive();
    res.json(notification);
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({ error: 'Failed to archive notification' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create welcome notification for new user
router.post('/welcome/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notification = await Notification.createNotification({
      userId,
      type: 'welcome',
      ...Notification.getTemplate('welcome'),
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating welcome notification:', error);
    res.status(500).json({ error: 'Failed to create welcome notification' });
  }
});

// Bulk create notifications for system updates
router.post('/bulk', async (req, res) => {
  try {
    const { userIds, type, customData = {} } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !type) {
      return res.status(400).json({ error: 'userIds array and type are required' });
    }

    const template = Notification.getTemplate(type, customData);
    
    const notifications = userIds.map(userId => ({
      userId,
      type,
      ...template,
      metadata: customData,
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    res.status(201).json({ 
      message: `${createdNotifications.length} notifications created`,
      notifications: createdNotifications 
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({ error: 'Failed to create bulk notifications' });
  }
});

// Get notification statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await Notification.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          }
        }
      }
    ]);

    const priorityStats = await Notification.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ 
      byType: stats,
      byPriority: priorityStats 
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

module.exports = router;
