module.exports = {
  apps: [
    {
      name: 'openugi-api',
      script: './server.js',
      instances: process.env.NODE_ENV === 'production' ? 2 : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      watch: process.env.NODE_ENV !== 'production',
      ignore_watch: ['node_modules', 'logs', '*.log', 'dist', 'leaderboard_data.json'],
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
        FRONTEND_URL: 'http://localhost:3000'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        FRONTEND_URL: 'https://openugi.com',
        API_KEY: 'your-secret-api-key-here'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      max_memory_restart: '300M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    },
    {
      name: 'openugi-auto-fetch',
      script: 'python3',
      args: 'auto_fetch.py',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/fetch-error.log',
      out_file: './logs/fetch-out.log',
      log_file: './logs/fetch-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 60000, // 1 minute delay between restarts
      kill_timeout: 5000
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/openugi.git',
      path: '/var/www/openugi',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};