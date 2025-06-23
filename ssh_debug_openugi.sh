#!/bin/bash

# Direct SSH debugging script for OpenUGI on AWS
# This script SSHs into the server and checks the actual code and configuration

echo "🔍 SSHing into AWS server to debug OpenUGI..."
echo "================================================"

# SSH into the server and run debugging commands
ssh admin@openugi.com << 'EOF'
echo "Connected to server as $(whoami)"
echo ""

# Go to openugi directory
cd /home/admin/openugi || cd ~/openugi || { echo "❌ Cannot find openugi directory"; exit 1; }
echo "📁 Current directory: $(pwd)"
echo ""

# Check what's in the dist folder
echo "📦 Contents of dist/ folder:"
echo "------------------------"
ls -la dist/ | head -15
echo ""

# Check the actual config.json in dist
echo "🔧 Contents of dist/config.json:"
echo "------------------------"
cat dist/config.json 2>/dev/null || echo "❌ No config.json found"
echo ""

# Check the actual script.js in dist (first 30 lines)
echo "📄 First 30 lines of dist/script.js:"
echo "------------------------"
head -30 dist/script.js 2>/dev/null || echo "❌ No script.js found"
echo ""

# Check if script.js contains the API URL
echo "🔍 Checking API URL in dist/script.js:"
echo "------------------------"
grep -n "fetch\|API\|localhost\|openugi.com" dist/script.js | head -10 || echo "No fetch/API references found"
echo ""

# Check server.js to see if it's configured correctly
echo "🖥️  Server.js configuration:"
echo "------------------------"
grep -n "PORT\|port\|4000\|cors\|CORS" server.js | head -10
echo ""

# Check if server is actually running
echo "🔄 Is server.js running?"
echo "------------------------"
ps aux | grep -E "node.*server" | grep -v grep || echo "❌ No node server process found"
echo ""

# Check PM2 status
echo "📊 PM2 Status:"
echo "------------------------"
pm2 list
echo ""

# Test the API endpoint directly
echo "🌐 Testing API endpoint directly:"
echo "------------------------"
echo "Testing http://localhost:4000/api/leaderboard:"
curl -I http://localhost:4000/api/leaderboard 2>&1 | head -10
echo ""

# Check if data file exists
echo "📁 Data file check:"
echo "------------------------"
ls -la leaderboard_data.json 2>/dev/null || echo "❌ No leaderboard_data.json found"
echo ""

# Check the actual index.html in dist
echo "📄 Checking index.html script tags:"
echo "------------------------"
grep -A5 -B5 "<script" dist/index.html 2>/dev/null || echo "❌ Cannot read index.html"
echo ""

# Check Caddy logs for errors
echo "🔒 Recent Caddy logs:"
echo "------------------------"
sudo journalctl -u caddy -n 20 --no-pager 2>/dev/null | grep -E "error|Error|ERROR|openugi" || echo "Cannot access Caddy logs"

EOF

echo ""
echo "================================================"
echo "✅ SSH debug complete!"