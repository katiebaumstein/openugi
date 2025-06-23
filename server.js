const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const compression = require('compression');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 4000; // Backend API port

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

// Enable compression
app.use(compression());

// Parse JSON bodies
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'OpenUGI Backend API'
    });
});

// Get leaderboard data
app.get('/api/leaderboard', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'leaderboard_data.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading leaderboard data:', error);
        res.status(500).json({ error: 'Failed to load leaderboard data' });
    }
});

// Get stats
app.get('/api/stats', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'leaderboard_data.json'), 'utf8');
        const jsonData = JSON.parse(data);
        
        const stats = {
            totalModels: jsonData.data.length,
            topUGI: Math.max(...jsonData.data.map(m => m.ugi)),
            lastUpdated: jsonData.lastUpdated,
            ideologyDistribution: {}
        };
        
        // Calculate ideology distribution
        jsonData.data.forEach(model => {
            const ideology = model.ideology || 'Unknown';
            stats.ideologyDistribution[ideology] = (stats.ideologyDistribution[ideology] || 0) + 1;
        });
        
        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate stats' });
    }
});

// Manual data refresh endpoint (optional)
app.post('/api/refresh', (req, res) => {
    // Simple auth check (you should use proper authentication in production)
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY && process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    exec('python3 fetch_data.py', (error, stdout, stderr) => {
        if (error) {
            console.error('Error refreshing data:', error);
            return res.status(500).json({ error: 'Failed to refresh data' });
        }
        res.json({ message: 'Data refresh initiated', output: stdout });
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Backend API server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/leaderboard');
    console.log('  GET  /api/stats');
    console.log('  POST /api/refresh (requires API key)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Backend server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Backend server closed');
        process.exit(0);
    });
});