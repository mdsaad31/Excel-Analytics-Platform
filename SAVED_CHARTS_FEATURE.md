# Saved Charts Feature

## Overview
The Saved Charts feature allows users to save their chart visualizations to the database and access them later for download or reference.

## Features

### 1. Save Charts from Analysis Page
- **Save Button**: Added a green "Save" button in the Analysis page alongside the PNG and PDF export buttons
- **Save Modal**: Interactive modal to enter chart details before saving:
  - Chart Title (required)
  - Tags (optional, comma-separated)
  - Public/Private toggle
  - Automatic chart details display (type, axes, file source)

### 2. Saved Charts Page
- **New Navigation Item**: "Saved Charts" added to the sidebar navigation
- **Chart Management**: View all saved charts with interactive visualizations:
  - **Live Chart Preview**: Each chart displays the actual visualization using Recharts
  - **Chart metadata** (title, type, creation date, source file)
  - **Tag display** with color-coded badges
  - **Download and delete actions** with intuitive icons
- **View Modes**: 
  - **Grid View**: Card-based layout with chart previews (default)
  - **List View**: Horizontal layout with larger chart displays
- **Statistics Dashboard**: Overview cards showing:
  - Total number of saved charts
  - Number of different chart types used
  - Recent charts count
- **Filtering & Sorting**:
  - Filter by chart type (All, Bar, Line, Area, Pie, etc.)
  - Sort by date created, title, or chart type
  - Ascending/Descending order options
- **Pagination**: Navigate through multiple pages of saved charts

### 3. Database Integration
- **MongoDB Storage**: Charts saved with full configuration and metadata
- **Image Capture**: Automatic screenshot capture of charts for thumbnails
- **User Association**: Charts linked to Auth0 user IDs for security

## API Endpoints

### Save Chart
```
POST /saved-charts
```
Saves a new chart with configuration, image data, and metadata.

### Get User's Charts
```
GET /saved-charts/:userId?page=1&limit=12&chartType=all&sortBy=createdAt&sortOrder=desc
```
Retrieves paginated list of user's saved charts with filtering and sorting.

### Get Specific Chart
```
GET /saved-charts/chart/:chartId
```
Retrieves full chart data including image for download.

### Delete Chart
```
DELETE /saved-charts/:chartId
```
Removes a saved chart from the database.

### Get User Statistics
```
GET /saved-charts/stats/:userId
```
Returns user's chart statistics for dashboard display.

## File Structure

```
src/
├── pages/
│   └── SavedCharts.jsx           # Main saved charts page
├── components/
│   └── charts/
│       └── SaveChartModal.jsx    # Modal for saving charts
│   └── excel/
│       └── ChartSelector.jsx     # Modified to include save functionality
server/
├── models/
│   └── savedChart.model.js       # MongoDB schema for saved charts
└── routes/
    └── savedCharts.js            # API routes for chart operations
```

## Usage Instructions

### Saving a Chart
1. Navigate to the Analysis page
2. Upload an Excel file and create a chart visualization
3. Click the green "Save" button next to the export buttons
4. Fill in the modal form:
   - Enter a descriptive title
   - Add optional tags (comma-separated)
   - Choose public/private visibility
5. Click "Save Chart" to store in database

### Viewing Saved Charts
1. Click "Saved Charts" in the sidebar navigation
2. View your saved charts with live chart previews
3. Toggle between Grid and List view modes
4. Use filters and sorting options to organize charts
5. Click "Download" to get the chart as PNG
6. Click "Delete" to remove unwanted charts

### Managing Charts
- **View Modes**: Switch between Grid (compact cards) and List (detailed view) layouts
- **Filter by Type**: Use the dropdown to show only specific chart types
- **Sort Options**: Sort by creation date, title, or chart type
- **Pagination**: Navigate through multiple pages if you have many charts
- **Statistics**: View overview statistics at the top of the page
- **Live Previews**: See actual chart visualizations rendered in real-time

## Troubleshooting

### Common Issues and Solutions

#### 1. "Unexpected token '<', "<!DOCTYPE" JSON Error
**Cause**: Server returning HTML error page instead of JSON, usually due to:
- PayloadTooLargeError (chart image too large)
- Server route not properly loaded
- CORS issues

**Solution**: 
- Server has been configured with 50MB payload limit for large chart images
- If still occurring, reduce chart complexity or size
- Ensure both frontend and backend servers are running

#### 2. PayloadTooLargeError
**Cause**: Chart image data exceeds server limits
**Solution**: 
- Chart capture settings optimized (scale: 1.5, max dimensions: 800x600)
- PNG compression applied (quality: 0.8)
- Server configured with 50MB limit

#### 3. Route Not Found (404 errors)
**Cause**: Backend routes not properly registered
**Solution**: Restart backend server completely to reload routes

## Technical Details

### Chart Image Capture
- Uses `html2canvas` library to capture chart visualizations
- Images stored as base64 encoded PNG data in MongoDB
- Optimized capture settings: 1.5x scale, 800x600 max dimensions
- PNG compression (0.8 quality) to reduce payload size
- Server configured with 50MB payload limit for large images

### Data Storage
- Chart configurations stored as flexible JSON objects
- Supports all chart types: Bar, Line, Area, Pie, Radar, Scatter, Treemap, Composed
- Metadata includes source file, creation date, user association

### Security
- User-based access control using Auth0 integration
- Charts associated with specific user IDs
- Public/private visibility options for future sharing features

## Dependencies

### Frontend
- `html2canvas`: For capturing chart images
- `file-saver`: For downloading charts
- `react-router-dom`: For navigation

### Backend
- `mongoose`: MongoDB ODM for data modeling
- `express`: Web framework for API routes
- `cors`: Cross-origin resource sharing

## Future Enhancements

1. **Chart Sharing**: Public charts sharing functionality
2. **Chart Collections**: Organize charts into folders/collections
3. **Chart Templates**: Save chart configurations as reusable templates
4. **Collaborative Features**: Share charts with team members
5. **Export Formats**: Additional export formats (SVG, Excel, etc.)
6. **Chart Versioning**: Track changes to saved charts over time
