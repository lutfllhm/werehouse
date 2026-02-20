const path = require('path');
const fs = require('fs');

// Load .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

console.log('');
console.log('='.repeat(80));
console.log('ACCURATE OAUTH FLOW TEST');
console.log('='.repeat(80));
console.log('');

// 1. Check Environment Variables
console.log('1. ENVIRONMENT VARIABLES');
console.log('-'.repeat(80));
const clientId = process.env.ACCURATE_CLIENT_ID;
const clientSecret = process.env.ACCURATE_CLIENT_SECRET;
const redirectUri = process.env.ACCURATE_REDIRECT_URI;

console.log('   CLIENT_ID:', clientId || '❌ NOT SET');
console.log('   CLIENT_SECRET:', clientSecret ? '✓ SET (hidden)' : '❌ NOT SET');
console.log('   REDIRECT_URI:', redirectUri || '❌ NOT SET');
console.log('');

if (!clientId || !clientSecret || !redirectUri) {
  console.log('❌ ERROR: Missing required environment variables!');
  console.log('');
  console.log('Please set the following in backend/.env:');
  console.log('   ACCURATE_CLIENT_ID=your_client_id');
  console.log('   ACCURATE_CLIENT_SECRET=your_client_secret');
  console.log('   ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback');
  console.log('');
  process.exit(1);
}

// 2. Validate Redirect URI
console.log('2. REDIRECT URI VALIDATION');
console.log('-'.repeat(80));

const issues = [];

if (redirectUri.includes('localhost')) {
  issues.push('⚠ Using localhost - this will not work in production');
}

if (!redirectUri.startsWith('https://') && !redirectUri.startsWith('http://localhost')) {
  issues.push('⚠ Should use HTTPS in production');
}

if (redirectUri.includes('/Accurate/')) {
  issues.push('❌ URL contains uppercase "Accurate" - should be lowercase "accurate"');
}

if (!redirectUri.includes('/api/accurate/callback')) {
  issues.push('❌ URL path should be /api/accurate/callback');
}

if (issues.length === 0) {
  console.log('   ✓ Redirect URI looks good');
} else {
  console.log('   Issues found:');
  issues.forEach(issue => console.log('   ' + issue));
}
console.log('');

// 3. Generate Authorization URL
console.log('3. AUTHORIZATION URL');
console.log('-'.repeat(80));

const scopes = [
  'item_view',
  'item_save',
  'sales_order_view',
  'sales_order_save',
  'customer_view'
];

const authUrl = `https://account.accurate.id/oauth/authorize?` +
  `client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&response_type=code` +
  `&scope=${scopes.join(' ')}`;

console.log('   Generated URL:');
console.log('   ' + authUrl);
console.log('');

// 4. Instructions
console.log('4. TESTING INSTRUCTIONS');
console.log('-'.repeat(80));
console.log('   Step 1: Make sure these settings in Accurate Developer Console:');
console.log('           https://account.accurate.id/developer/apps');
console.log('');
console.log('   Step 2: Your app settings should have:');
console.log('           - Client ID: ' + clientId);
console.log('           - Redirect URI: ' + redirectUri);
console.log('');
console.log('   Step 3: Test the authorization flow:');
console.log('           a. Copy the URL above');
console.log('           b. Paste in browser');
console.log('           c. Login to Accurate');
console.log('           d. Authorize the app');
console.log('           e. Should redirect to: ' + redirectUri + '?code=...');
console.log('');
console.log('   Step 4: Check backend logs for callback:');
console.log('           docker-compose logs -f backend');
console.log('           or');
console.log('           pm2 logs backend');
console.log('');

// 5. Common Issues
console.log('5. COMMON ISSUES & SOLUTIONS');
console.log('-'.repeat(80));
console.log('');
console.log('   Issue: "Client ID yang digunakan tidak tepat"');
console.log('   Solution: Verify ACCURATE_CLIENT_ID matches your app in Accurate Console');
console.log('');
console.log('   Issue: "URL redirect yang digunakan tidak sesuai"');
console.log('   Solution: Make sure ACCURATE_REDIRECT_URI exactly matches the one');
console.log('             registered in Accurate Console (case-sensitive!)');
console.log('');
console.log('   Issue: "Scope otorisasi yang diajukan tidak tepat"');
console.log('   Solution: Check if your app has permission for these scopes:');
scopes.forEach(scope => console.log('             - ' + scope));
console.log('');
console.log('   Issue: "Authorization code tidak ditemukan"');
console.log('   Solution: Backend is not receiving the callback. Check:');
console.log('             - Backend server is running');
console.log('             - Route /api/accurate/callback exists');
console.log('             - No firewall blocking the callback');
console.log('');

console.log('='.repeat(80));
console.log('');

// 6. Quick Test URL
console.log('QUICK TEST: Copy this URL and paste in browser:');
console.log('');
console.log(authUrl);
console.log('');
console.log('='.repeat(80));
