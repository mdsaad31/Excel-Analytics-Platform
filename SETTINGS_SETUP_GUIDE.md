# Settings Feature Installation Guide

## Quick Setup

### 1. Backend Setup
The backend components are already configured. The following files were added:
- `server/models/userProfile.model.js` - User profile database model
- `server/routes/userProfile.js` - API routes for user profile management
- Updated `server/index.js` to include the new routes

### 2. Frontend Setup
The frontend components are ready. The following files were added:
- `src/pages/Settings.jsx` - Main settings page component
- `src/styles/settings.css` - Settings-specific styles
- `src/utils/profileTestSuite.js` - Testing utilities
- Updated `src/App.jsx` to include the settings route
- Updated `src/components/Header.jsx` to display user avatars
- Updated `src/components/Sidebar.jsx` to link to settings

### 3. Database Collections
The following MongoDB collections will be created automatically:
- `userprofiles` - Stores user profile information

## Features Ready to Use

### ✅ Profile Information
- Random avatar assignment (600+ unique combinations)
- Unique nickname system with availability checking
- Bio section with character counting
- Profile completeness tracking

### ✅ Contact & Work
- Email, phone, job title, company, department, location
- All fields are optional except email

### ✅ Social Links
- 12 different social platforms supported
- Twitter, LinkedIn, GitHub, Facebook, Instagram, YouTube, TikTok, Discord, Reddit, Telegram, Website, Other

### ✅ Preferences
- Theme settings (Light/Dark/System)
- Language and timezone preferences
- Date format options
- Notification preferences (Email, Push, Marketing, Updates)
- Privacy settings (Profile visibility, Email visibility, Online status)
- Dashboard preferences (Default view, Charts per page, Auto-save, Tutorials)

## How to Access

1. **Start the servers** (if not already running):
   ```bash
   # Frontend
   npm run dev

   # Backend (in a separate terminal)
   cd server
   node index.js
   ```

2. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

3. **Navigate to Settings**:
   - Log in to the application
   - Click on your profile avatar in the top-right corner
   - Select "Settings" from the dropdown menu
   - Or navigate directly to `/settings`

## Testing the Features

### Manual Testing
1. Open the application in your browser
2. Log in with your Auth0 credentials
3. Navigate to Settings
4. Test all tabs: Profile Information, Contact & Work, Social Links, Preferences
5. Try changing your avatar and nickname
6. Save changes and verify they persist

### Automated Testing
1. Open browser developer tools
2. Go to the Console tab
3. Run the test suite:
   ```javascript
   testAPI.runAllTests()
   ```

## API Endpoints

All endpoints are prefixed with `/user-profile`:

- `GET /:userId` - Get user profile
- `PUT /:userId` - Update user profile
- `POST /check-nickname` - Check nickname availability
- `GET /avatar/random` - Get random avatar
- `GET /nickname/random` - Get random nickname
- `GET /avatars/all` - Get all available avatars
- `DELETE /:userId` - Delete user profile

## Environment Variables

Make sure you have the following environment variables set:
- `MONGODB_URI` - MongoDB connection string
- `VITE_API_URL` - Backend API URL (for production)
- Auth0 configuration variables

## Production Deployment

### Backend
- The user profile routes are already integrated into the main server
- MongoDB collections will be created automatically
- No additional configuration needed

### Frontend
- The Settings page is integrated into the main app routing
- All components are responsive and accessible
- CSS styles are optimized for production

## Troubleshooting

### Common Issues

1. **"Profile not found" error**:
   - Profiles are created automatically on first access
   - Check MongoDB connection

2. **Avatar not displaying**:
   - Verify the avatar string format (emoji|gradient)
   - Check CSS loading

3. **Nickname not available**:
   - Try a different nickname
   - Use the random nickname generator

4. **Settings not saving**:
   - Check browser console for errors
   - Verify backend server is running
   - Check MongoDB connection

### Database Issues
- Make sure MongoDB is running
- Check the connection string in your .env file
- Verify database permissions

### Network Issues
- Ensure both frontend and backend servers are running
- Check CORS configuration
- Verify API base URL configuration

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all servers are running
3. Test API endpoints using the provided test suite
4. Check the documentation in `SETTINGS_DOCUMENTATION.md`

The settings feature is now fully integrated and ready for production use!
