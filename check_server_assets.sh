#!/bin/bash

# SSH script to check OpenUGI assets on production server
# Usage: ./check_server_assets.sh [user@host]

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get SSH target from argument or use default
SSH_TARGET="${1:-user@your-server.com}"

echo "🔍 Checking OpenUGI assets on production server..."
echo "Target: $SSH_TARGET"
echo "================================================"

# SSH command to check assets
ssh "$SSH_TARGET" << 'EOF'
# Navigate to OpenUGI directory
if [ -d "openugi" ]; then
    cd openugi
    echo "✅ Found openugi directory"
    echo ""
    
    # Check for all required image files
    echo "📁 Checking image assets:"
    echo "------------------------"
    
    # List of required images
    IMAGES=(
        "cat-bus-scroll.png"
        "ranking-crown.png"
        "star-medals.png"
        "logo.png"
        "hero-banner.png"
        "cloud-pattern.png"
        "corner-vine-left.png"
        "corner-vine-right.png"
        "flower-divider.png"
        "footer-scenery.png"
        "ugi-icon.png"
        "w10-icon.png"
        "search-companion.png"
        "score-sparkles.png"
        "filter-potion.png"
        "spirit-guide.png"
        "totoro-thinking.png"
        "mode-sprites.png"
    )
    
    # Check each image
    for img in "${IMAGES[@]}"; do
        if [ -f "$img" ]; then
            SIZE=$(ls -lh "$img" | awk '{print $5}')
            echo "✅ $img (${SIZE})"
        else
            echo "❌ $img - NOT FOUND"
        fi
    done
    
    echo ""
    echo "📁 Checking dist directory (if exists):"
    echo "--------------------------------------"
    
    if [ -d "dist" ]; then
        echo "Contents of dist/:"
        ls -la dist/ | grep -E "\.(png|jpg|svg|webp)$" || echo "No image files found in dist/"
    else
        echo "⚠️  No dist directory found"
    fi
    
    echo ""
    echo "🔧 Checking server configuration:"
    echo "--------------------------------"
    
    # Check for web server config files
    if [ -f "nginx.conf" ]; then
        echo "📄 Found nginx.conf"
        echo "MIME type configuration:"
        grep -A5 "types {" nginx.conf 2>/dev/null || echo "No MIME types section found"
    fi
    
    if [ -f ".htaccess" ]; then
        echo "📄 Found .htaccess"
        echo "MIME type configuration:"
        grep -i "addtype" .htaccess 2>/dev/null || echo "No AddType directives found"
    fi
    
    # Check for PM2 process
    echo ""
    echo "🔄 Checking PM2 status:"
    echo "----------------------"
    if command -v pm2 &> /dev/null; then
        pm2 list | grep -i openugi || echo "No OpenUGI process found in PM2"
    else
        echo "PM2 not installed"
    fi
    
    # Check file permissions
    echo ""
    echo "🔐 Checking file permissions:"
    echo "----------------------------"
    ls -la *.png 2>/dev/null | head -5 || echo "No PNG files in root directory"
    
else
    echo "❌ No openugi directory found!"
fi
EOF

echo ""
echo "================================================"
echo "✅ Server check complete!"
echo ""
echo "🔧 Common fixes for missing assets:"
echo "1. Run 'npm run build' to ensure all assets are copied to dist/"
echo "2. Check that all image files are included in build.js PUBLIC_FILES array"
echo "3. Ensure proper MIME types are configured for PNG files"
echo "4. Verify file permissions (should be readable by web server)"
echo "5. Check that the web server is serving from the correct directory"