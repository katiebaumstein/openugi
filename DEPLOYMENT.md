# OpenUGI Deployment Guide

## Architecture Overview

The application is now split into:
- **Backend API** (Node.js/Express) - Runs on port 4000
- **Frontend** (Static files) - Built to `dist/` folder
- **Data Fetcher** (Python) - Updates data hourly

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Backend API
```bash
npm run backend:dev
# API runs on http://localhost:4000
```

### 3. Build and Preview Frontend
```bash
npm run preview
# Frontend runs on http://localhost:3000
```

## Production Deployment

### Backend Deployment (with PM2)

1. **Install dependencies on server:**
```bash
npm install --production
npm install -g pm2
```

2. **Start backend services with PM2:**
```bash
# This starts both API server and auto-fetch script
npm run pm2:start:prod

# Or manually:
pm2 start ecosystem.config.js --env production
```

3. **Setup PM2 to survive reboots:**
```bash
pm2 startup
pm2 save
```

### Frontend Deployment

1. **Build for production:**
```bash
# Set your API URL
API_URL=https://api.yourdomain.com npm run build:prod

# Or edit the command in package.json
npm run build:prod
```

2. **Deploy the `dist` folder:**

The `dist` folder contains static files that can be served by:

- **Nginx** (recommended)
- **Apache**
- **S3 + CloudFront**
- **Netlify/Vercel**
- **GitHub Pages**

### Nginx Configuration Example

For the **backend API** (port 4000):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

For the **frontend** (static files):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/openugi/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Environment Variables

### Backend (server.js)
- `PORT` - API port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Allowed CORS origin
- `API_KEY` - Secret key for manual refresh endpoint

### Frontend (build.js)
- `API_URL` - Backend API URL
- `NODE_ENV` - Environment

## Commands Reference

### Development
```bash
npm run backend:dev    # Run API with auto-reload
npm run build         # Build frontend
npm run preview       # Build and preview frontend
npm run fetch-data    # Manually fetch latest data
```

### Production
```bash
npm run backend:prod      # Run API in production mode
npm run build:prod       # Build frontend for production
npm run pm2:start:prod   # Start all services with PM2
npm run pm2:logs         # View PM2 logs
npm run pm2:monitor      # Monitor PM2 processes
```

### PM2 Management
```bash
npm run pm2:reload    # Zero-downtime reload
npm run pm2:restart   # Restart services
npm run pm2:stop      # Stop services
npm run pm2:logs      # View logs
```

## Deployment Checklist

- [ ] Set environment variables
- [ ] Update API_URL in build command
- [ ] Build frontend with production API URL
- [ ] Deploy backend with PM2
- [ ] Deploy frontend to web server
- [ ] Configure Nginx/Apache
- [ ] Setup SSL certificates
- [ ] Test API endpoints
- [ ] Verify frontend can reach API
- [ ] Setup monitoring/alerts

## Folder Structure

```
openugi/
├── dist/              # Frontend build output
├── logs/              # Backend logs
├── server.js          # Backend API server
├── build.js           # Frontend build script
├── script.js          # Frontend JavaScript
├── index.html         # Frontend HTML
├── styles.css         # Frontend styles
├── ecosystem.config.js # PM2 configuration
├── fetch_data.py      # Data fetcher
├── auto_fetch.py      # Hourly data updater
└── leaderboard_data.json # Data file
```

## Monitoring

- API Health: `http://api.yourdomain.com/api/health`
- API Stats: `http://api.yourdomain.com/api/stats`
- Frontend: `http://yourdomain.com`

## Troubleshooting

1. **CORS errors**: Check FRONTEND_URL environment variable
2. **API not reachable**: Check PM2 status and logs
3. **Build fails**: Ensure all dependencies are installed
4. **Data not updating**: Check auto-fetch logs in PM2