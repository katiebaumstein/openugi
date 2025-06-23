# Quick Reference Guide

## 🚀 Local Development

### Easy Mode (Recommended)
```bash
npm install          # First time only
npm start           # Runs everything!
```
- Opens http://localhost:3000 (frontend)
- Backend API runs on http://localhost:4000
- Both servers start with one command
- Ctrl+C stops both

### Manual Mode
```bash
# Terminal 1
npm run backend:dev  # Start API server

# Terminal 2  
npm run serve:built  # Build and serve frontend
```

## 🏭 Production Deployment

### Backend (Server)
```bash
# Install PM2 globally
npm install -g pm2

# Start backend services
npm run pm2:start:prod

# View logs
npm run pm2:logs

# Setup auto-start on reboot
pm2 startup
pm2 save
```

### Frontend (Static Files)
```bash
# Build with your API URL
API_URL=https://api.yourdomain.com npm run build:prod

# The 'dist' folder is ready to deploy to:
# - Nginx
# - Apache  
# - S3 + CloudFront
# - Netlify/Vercel
# - Any static host
```

## 📝 Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run everything locally |
| `npm run build` | Build frontend to dist/ |
| `npm run backend` | Run backend API only |
| `npm run fetch-data` | Update data manually |
| `npm run pm2:logs` | View production logs |
| `npm run pm2:monitor` | Monitor PM2 processes |

## 🔧 Ports

- Frontend: 3000
- Backend API: 4000

## 📁 What Gets Deployed

**Backend Server:**
- server.js
- fetch_data.py
- auto_fetch.py
- package.json
- ecosystem.config.js

**Frontend (dist folder):**
- All HTML/CSS/JS files
- Images and assets
- Minified and optimized

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

**PM2 issues:**
```bash
pm2 kill           # Stop all PM2 processes
pm2 delete all     # Remove all apps
pm2 start ecosystem.config.js --env production  # Start fresh
```