const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Start the backend API server as a child process
console.log('Starting backend API server...');
const backendProcess = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
        console.error('Backend server error:', error);
    }
});

// Give backend time to start
setTimeout(() => {
    console.log('Backend API should be running on http://localhost:4000');
}, 2000);

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:4000',
    changeOrigin: true,
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(502).json({ error: 'Backend API is not available' });
    }
}));

// Serve frontend files
app.use(express.static(path.join(__dirname), {
    index: 'index.html',
    extensions: ['html'],
    setHeaders: (res, path) => {
        if (path.endsWith('.json')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Handle leaderboard_data.json for backward compatibility
app.get('/leaderboard_data.json', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'leaderboard_data.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        // Fallback to API
        res.redirect('/api/leaderboard');
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 OpenUGI Development Server                    ║
║                                                    ║
║   Frontend: http://localhost:${PORT}                   ║
║   Backend API: http://localhost:4000              ║
║                                                    ║
║   Press Ctrl+C to stop both servers                ║
║                                                    ║
╚════════════════════════════════════════════════════╝
    `);
});

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    backendProcess.kill();
    server.close(() => {
        console.log('Servers stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    backendProcess.kill();
    server.close(() => {
        process.exit(0);
    });
});