
# Excel Analytics Platform

An advanced analytics platform for uploading, parsing, visualizing, and managing Excel data, built with React, Vite, Node.js, and MongoDB.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Code Analysis](#code-analysis)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Excel Upload & Parsing**: Upload Excel files, parse and view data interactively.
- **Data Visualization**: Multiple chart types (Bar, Line, Pie, Area, Bubble, Radar, Gauge, TreeMap) for analytics.
- **User Authentication**: Auth0 integration for secure login.
- **Saved Charts**: Save, view, and manage custom chart configurations.
- **Explore Charts**: Explore public charts shared by other users.
- **History Tracking**: View and manage file upload and chart history.
- **Notifications**: Real-time notifications for user actions and system events.
- **User Profiles & Settings**: Manage user profile and application settings.
- **Keep Alive**: Server keep-alive and health check endpoints.

## Tech Stack
- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Atlas)
- **Authentication**: Auth0
- **Other**: ESLint, Render (deployment)

## Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- pnpm (or npm/yarn)
- MongoDB Atlas account

### 1. Clone the Repository
```
git clone https://github.com/mdsaad31/Excel-Analytics-Platform.git
cd excel-analytics-platform
```

### 2. Install Dependencies
```
pnpm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following (see example below):
```
VITE_AUTH0_DOMAIN=your Auth0 domain
VITE_AUTH0_CLIENT_ID=Your Auth0 Client ID
MONGODB_URI=Your Mongodb atlas URI
```

### 4. Start the Development Servers

#### Frontend
```
pnpm run dev
```

#### Backend
```
#open another terminal
cd server
npm install
node index.js
```

## Project Structure

```
excel-analytics-platform/
├── public/                # Static assets
├── server/                # Backend (Node.js/Express)
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── utils/             # Utility functions
├── src/                   # Frontend (React)
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── utils/             # Frontend utilities
│   └── config/            # API config
├── .env                   # Environment variables
├── package.json           # Project metadata
└── README.md              # Project documentation
```

## Usage
- Upload Excel files and visualize data with interactive charts.
- Save and manage custom chart configurations.
- View upload and chart history.
- Manage notifications and user profile.

## API Endpoints
The backend exposes RESTful endpoints for file history, notifications, saved charts, user profiles, and health checks. See the `server/routes/` directory for details.

## Code Analysis

This project includes a comprehensive code analysis tool that provides deep insights about code quality, complexity, security, and maintainability.

### Running Code Analysis

To analyze the codebase, run:

```bash
npm run analyze
# or
pnpm run analyze
```

### What It Analyzes

The code analysis tool provides comprehensive metrics across multiple dimensions:

#### 📊 Quality Score
- **Overall Quality Score (0-100)**: Calculated based on complexity, comments, technical debt, duplication, and security issues

#### 📈 Code Metrics
- **File Statistics**: Total files, lines (code/comments/blank), code size
- **File Distribution**: Breakdown by file type and directory
- **Largest Files**: Top 10 largest files with detailed breakdowns
- **Comments Ratio**: Percentage of comments vs. code lines

#### 🧮 Complexity Analysis
- **Cyclomatic Complexity**: Measures code complexity using decision points
- **Complexity Distribution**: Files categorized by complexity level (Low/Medium/High/Very High)
- **High Complexity Files**: Top 10 most complex files identified for refactoring

#### 💰 Technical Debt
- **TODO/FIXME/HACK Detection**: Tracks technical debt markers in code
- **Deprecated Code**: Identifies deprecated functions and components
- **Debt Locations**: Shows exact file and line numbers for each marker

#### 👯 Code Duplication
- **Duplication Ratio**: Percentage of duplicated code
- **Duplicate Blocks**: Identifies repeated code blocks across files
- **Duplication Locations**: Shows where code is duplicated

#### 🔗 Import Analysis
- **Import Statistics**: Total, external, and internal imports
- **Most Imported Files**: Identifies heavily-used utility files and components
- **Dependency Graph**: Tracks import relationships

#### 🔒 Security Analysis
- **Vulnerability Scanning**: Detects potential security issues
- **Severity Levels**: Critical, High, Medium, Low risk categorization
- **Common Issues**: eval() usage, XSS vulnerabilities, hardcoded secrets, console.log in production

#### 📦 Dependencies
- **Frontend & Backend**: Separate dependency analysis
- **Package Counts**: Dependencies and devDependencies breakdown

#### 🏗️ Code Organization
- **Components**: React component count and listing
- **API Routes**: Backend route analysis
- **Database Models**: Model structure overview
- **Utility Files**: Helper and utility modules

#### 🔎 ESLint Integration
- **Linting Results**: Automated code quality checks
- **Error Detection**: Syntax and style issues

### Output

The analysis tool generates:
1. **Console Report**: Beautifully formatted terminal output with color indicators
2. **JSON Report**: Detailed machine-readable report saved to `code-analysis-report.json`

### Example Output

```
📊 COMPREHENSIVE CODE ANALYSIS REPORT
================================================================================

⭐ OVERALL QUALITY SCORE
🟡 Score: 65/100

📈 OVERVIEW
Total Files: 64
Total Lines: 13,196
  Code Lines: 11,589
  Comment Lines: 297
  Blank Lines: 1,310
Comments Ratio: 2.56%

🧮 COMPLEXITY ANALYSIS
Average Complexity: 16.98
Files Analyzed: 55

Complexity Distribution:
  Low (1-5):        22 files
  Medium (6-10):    11 files
  High (11-20):     7 files
  Very High (20+):  15 files

High Complexity Files (Top 10):
  1. src/pages/Settings.jsx (complexity: 103)
  2. src/pages/Explore.jsx (complexity: 93)
  3. src/components/excel/ChartSelector.jsx (complexity: 91)

💰 TECHNICAL DEBT
Total Markers: 15
  TODOs: 10
  FIXMEs: 3
  HACKs: 2

🔒 SECURITY ANALYSIS
Potential Issues Found: 86
  Critical: 0
  High: 0
  Medium: 0
  Low: 86
```

### Understanding the Quality Score

The quality score is calculated based on:
- **Complexity** (-5 to -20 points for high complexity)
- **Comments Ratio** (-5 to -15 points for low documentation)
- **Technical Debt** (-5 to -15 points for TODO/FIXME markers)
- **Code Duplication** (-5 to -20 points for duplicate code)
- **Security Issues** (-5 to -10 points per critical/high issue)
- **ESLint Failures** (-10 points)

A score of 80+ indicates excellent code quality, 60-79 is good, 40-59 needs improvement, and below 40 requires attention.

### Using the JSON Report

The JSON report file (`code-analysis-report.json`) contains detailed data that can be:
- Integrated with CI/CD pipelines
- Used for trend analysis over time
- Processed by other development tools
- Included in automated quality gates

## Environment Variables
See `.env` for required variables. You will need to provide:

- **Auth0 configuration**: Sign up at [Auth0](https://auth0.com/), create an application, and copy your Domain and Client ID into the `.env` file.
- **MongoDB connection string**: Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), add a database user, and copy your connection string (URI) into the `.env` file.

Do not commit secrets to version control. Refer to `.env.example` or project documentation for variable names and formats.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
