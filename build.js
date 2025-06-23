const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const BUILD_DIR = 'dist';
const PUBLIC_FILES = [
    'index.html',
    'styles.css',
    'ghibli-styles.css',
    'script.js',
    'logo.png',
    'ugi-icon.png',
    'w10-icon.png',
    'cloud-pattern.png',
    'corner-vine-left.png',
    'corner-vine-right.png',
    'flower-divider.png',
    'search-companion.png',
    'cat-bus.png',
    'favicon.ico'
];

async function build() {
    console.log('🏗️  Building OpenUGI frontend...\n');
    
    try {
        // Clean dist directory
        console.log('📁 Cleaning dist directory...');
        await fs.emptyDir(BUILD_DIR);
        
        // Copy static files
        console.log('📋 Copying static files...');
        for (const file of PUBLIC_FILES) {
            if (await fs.pathExists(file)) {
                const destPath = path.join(BUILD_DIR, file);
                await fs.copy(file, destPath);
                console.log(`   ✓ ${file}`);
            } else if (!file.includes('favicon.ico')) { // favicon is optional
                console.log(`   ⚠️  ${file} not found`);
            }
        }
        
        // Process and minify JavaScript
        console.log('\n📦 Processing JavaScript...');
        const jsContent = await fs.readFile('script.js', 'utf8');
        
        // Update API endpoint for production
        const prodJs = jsContent.replace(
            /fetch\(['"]leaderboard_data\.json['"]\)/g,
            `fetch('${process.env.API_URL || 'http://localhost:4000'}/api/leaderboard')`
        );
        
        // Minify JavaScript
        const minifiedJs = await minify(prodJs, {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true
            },
            mangle: true
        });
        
        await fs.writeFile(
            path.join(BUILD_DIR, 'script.js'),
            minifiedJs.code || prodJs
        );
        console.log('   ✓ JavaScript minified');
        
        // Minify CSS
        console.log('\n🎨 Processing CSS...');
        const cssFiles = ['styles.css', 'ghibli-styles.css'];
        
        for (const cssFile of cssFiles) {
            const cssContent = await fs.readFile(cssFile, 'utf8');
            const minifiedCss = new CleanCSS({ level: 2 }).minify(cssContent);
            
            await fs.writeFile(
                path.join(BUILD_DIR, cssFile),
                minifiedCss.styles
            );
            console.log(`   ✓ ${cssFile} minified`);
        }
        
        // Create config file for API endpoint
        console.log('\n⚙️  Creating config...');
        const config = {
            apiUrl: process.env.API_URL || 'http://localhost:4000',
            environment: process.env.NODE_ENV || 'development'
        };
        
        await fs.writeFile(
            path.join(BUILD_DIR, 'config.json'),
            JSON.stringify(config, null, 2)
        );
        
        // Update index.html to load config
        console.log('\n📝 Updating index.html...');
        let htmlContent = await fs.readFile(path.join(BUILD_DIR, 'index.html'), 'utf8');
        
        // Add config script before main script
        htmlContent = htmlContent.replace(
            '<script src="script.js"></script>',
            `<script>
        // Load configuration
        fetch('config.json')
            .then(r => r.json())
            .then(config => window.API_CONFIG = config)
            .catch(() => window.API_CONFIG = { apiUrl: 'http://localhost:4000' });
    </script>
    <script src="script.js"></script>`
        );
        
        await fs.writeFile(path.join(BUILD_DIR, 'index.html'), htmlContent);
        
        console.log('\n✅ Build complete! Files written to:', BUILD_DIR);
        console.log('\n📊 Build stats:');
        const stats = await fs.stat(BUILD_DIR);
        console.log(`   Total files: ${PUBLIC_FILES.length}`);
        console.log(`   Build size: ${(stats.size / 1024).toFixed(2)} KB`);
        
    } catch (error) {
        console.error('\n❌ Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();