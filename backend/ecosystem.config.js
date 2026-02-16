// PM2 Ecosystem Configuration untuk iWare Backend
// File ini memudahkan deployment dan management dengan PM2

module.exports = {
  apps: [
    {
      name: 'iware-backend',
      script: './server.js',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      
      // Instances
      instances: 1,  // Gunakan 'max' untuk cluster mode (multi-core)
      exec_mode: 'fork',  // 'cluster' untuk load balancing
      
      // Logs
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart
      autorestart: true,
      watch: false,  // Set true untuk auto-reload saat file berubah (development)
      max_memory_restart: '500M',  // Restart jika memory usage > 500MB
      
      // Restart delay
      restart_delay: 4000,
      min_uptime: '10s',
      max_restarts: 10,
      
      // Advanced
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Source map support
      source_map_support: true,
      
      // Ignore watch (jika watch: true)
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        '.env'
      ]
    }
  ],
  
  // Deployment configuration (opsional)
  deploy: {
    production: {
      user: 'root',
      host: 'your-vps-ip',  // GANTI dengan IP VPS Anda
      ref: 'origin/main',
      repo: 'git@github.com:username/iware-app.git',  // GANTI dengan repo Anda
      path: '/var/www/iware',
      'post-deploy': 'cd backend && npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production..."'
    }
  }
};
