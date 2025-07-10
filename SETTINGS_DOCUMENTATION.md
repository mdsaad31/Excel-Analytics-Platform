# Settings Page Documentation

## Overview
The Settings page provides a comprehensive user profile management system with the following features:

## Features Implemented

### 1. Profile Information
- **Random Avatar Assignment**: Each user is automatically assigned a random avatar upon first login
- **Avatar Selection**: Users can choose from 600+ unique avatars (combination of 40+ emojis and 20+ gradient backgrounds)
- **Unique Nickname System**: 
  - Randomly generated nicknames on first login
  - Real-time nickname availability checking
  - Unique constraint enforcement
- **Bio Section**: 500-character bio with live character count

### 2. Contact and Work Information
- **Email**: Primary contact email (pre-filled from Auth0)
- **Phone**: Optional phone number
- **Job Title**: Professional title
- **Company**: Company/organization name
- **Department**: Department/team name
- **Location**: Geographic location

### 3. Social Links
Complete social media integration with:
- **Twitter**: Twitter profile link
- **LinkedIn**: Professional profile
- **GitHub**: Developer profile
- **Facebook**: Personal social profile
- **Instagram**: Photo sharing profile
- **YouTube**: Video content channel
- **TikTok**: Short-form video profile
- **Discord**: Gaming/community profile
- **Reddit**: Forum profile
- **Telegram**: Messaging profile
- **Website**: Personal/professional website
- **Other**: Any other social platform

### 4. Preferences
#### Theme Settings
- **Light Mode**: Traditional light theme
- **Dark Mode**: Dark theme (future implementation)
- **System**: Follows system preference

#### Localization
- **Language**: Multiple language support
- **Timezone**: Global timezone selection
- **Date Format**: Various date format options

#### Notifications
- **Email Notifications**: Important updates via email
- **Push Notifications**: Browser notifications
- **Marketing Emails**: Promotional content opt-in
- **Product Updates**: New features notifications

#### Privacy Settings
- **Profile Visibility**: Public/Private/Friends only
- **Show Email**: Email visibility on profile
- **Show Online Status**: Online presence indicator

#### Dashboard Settings
- **Default View**: Grid or List view preference
- **Charts Per Page**: Adjustable pagination (6-50 items)
- **Auto-save Charts**: Automatic chart saving
- **Show Tutorials**: Tutorial display preference

## Technical Implementation

### Backend
- **Database**: MongoDB with Mongoose ODM
- **Model**: `UserProfile` with comprehensive schema
- **Routes**: RESTful API endpoints for CRUD operations
- **Validation**: Input validation and sanitization
- **Uniqueness**: Nickname uniqueness checking

### Frontend
- **React**: Modern functional components with hooks
- **State Management**: useState and useEffect hooks
- **Real-time Updates**: Live nickname availability checking
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation

### Avatar System
- **Generation**: 600+ unique avatar combinations
- **Storage**: Emoji + gradient string format
- **Display**: Dynamic avatar rendering with CSS gradients
- **Selection**: Modal-based avatar picker

### Profile Completeness
- **Calculation**: Weighted scoring system
- **Display**: Progress bar with percentage
- **Real-time**: Updates as user fills information

## API Endpoints

### User Profile Routes
- `GET /user-profile/:userId` - Get user profile
- `PUT /user-profile/:userId` - Update user profile
- `POST /user-profile/check-nickname` - Check nickname availability
- `GET /user-profile/avatar/random` - Get random avatar
- `GET /user-profile/nickname/random` - Get random nickname
- `GET /user-profile/avatars/all` - Get all available avatars
- `DELETE /user-profile/:userId` - Delete user profile

## Security Features
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API rate limiting (future implementation)
- **Data Encryption**: Sensitive data encryption (future implementation)
- **CORS**: Proper CORS configuration

## Responsive Design
- **Mobile**: Optimized for mobile devices
- **Tablet**: Tablet-friendly layout
- **Desktop**: Full desktop experience
- **Accessibility**: WCAG 2.1 AA compliance

## Future Enhancements
- **Image Upload**: Custom avatar upload functionality
- **Two-Factor Authentication**: Enhanced security
- **Data Export**: Profile data export feature
- **Account Deletion**: Complete account removal
- **Advanced Privacy**: Granular privacy controls

## Usage Statistics
- **Profile Completeness**: Gamification element
- **Last Active**: User activity tracking
- **Verification**: Profile verification system

## Development Notes
- **Modular Architecture**: Clean separation of concerns
- **Error Handling**: Comprehensive error handling
- **Loading States**: User-friendly loading indicators
- **Form Validation**: Client-side and server-side validation
- **Performance**: Optimized for fast loading and smooth interactions
