const path = require('path');
const fs = require('fs');

// Load .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✓ Loaded .env from:', envPath);
} else {
  console.log('⚠ .env file not found at:', envPath);
  console.log('  Please create backend/.env file');
  process.exit(1);
}

const axios = require('axios');
const { pool } = require('../config/database');
const tokenService = require('../services/tokenService');

async function testAccurateConnection() {
  console.log('='.repeat(60));
  console.log('TEST KONEKSI ACCURATE API');
  console.log('='.repeat(60));
  console.log('');

  try {
    // 1. Cek environment variables
    console.log('1. Checking Environment Variables...');
    console.log('   ACCURATE_API_URL:', process.env.ACCURATE_API_URL || 'NOT SET');
    console.log('   ACCURATE_DATABASE_ID:', process.env.ACCURATE_DATABASE_ID ? 'SET' : 'NOT SET');
    console.log('   ACCURATE_ACCESS_TOKEN:', process.env.ACCURATE_ACCESS_TOKEN ? 'SET (length: ' + process.env.ACCURATE_ACCESS_TOKEN.length + ')' : 'NOT SET');
    console.log('');

    // 2. Cek database connection
    console.log('2. Checking Database Connection...');
    const [dbTest] = await pool.query('SELECT 1 as test');
    console.log('   ✓ Database connected');
    console.log('');

    // 3. Cek tabel accurate_tokens
    console.log('3. Checking accurate_tokens table...');
    const [tables] = await pool.query("SHOW TABLES LIKE 'accurate_tokens'");
    if (tables.length === 0) {
      console.log('   ✗ Table accurate_tokens NOT FOUND!');
      console.log('   Run: node backend/scripts/addAccurateTokensTable.js');
      return;
    }
    console.log('   ✓ Table accurate_tokens exists');
    console.log('');

    // 4. Cek tokens di database
    console.log('4. Checking tokens in database...');
    const [tokens] = await pool.query(
      'SELECT id, user_id, token_type, expires_at, is_active, created_at FROM accurate_tokens ORDER BY created_at DESC LIMIT 5'
    );
    
    if (tokens.length === 0) {
      console.log('   ✗ No tokens found in database');
      console.log('   You need to connect Accurate account first via Settings page');
    } else {
      console.log(`   Found ${tokens.length} token(s):`);
      tokens.forEach((token, idx) => {
        const isExpired = new Date(token.expires_at) < new Date();
        console.log(`   ${idx + 1}. User ID: ${token.user_id}, Active: ${token.is_active}, Expired: ${isExpired}, Created: ${token.created_at}`);
      });
    }
    console.log('');

    // 5. Test dengan token dari database (user pertama)
    console.log('5. Testing with token from database...');
    const [users] = await pool.query('SELECT id FROM users WHERE role = "superadmin" LIMIT 1');
    
    if (users.length === 0) {
      console.log('   ✗ No superadmin user found');
      return;
    }

    const userId = users[0].id;
    console.log('   Using user ID:', userId);

    const tokenResult = await tokenService.getActiveToken(userId);
    
    if (!tokenResult.success) {
      console.log('   ✗ Failed to get active token:', tokenResult.message);
      console.log('');
      console.log('SOLUTION:');
      console.log('1. Login ke aplikasi sebagai superadmin');
      console.log('2. Buka halaman Settings');
      console.log('3. Klik "Hubungkan Accurate"');
      console.log('4. Authorize aplikasi di Accurate');
      return;
    }

    console.log('   ✓ Active token found');
    console.log('   Token expires at:', tokenResult.token.expiresAt);
    console.log('');

    // 6. Test API call ke Accurate
    console.log('6. Testing API call to Accurate...');
    
    const headers = {
      'Authorization': `Bearer ${tokenResult.token.accessToken}`,
      'X-Api-Key': process.env.ACCURATE_DATABASE_ID,
      'Content-Type': 'application/json'
    };

    console.log('   Request URL:', `${process.env.ACCURATE_API_URL}/sales-order/list.do`);
    console.log('   Headers:', {
      'Authorization': 'Bearer ' + tokenResult.token.accessToken.substring(0, 20) + '...',
      'X-Api-Key': process.env.ACCURATE_DATABASE_ID ? '***' : 'NOT SET'
    });

    try {
      const response = await axios.get(`${process.env.ACCURATE_API_URL}/sales-order/list.do`, {
        headers,
        params: {
          sp: 1,
          pageSize: 10
        }
      });

      console.log('   ✓ API call successful!');
      console.log('   Response status:', response.status);
      console.log('   Response data keys:', Object.keys(response.data));
      
      if (response.data.d) {
        console.log('   Sales orders found:', response.data.d.length);
        if (response.data.d.length > 0) {
          console.log('   First SO:', {
            id: response.data.d[0].id,
            number: response.data.d[0].number,
            customerName: response.data.d[0].customerName
          });
        }
      }
      console.log('');
      console.log('='.repeat(60));
      console.log('✓ ALL TESTS PASSED! Accurate API connection is working!');
      console.log('='.repeat(60));

    } catch (apiError) {
      console.log('   ✗ API call failed!');
      console.log('   Status:', apiError.response?.status);
      console.log('   Error:', apiError.response?.data || apiError.message);
      console.log('');
      console.log('POSSIBLE ISSUES:');
      console.log('1. Token expired - refresh token atau hubungkan ulang');
      console.log('2. Database ID salah - cek ACCURATE_DATABASE_ID di .env');
      console.log('3. API URL salah - cek ACCURATE_API_URL di .env');
      console.log('4. Network issue - cek koneksi internet');
    }

  } catch (error) {
    console.error('');
    console.error('ERROR:', error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await pool.end();
  }
}

// Run test
testAccurateConnection();
