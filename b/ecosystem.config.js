// PM2 config for OpenUGI Version B (Next.js standalone build).
module.exports = {
  apps: [{
    name: 'openugi-b',
    cwd: '/var/www/openugi-b',
    script: './server.js',
    exec_mode: 'fork',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 4003,
      HOSTNAME: '127.0.0.1',
      OPENUGI_DATA_PATH: '/var/www/openugi-shared/data/leaderboard.json',
    },
    error_file: '/var/www/openugi-b/logs/error.log',
    out_file: '/var/www/openugi-b/logs/out.log',
    time: true,
    max_memory_restart: '256M',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    kill_timeout: 5000,
  }],
};
