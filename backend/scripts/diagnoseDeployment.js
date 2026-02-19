#!/usr/bin/env node

/**
 * Diagnostic script untuk troubleshoot deployment
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`)
};

async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log.success('Backend API responding on port 5000');
          resolve(true);
        } else {
          log.error(`Backend returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      log.error('Backend not responding on port 5000');
      log.error(`Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      log.error('Backend request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function checkFrontendDist() {
  const distPath = path.join(__dirname, '../../frontend/dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(distPath)) {
    log.error('Frontend dist folder not found');
    log.info('Run: cd frontend && npm run build');
    return false;
  }
  
  if (!fs.existsSync(indexPath)) {
    log.error('Frontend index.html not found in dist');
    log.info('Run: cd frontend && npm run build');
    return false;
  }
  
  log.success('Frontend dist folder exists');
  
  // Check dist contents
  const files = fs.readdirSync(distPath);
  log.info(`Dist contains ${files.length} files/folders`);
  
  return true;
}

function checkNginxConfig() {
  const configPath = '/etc/nginx/sites-available/iware';
  
  if (!fs.existsSync(configPath)) {
    log.error('Nginx config not found at /etc/nginx/sites-available/iware');
    return false;
  }
  
  log.success('Nginx config file exists');
  
  const config = fs.readFileSync(configPath, 'utf8');
  
  // Check important settings
  if (config.includes('proxy_pass http://localhost:5000')) {
    log.success('Nginx proxy to backend configured');
  } else {
    log.error('Nginx proxy_pass not configured correctly');
  }
  
  if (config.includes('/var/www/iware/frontend/dist')) {
    log.success('Nginx root path configured');
  } else {
    log.warning('Nginx root path might be incorrect');
  }
  
  return true;
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  
  if (!fs.existsSync(envPath)) {
    log.error('.env file not found');
    return false;
  }
  
  log.success('.env file exists');
  
  const env = fs.readFileSync(envPath, 'utf8');
  const lines = env.split('\n');
  
  const required = [
    'DB_HOST',
    'DB_USER', 
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'ACCURATE_ACCESS_TOKEN',
    'ACCURATE_DATABASE_ID'
  ];
  
  let missing = [];
  
  for (const key of required) {
    const found = lines.some(line => line.startsWith(`${key}=`) && !line.includes('=\r') && !line.includes('=\n'));
    if (!found) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    log.error(`Missing or empty env variables: ${missing.join(', ')}`);
    return false;
  }
  
  log.success('All required env variables set');
  return true;
}

async function diagnose() {
  log.header('=== iWare Deployment Diagnostic ===');
  
  log.header('1. Checking Backend');
  const backendOk = await checkBackend();
  
  log.header('2. Checking Frontend Build');
  const frontendOk = await checkFrontendDist();
  
  log.header('3. Checking Nginx Configuration');
  let nginxOk = false;
  try {
    nginxOk = checkNginxConfig();
  } catch (err) {
    log.warning('Cannot check Nginx config (might need sudo)');
  }
  
  log.header('4. Checking Environment Variables');
  const envOk = checkEnvFile();
  
  log.header('=== Summary ===');
  console.log('');
  console.log(`Backend:      ${backendOk ? '✓' : '✗'}`);
  console.log(`Frontend:     ${frontendOk ? '✓' : '✗'}`);
  console.log(`Nginx:        ${nginxOk ? '✓' : '?'}`);
  console.log(`Environment:  ${envOk ? '✓' : '✗'}`);
  console.log('');
  
  if (!backendOk) {
    log.header('Backend Troubleshooting:');
    log.info('1. Check if backend is running:');
    log.info('   pm2 status');
    log.info('');
    log.info('2. Check backend logs:');
    log.info('   pm2 logs iware-backend');
    log.info('');
    log.info('3. Try starting backend:');
    log.info('   cd /var/www/iware/backend');
    log.info('   pm2 start ecosystem.config.js');
    log.info('');
    log.info('4. Test backend directly:');
    log.info('   curl http://localhost:5000/api/health');
  }
  
  if (!frontendOk) {
    log.header('Frontend Troubleshooting:');
    log.info('1. Build frontend:');
    log.info('   cd /var/www/iware/frontend');
    log.info('   npm install');
    log.info('   npm run build');
  }
  
  if (!nginxOk) {
    log.header('Nginx Troubleshooting:');
    log.info('1. Check Nginx status:');
    log.info('   systemctl status nginx');
    log.info('');
    log.info('2. Check Nginx error log:');
    log.info('   tail -50 /var/log/nginx/error.log');
    log.info('');
    log.info('3. Test Nginx config:');
    log.info('   nginx -t');
    log.info('');
    log.info('4. Reload Nginx:');
    log.info('   systemctl reload nginx');
  }
  
  if (!envOk) {
    log.header('Environment Troubleshooting:');
    log.info('1. Check .env file:');
    log.info('   cat /var/www/iware/backend/.env');
    log.info('');
    log.info('2. Update missing variables:');
    log.info('   nano /var/www/iware/backend/.env');
  }
}

diagnose();
