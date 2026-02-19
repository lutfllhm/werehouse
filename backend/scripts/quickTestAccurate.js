// Quick test untuk Accurate API - tanpa dependencies kompleks
const mysql = require('mysql2/promise');

async function quickTest() {
  console.log('='.repeat(60));
  console.log('QUICK TEST ACCURATE CONNECTION');
  console.log('='.repeat(60));
  console.log('');

  let connection;
  
  try {
    // 1. Load environment variables manually
    console.log('1. Loading environment variables...');
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('   ✗ File .env tidak ditemukan di:', envPath);
      console.log('   Buat file backend/.env terlebih dahulu');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });

    console.log('   ✓ Environment variables loaded');
    console.log('   DB_HOST:', envVars.DB_HOST || 'NOT SET');
    console.log('   DB_NAME:', envVars.DB_NAME || 'NOT SET');
    console.log('   ACCURATE_API_URL:', envVars.ACCURATE_API_URL || 'NOT SET');
    console.log('   ACCURATE_DATABASE_ID:', envVars.ACCURATE_DATABASE_ID ? 'SET' : 'NOT SET');
    console.log('');

    // 2. Connect to database
    console.log('2. Connecting to database...');
    connection = await mysql.createConnection({
      host: envVars.DB_HOST || 'localhost',
      user: envVars.DB_USER || 'root',
      password: envVars.DB_PASSWORD || '',
      database: envVars.DB_NAME || 'iware_warehouse'
    });
    console.log('   ✓ Database connected');
    console.log('');

    // 3. Check accurate_tokens table
    console.log('3. Checking accurate_tokens table...');
    try {
      const [tables] = await connection.query("SHOW TABLES LIKE 'accurate_tokens'");
      if (tables.length === 0) {
        console.log('   ✗ Table accurate_tokens NOT FOUND!');
        console.log('   Run: cd backend && node scripts/addAccurateTokensTable.js');
        return;
      }
      console.log('   ✓ Table exists');
    } catch (err) {
      console.log('   ✗ Error checking table:', err.message);
      return;
    }
    console.log('');

    // 4. Check tokens
    console.log('4. Checking tokens in database...');
    const [tokens] = await connection.query(
      'SELECT id, user_id, token_type, expires_at, is_active, created_at FROM accurate_tokens ORDER BY created_at DESC LIMIT 5'
    );
    
    if (tokens.length === 0) {
      console.log('   ✗ NO TOKENS FOUND!');
      console.log('');
      console.log('SOLUSI:');
      console.log('1. Login ke aplikasi sebagai superadmin');
      console.log('2. Buka halaman Settings');
      console.log('3. Klik "Hubungkan Accurate"');
      console.log('4. Authorize aplikasi di Accurate Online');
      console.log('5. Token akan otomatis tersimpan');
      return;
    }

    console.log(`   Found ${tokens.length} token(s):`);
    tokens.forEach((token, idx) => {
      const isExpired = new Date(token.expires_at) < new Date();
      const status = token.is_active && !isExpired ? '✓ VALID' : '✗ INVALID';
      console.log(`   ${idx + 1}. ${status} - User: ${token.user_id}, Expires: ${token.expires_at}`);
    });
    console.log('');

    // 5. Get active token
    console.log('5. Getting active token...');
    const [activeTokens] = await connection.query(
      `SELECT * FROM accurate_tokens 
       WHERE is_active = TRUE AND expires_at > NOW()
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (activeTokens.length === 0) {
      console.log('   ✗ NO ACTIVE TOKEN!');
      console.log('');
      console.log('MASALAH: Semua token sudah expired atau tidak aktif');
      console.log('SOLUSI: Hubungkan ulang Accurate via Settings page');
      return;
    }

    const token = activeTokens[0];
    console.log('   ✓ Active token found');
    console.log('   User ID:', token.user_id);
    console.log('   Expires at:', token.expires_at);
    console.log('   Token length:', token.access_token.length);
    console.log('');

    // 6. Test API call
    console.log('6. Testing Accurate API...');
    const axios = require('axios');
    
    const apiUrl = envVars.ACCURATE_API_URL || 'https://public-api.accurate.id/api';
    const databaseId = envVars.ACCURATE_DATABASE_ID;

    if (!databaseId) {
      console.log('   ✗ ACCURATE_DATABASE_ID not set in .env!');
      console.log('   Add this to backend/.env:');
      console.log('   ACCURATE_DATABASE_ID=your_database_id');
      return;
    }

    console.log('   API URL:', apiUrl);
    console.log('   Database ID:', databaseId);
    console.log('   Calling /sales-order/list.do...');

    try {
      const response = await axios.get(`${apiUrl}/sales-order/list.do`, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'X-Api-Key': databaseId,
          'Content-Type': 'application/json'
        },
        params: {
          sp: 1,
          pageSize: 5
        },
        timeout: 10000
      });

      console.log('   ✓ API CALL SUCCESS!');
      console.log('   Status:', response.status);
      console.log('   Response keys:', Object.keys(response.data));
      
      if (response.data.d) {
        console.log('   Sales Orders found:', response.data.d.length);
        if (response.data.d.length > 0) {
          const so = response.data.d[0];
          console.log('   First SO:', {
            id: so.id,
            number: so.number,
            customer: so.customerName
          });
        }
      } else {
        console.log('   Response data:', JSON.stringify(response.data, null, 2));
      }
      
      console.log('');
      console.log('='.repeat(60));
      console.log('✓✓✓ ALL TESTS PASSED! ✓✓✓');
      console.log('Accurate API connection is working perfectly!');
      console.log('='.repeat(60));

    } catch (apiError) {
      console.log('   ✗ API CALL FAILED!');
      console.log('');
      console.log('Error Details:');
      console.log('   Status:', apiError.response?.status);
      console.log('   Message:', apiError.message);
      
      if (apiError.response?.data) {
        console.log('   Response:', JSON.stringify(apiError.response.data, null, 2));
      }
      
      console.log('');
      console.log('POSSIBLE CAUSES:');
      
      if (apiError.response?.status === 401) {
        console.log('   ✗ 401 Unauthorized - Token tidak valid atau expired');
        console.log('   SOLUSI: Hubungkan ulang Accurate via Settings');
      } else if (apiError.response?.status === 403) {
        console.log('   ✗ 403 Forbidden - Database ID salah atau tidak ada akses');
        console.log('   SOLUSI: Cek ACCURATE_DATABASE_ID di .env');
      } else if (apiError.code === 'ENOTFOUND') {
        console.log('   ✗ DNS Error - Tidak bisa resolve domain Accurate');
        console.log('   SOLUSI: Cek koneksi internet atau DNS settings');
      } else if (apiError.code === 'ETIMEDOUT') {
        console.log('   ✗ Timeout - Koneksi ke Accurate terlalu lama');
        console.log('   SOLUSI: Cek firewall atau network connectivity');
      } else {
        console.log('   ✗ Unknown error');
        console.log('   SOLUSI: Cek logs untuk detail lebih lanjut');
      }
    }

  } catch (error) {
    console.error('');
    console.error('FATAL ERROR:', error.message);
    console.error('');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run test
quickTest().catch(console.error);
