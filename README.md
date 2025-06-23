# OpenUGI - Uncensored General Intelligence Leaderboard

A modern web interface for viewing and exploring the UGI (Uncensored General Intelligence) leaderboard rankings. This project provides an easy-to-use interface inspired by HuggingFace's leaderboards to track AI models based on their uncensored capabilities.

## Features

- 📊 Real-time leaderboard display with 830+ AI models
- 🔍 Search functionality to find specific models
- 🏷️ Filter by ideology (Liberalism, Centrism, Conservatism, etc.)
- 📈 Sort by UGI score or W/10 score
- 📱 Responsive design for mobile and desktop
- 🔄 Auto-refresh data every hour
- 🌓 Dark/Light mode toggle
- ✨ Modern UI with smooth animations
- ⏱️ Live refresh countdown timer
- 🔔 Visual notifications on data updates
- 🎯 Separate frontend/backend architecture

## Architecture

The application is split into:
- **Backend API** - Node.js/Express server providing JSON endpoints
- **Frontend** - Static HTML/CSS/JS that can be built and deployed anywhere
- **Data Fetcher** - Python script that updates data hourly

## Quick Start (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run everything with one command**:
   ```bash
   npm start
   ```
   This starts both frontend (http://localhost:3000) and backend API (http://localhost:4000)

### Alternative: Run Frontend and Backend Separately

If you prefer to run them separately:

1. **Terminal 1 - Backend API**:
   ```bash
   npm run backend:dev
   ```
   API runs on http://localhost:4000

2. **Terminal 2 - Frontend Only**:
   ```bash
   npm run serve:built
   ```
   Frontend runs on http://localhost:3000

## Production Deployment

### Backend (with PM2)
```bash
# Start backend services with PM2
npm run pm2:start:prod

# View logs
npm run pm2:logs
```

### Frontend
```bash
# Build for production
API_URL=https://api.yourdomain.com npm run build:prod

# Deploy the 'dist' folder to your web server
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Available Scripts

### Development
- `npm run backend:dev` - Run API server with auto-reload
- `npm run build` - Build frontend to dist/
- `npm run preview` - Build and preview frontend
- `npm run fetch-data` - Manually fetch latest data

### Production
- `npm run backend:prod` - Run API in production mode
- `npm run build:prod` - Build frontend for production
- `npm run pm2:start:prod` - Start all services with PM2

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/leaderboard` - Get leaderboard data
- `GET /api/stats` - Get statistics
- `POST /api/refresh` - Manual data refresh (requires API key)

## Metrics Explained

- **UGI Score**: Measures a model's knowledge of uncensored information (0-100)
- **W/10 Score**: Willingness to answer controversial topics (0-10 scale)
- **Ideology**: Political/ideological classification of the model

## Data Source

Data is fetched from the official [UGI Leaderboard](https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard) on Hugging Face Spaces.

## Project Structure

```
openugi/
├── dist/                 # Frontend build output
├── logs/                 # Backend logs
├── server.js            # Backend API server
├── build.js             # Frontend build script
├── script.js            # Frontend JavaScript
├── index.html           # Frontend HTML
├── styles.css           # Frontend styles
├── ghibli-styles.css    # Theme styles
├── ecosystem.config.js  # PM2 configuration
├── fetch_data.py        # Data fetcher
├── auto_fetch.py        # Hourly data updater
└── leaderboard_data.json # Data file
```

## Requirements

- Node.js 14+ (for backend server)
- Python 3.x (for data fetching)
- Modern web browser
- Internet connection (for fetching updates)

## License

MIT