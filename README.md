# Excel Analytics Platform

A modern web application for analyzing Excel files with interactive charts and data visualization, built with React and Vite.

## Features

- 📊 Interactive data visualization with multiple chart types
- 📈 Real-time analytics and insights
- 🔐 Authentication with Auth0
- 📁 File upload history tracking
- 🌊 PostgreSQL database with Neon
- 🚀 Deployed on Netlify

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Express.js, PostgreSQL (Neon)
- **Charts**: Chart.js, React Chart.js 2, Recharts
- **Authentication**: Auth0
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Neon PostgreSQL database account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd excel-analytics-platform
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - **DATABASE_URL**: Your Neon PostgreSQL connection string
   - **AUTH0_DOMAIN**: Your Auth0 domain
   - **AUTH0_CLIENT_ID**: Your Auth0 client ID
   - **AUTH0_CLIENT_SECRET**: Your Auth0 client secret

### Database Setup (Neon)

1. Create a Neon account at [https://console.neon.tech/](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string and add it to your `.env` file as `DATABASE_URL`
4. The database tables will be automatically created when you start the server

### Running the Application

1. Start the development server:
```bash
pnpm run dev
```

2. Start the backend server (in a separate terminal):
```bash
cd server
node index.js
```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

This project is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with automatic builds on push to main branch

## Database Migration from MongoDB

This project has been migrated from MongoDB to PostgreSQL (Neon). The database schema includes:

- **file_history** table: Stores uploaded file metadata and history
- Automatic table creation on server startup
- Improved performance and reliability with PostgreSQL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
