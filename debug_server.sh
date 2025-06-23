#!/bin/bash

# SSH script to debug OpenUGI server issues
# Usage: ./debug_server.sh [user@host]

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get SSH target from argument or use default
SSH_TARGET="${1:-user@your-server.com}"

echo "🔍 Debugging OpenUGI on production server..."
echo "Target: $SSH_TARGET"
echo "================================================"

# SSH command to debug
ssh "$SSH_TARGET" << 'EOF'
# Navigate to OpenUGI directory
if [ -d "openugi" ]; then
    cd openugi
    echo -e "\033[0;32m✅ Found openugi directory\033[0m"
    echo ""
    
    # Check directory structure
    echo -e "\033[0;34m📁 Directory Structure:\033[0m"
    echo "------------------------"
    ls -la
    echo ""
    
    # Check dist folder contents
    echo -e "\033[0;34m📦 Dist folder contents:\033[0m"
    echo "------------------------"
    if [ -d "dist" ]; then
        ls -la dist/ | head -20
        echo ""
        echo "Checking config.json:"
        if [ -f "dist/config.json" ]; then
            cat dist/config.json
        else
            echo -e "\033[0;31m❌ No config.json found in dist/\033[0m"
        fi
    else
        echo -e "\033[0;31m❌ No dist directory found!\033[0m"
    fi
    echo ""
    
    # Check if backend is running
    echo -e "\033[0;34m🔄 Backend Status:\033[0m"
    echo "------------------"
    
    # Check PM2
    if command -v pm2 &> /dev/null; then
        echo "PM2 processes:"
        pm2 list | grep -E "(openugi|server)" || echo "No OpenUGI process in PM2"
        echo ""
        echo "PM2 logs (last 10 lines):"
        pm2 logs --nostream --lines 10 2>/dev/null | grep -A10 -B10 "error\|Error\|ERROR" || echo "No recent errors in PM2 logs"
    else
        echo "PM2 not found"
    fi
    echo ""
    
    # Check if Node process is running
    echo "Node processes:"
    ps aux | grep -E "node.*server.js|node.*openugi" | grep -v grep || echo "No node server process found"
    echo ""
    
    # Check port 4000
    echo -e "\033[0;34m🔌 Port 4000 Status:\033[0m"
    echo "--------------------"
    if command -v netstat &> /dev/null; then
        netstat -tlnp 2>/dev/null | grep :4000 || echo "Port 4000 not listening"
    elif command -v ss &> /dev/null; then
        ss -tlnp | grep :4000 || echo "Port 4000 not listening"
    else
        lsof -i :4000 2>/dev/null || echo "Port 4000 status unknown"
    fi
    echo ""
    
    # Test backend API directly
    echo -e "\033[0;34m🌐 Testing Backend API:\033[0m"
    echo "-----------------------"
    echo "Testing http://localhost:4000/api/leaderboard:"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:4000/api/leaderboard || echo -e "\033[0;31m❌ Backend not responding\033[0m"
    
    # Get first few characters of response
    echo "Response preview:"
    curl -s http://localhost:4000/api/leaderboard | head -c 200 || echo "No response"
    echo ""
    echo ""
    
    # Check Caddy status
    echo -e "\033[0;34m🔒 Caddy Status:\033[0m"
    echo "----------------"
    if command -v caddy &> /dev/null; then
        systemctl status caddy 2>/dev/null | grep -E "Active|Main PID" || echo "Caddy status unknown"
    else
        echo "Caddy not found via command"
    fi
    echo ""
    
    # Check server.js file
    echo -e "\033[0;34m📄 Server Configuration:\033[0m"
    echo "------------------------"
    if [ -f "server.js" ]; then
        echo "server.js exists"
        echo "First few lines:"
        head -20 server.js | grep -E "PORT|port|4000|listen"
    else
        echo -e "\033[0;31m❌ server.js not found!\033[0m"
    fi
    echo ""
    
    # Check for error logs
    echo -e "\033[0;34m📋 Recent Error Logs:\033[0m"
    echo "---------------------"
    if [ -d "logs" ]; then
        echo "Checking logs directory:"
        ls -la logs/
        if [ -f "logs/error.log" ]; then
            echo "Last 10 lines of error.log:"
            tail -10 logs/error.log
        fi
    else
        echo "No logs directory found"
    fi
    echo ""
    
    # Check Python script and data
    echo -e "\033[0;34m📊 Data Status:\033[0m"
    echo "---------------"
    if [ -f "leaderboard_data.json" ]; then
        SIZE=$(ls -lh leaderboard_data.json | awk '{print $5}')
        MODIFIED=$(ls -l leaderboard_data.json | awk '{print $6, $7, $8}')
        echo "✅ leaderboard_data.json exists (${SIZE}, modified: ${MODIFIED})"
        echo "First line:"
        head -1 leaderboard_data.json
    else
        echo -e "\033[0;31m❌ leaderboard_data.json not found!\033[0m"
    fi
    
    # Check Python fetcher
    if [ -f "fetch_data.py" ]; then
        echo "✅ fetch_data.py exists"
    else
        echo -e "\033[0;31m❌ fetch_data.py not found!\033[0m"
    fi
    
else
    echo -e "\033[0;31m❌ No openugi directory found!\033[0m"
fi

# Check home directory if different
if [ -d "/home/admin/openugi" ] && [ "$PWD" != "/home/admin/openugi" ]; then
    echo ""
    echo -e "\033[1;33m⚠️  Found openugi in /home/admin/openugi\033[0m"
    cd /home/admin/openugi
    echo "Checking there instead..."
    # Run basic checks in correct directory
fi
EOF

echo ""
echo "================================================"
echo "✅ Debug check complete!"
echo ""
echo "🔧 Common fixes based on the results:"
echo "1. If backend not running: cd openugi && pm2 start server.js --name openugi"
echo "2. If no data file: python3 fetch_data.py"
echo "3. If dist outdated: npm run build:prod"
echo "4. If wrong directory: Make sure Caddy points to correct path"
echo "5. Check browser console for CORS or network errors"