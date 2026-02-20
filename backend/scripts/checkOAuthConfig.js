const path = require('path');
const fs = require('fs');

// Load .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✓ Loaded .env from:', envPath);
} else {
  console.log('⚠ .env file not found');
}

console.log('');
console.log('='.repeat(70));
console.log('ACCURATE OAUTH CONFIGURATION CHECK');
console.log('='.repeat(70));
console.log('');

console.log('1. OAUTH CREDENTIALS');
console.log('-'.repeat(70));
console.log('   CLIENT_ID:', process.env.ACCURATE_CLIENT_ID || '❌ NOT SET');
console.log('   CLIENT_SECRET:', process.env.ACCURATE_CLIENT_SECRET ? '✓ SET' : '❌ NOT SET');
console.log('   REDIRECT_URI:', process.env.ACCURATE_REDIRECT_URI || '❌ NOT SET');
console.log('');

console.log('2. CALLBACK URL ANALYSIS');
console.log('-'.repeat(70));
const redirectUri = process.env.ACCURATE_REDIRECT_URI || '';
console.log('   Current Redirect URI:', redirectUri);
console.log('');

if (redirectUri.includes('localhost')) {
  console.log('   ⚠ WARNING: Using localhost URL');
  console.log('   📝 For production, update to:');
  console.log('      ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback');
  console.log('');
}

console.log('3. IMPORTANT NOTES');
console.log('-'.repeat(70));
console.log('   ✓ Route path: /api/accurate/callback (lowercase "accurate")');
console.log('   ✓ Make sure ACCURATE_REDIRECT_URI matches exactly');
console.log('   ✓ Register this URL in Accurate Developer Console');
console.log('');

console.log('4. STEPS TO FIX');
console.log('-'.repeat(70));
console.log('   1. Update backend/.env file:');
console.log('      ACCURATE_REDIRECT_URI=https://werehouse.iwareid.com/api/accurate/callback');
console.log('');
console.log('   2. Login to Accurate Developer Console:');
console.log('      https://account.accurate.id/developer/apps');
console.log('');
console.log('   3. Update your app\'s Redirect URI to:');
console.log('      https://werehouse.iwareid.com/api/accurate/callback');
console.log('');
console.log('   4. Restart your backend server');
console.log('');

console.log('5. TEST AUTHORIZATION URL');
console.log('-'.repeat(70));
const clientId = process.env.ACCURATE_CLIENT_ID;
const testRedirectUri = 'https://werehouse.iwareid.com/api/accurate/callback';
const authUrl = `https://account.accurate.id/oauth/authorize?` +
  `client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(testRedirectUri)}` +
  `&response_type=code` +
  `&scope=item_view sales_order_view sales_order_save customer_view`;

console.log('   Test this URL in browser:');
console.log('   ' + authUrl);
console.log('');

console.log('='.repeat(70));
