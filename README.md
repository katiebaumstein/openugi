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

## Metrics Explained

- **UGI Score**: Measures a model's knowledge of uncensored information
- **W/10 Score**: Willingness to answer controversial topics (0-10 scale)
- **Ideology**: Political/ideological classification of the model

## Quick Start

1. **Update the data** (optional - repo includes recent data):
   ```bash
   npm run fetch-data
   ```

2. **Start the local server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Alternative Commands

You can also run the Python scripts directly:
- `python3 fetch_data.py` - Fetch latest data
- `python3 server.py` - Start the server

### Auto-refresh Mode

To run both the server and auto-fetch service (refreshes data every hour):
```bash
npm run start-all
```

Or run them separately:
- `npm run auto-fetch` - Start the auto-fetch service
- `npm start` - Start the web server

## Data Source

Data is fetched from the official [UGI Leaderboard](https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard) on Hugging Face Spaces.

## Files

- `index.html` - Main webpage structure
- `styles.css` - Modern styling with dark mode support
- `script.js` - Interactive functionality and auto-refresh
- `fetch_data.py` - Script to fetch latest UGI data
- `auto_fetch.py` - Service to auto-update data every hour
- `leaderboard_data.json` - Cached leaderboard data
- `server.py` - Simple Python HTTP server

## Requirements

- Python 3.x (for data fetching and local server)
- Modern web browser
- Internet connection (for fetching updates)