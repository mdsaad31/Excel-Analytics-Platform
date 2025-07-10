# Notification System Documentation

## Overview
The notification system provides real-time feedback to users about important events and actions in the analytics platform. It includes both backend notification management and frontend notification display components.

## Features

### 📢 Notification Types
- **Welcome notifications** - When users sign in
- **File upload notifications** - When files are successfully uploaded
- **Chart download notifications** - When charts are exported (PNG, PDF)
- **Chart save notifications** - When charts are saved to user's collection
- **Profile update notifications** - When user profile is updated
- **Analysis complete notifications** - When data analysis is finished
- **Success/Error/Warning/Info notifications** - General system feedback

### 🎨 UI Components
- **Notification Bell** - Shows unread count with animated badge
- **Notification Dropdown** - Displays recent notifications with actions
- **Notification Items** - Individual notification display with metadata
- **Toast Notifications** - Non-intrusive popup notifications (future enhancement)

### 🔧 Backend Features
- **Notification persistence** - Stored in MongoDB with expiration
- **User-specific notifications** - Filtered by user ID
- **Notification status tracking** - Read/unread, archived states
- **Automatic cleanup** - Old notifications are automatically removed
- **Priority levels** - Low, medium, high, urgent priority support

## Implementation

### Backend Components

#### 1. Notification Model (`server/models/notification.model.js`)
```javascript
const notificationSchema = new Schema({
  userId: String,           // User identifier
  type: String,            // Notification type (welcome, file_upload, etc.)
  title: String,           // Notification title
  message: String,         // Notification message
  icon: String,            // Emoji icon
  priority: String,        // Priority level
  isRead: Boolean,         // Read status
  isArchived: Boolean,     // Archive status
  metadata: Object,        // Additional data
  expiresAt: Date,         // Auto-expiration date
  actionUrl: String,       // Optional action URL
  actionLabel: String      // Optional action label
});
```

#### 2. Notification Routes (`server/routes/notifications.js`)
- `GET /:userId` - Get user notifications with pagination
- `GET /:userId/unread-count` - Get unread notification count
- `PATCH /:id/read` - Mark notification as read
- `PATCH /:userId/mark-all-read` - Mark all notifications as read
- `DELETE /:id` - Delete notification
- `PATCH /:id/archive` - Archive notification
- `POST /` - Create new notification

#### 3. Notification Service (`server/utils/notificationService.js`)
Utility class for creating different types of notifications:
- `sendWelcomeNotification()`
- `sendFileUploadNotification()`
- `sendChartDownloadNotification()`
- `sendChartSaveNotification()`
- `sendProfileUpdateNotification()`
- And more...

### Frontend Components

#### 1. Notification Context (`src/components/notifications/NotificationContext.jsx`)
React context that provides:
- Notification state management
- API calls for CRUD operations
- Real-time notification updates
- Dropdown state management

#### 2. Notification Bell (`src/components/notifications/NotificationBell.jsx`)
Displays the notification bell icon with:
- Unread count badge
- Animated pulse effect
- Accessibility features

#### 3. Notification Dropdown (`src/components/notifications/NotificationDropdown.jsx`)
Shows notifications in a dropdown with:
- Recent notifications list
- Mark as read functionality
- Delete/archive actions
- Loading states

#### 4. Notification Item (`src/components/notifications/NotificationItem.jsx`)
Individual notification display with:
- Title and message
- Time ago display
- Priority indicators
- Action buttons

#### 5. Notification Utility (`src/utils/notificationUtil.js`)
Frontend utility for sending notifications:
- Consistent API calls
- Error handling
- File size formatting
- Type-specific notification helpers

## Usage Examples

### Backend - Sending Notifications
```javascript
const NotificationService = require('../utils/notificationService');

// Welcome notification
await NotificationService.sendWelcomeNotification(userId, userName);

// File upload notification
await NotificationService.sendFileUploadNotification(userId, fileName, fileSize);

// Chart download notification
await NotificationService.sendChartDownloadNotification(userId, chartName, 'PNG');
```

### Frontend - Using Notification Context
```jsx
import { useNotifications } from './components/notifications/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notification => (
        <div key={notification._id} onClick={() => markAsRead(notification._id)}>
          {notification.title}
        </div>
      ))}
    </div>
  );
}
```

### Frontend - Sending Notifications
```jsx
import NotificationUtil from '../utils/notificationUtil';

// Send success notification
await NotificationUtil.sendSuccessNotification(
  userId,
  'Operation Complete',
  'Your request has been processed successfully'
);
```

## Integration Points

### 1. Authentication (`src/components/auth/AuthContext.jsx`)
- Sends welcome notifications when users log in
- Automatically triggered on authentication

### 2. File Upload (`src/components/excel/ExcelUploader.jsx`)
- Sends upload notifications when files are processed
- Includes file name and size information

### 3. Chart Export (`src/utils/chartExport.js`)
- Sends download notifications for PNG and PDF exports
- Includes chart name and format information

### 4. Chart Saving (`src/components/charts/SaveChartModal.jsx`)
- Sends save notifications when charts are saved
- Includes chart name and type information

### 5. Profile Updates (`src/pages/Settings.jsx`)
- Sends update notifications when profile is modified
- Confirms successful profile changes

## Styling

### CSS Classes (`src/styles/notifications.css`)
- `.notification-bell` - Bell button styling
- `.notification-badge` - Unread count badge
- `.notification-dropdown` - Dropdown container
- `.notification-item` - Individual notification
- `.notification-icon` - Icon styling with type colors
- Dark mode and responsive design support

### Key Features
- **Responsive design** - Works on mobile and desktop
- **Dark mode support** - Automatically adapts to theme
- **Accessibility** - ARIA labels and keyboard navigation
- **Animation** - Smooth transitions and hover effects
- **High contrast** - Supports high contrast mode

## Configuration

### Environment Variables
```bash
# MongoDB connection for notification storage
MONGODB_URI=mongodb://localhost:27017/analytics

# API base URL for notification endpoints
API_BASE_URL=http://localhost:5000
```

### Notification Types
```javascript
const NOTIFICATION_TYPES = {
  WELCOME: 'welcome',
  FILE_UPLOAD: 'file_upload',
  CHART_DOWNLOAD: 'chart_download',
  CHART_SAVE: 'chart_save',
  PROFILE_UPDATE: 'profile_update',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};
```

### Priority Levels
```javascript
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};
```

## Best Practices

### 1. Notification Timing
- Send notifications immediately after successful operations
- Use appropriate priority levels
- Include relevant action URLs when possible

### 2. Message Content
- Keep titles concise and descriptive
- Include specific details in messages
- Use appropriate emoji icons for visual appeal

### 3. User Experience
- Don't spam users with excessive notifications
- Provide clear actions for notifications
- Auto-expire old notifications to keep the system clean

### 4. Performance
- Paginate notification lists for better performance
- Cache unread counts for faster loading
- Use indexes on database queries

## Future Enhancements

### 1. Real-time Updates
- WebSocket/Socket.io integration for live notifications
- Server-sent events for real-time updates
- Push notifications for mobile devices

### 2. Advanced Features
- Notification categories and filtering
- User notification preferences
- Bulk notification actions
- Email notification summaries

### 3. Analytics
- Notification engagement tracking
- User interaction analytics
- Performance metrics and monitoring

## Troubleshooting

### Common Issues
1. **Notifications not appearing** - Check API connectivity and user authentication
2. **Duplicate notifications** - Ensure notification utility is called only once per action
3. **Performance issues** - Check database indexes and pagination settings
4. **Styling issues** - Verify CSS imports and class names

### Debug Tools
- Browser developer tools for frontend debugging
- Server logs for backend notification creation
- MongoDB queries for notification data inspection
- Network tab for API call monitoring

## Testing

### Unit Tests
- Test notification creation and retrieval
- Test notification state management
- Test UI component rendering and interactions

### Integration Tests
- Test end-to-end notification flow
- Test notification triggers from user actions
- Test notification persistence and cleanup

### Manual Testing Checklist
- [ ] Welcome notification on login
- [ ] File upload notification
- [ ] Chart download notification (PNG/PDF)
- [ ] Chart save notification
- [ ] Profile update notification
- [ ] Mark as read functionality
- [ ] Delete notification functionality
- [ ] Responsive design on mobile
- [ ] Dark mode appearance
- [ ] Accessibility features

## Conclusion

The notification system provides a comprehensive solution for user feedback and engagement in the analytics platform. It's designed to be scalable, maintainable, and user-friendly while providing developers with easy-to-use APIs for integration throughout the application.
