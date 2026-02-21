const path = require('path');
const fs = require('fs');

// Load .env file (optional in Docker environment)
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('✓ Loaded .env from:', envPath);
} else {
  console.log('⚠ .env file not found, using environment variables from Docker/system');
}

const { pool } = require('../config/database');

async function addTokenFromEnv() {
  console.log('='.repeat(70));
  console.log('ADD ACCURATE TOKEN FROM ENVIRONMENT VARIABLES');
  console.log('='.repeat(70));
  console.log('');

  try {
    // 1. Cek environment variables
    console.log('1. Checking environment variables...');
    
    if (!process.env.ACCURATE_ACCESS_TOKEN) {
      console.log('   ❌ ACCURATE_ACCESS_TOKEN not found in environment');
      console.log('   Set ACCURATE_ACCESS_TOKEN di .env atau docker-compose.yml');
      process.exit(1);
    }
    
    if (!process.env.ACCURATE_DATABASE_ID) {
      console.log('   ❌ ACCURATE_DATABASE_ID not found in environment');
      console.log('   Set ACCURATE_DATABASE_ID di .env atau docker-compose.yml');
      process.exit(1);
    }
    
    console.log('   ✓ Environment variables found');
    console.log('');

    // 2. Cek database connection
    console.log('2. Checking database connection...');
    await pool.query('SELECT 1');
    console.log('   ✓ Database connected');
    console.log('');

    // 3. Cek tabel accurate_tokens
    console.log('3. Checking accurate_tokens table...');
    const [tables] = await pool.query("SHOW TABLES LIKE 'accurate_tokens'");
    if (tables.length === 0) {
      console.log('   ❌ Table accurate_tokens NOT FOUND!');
      console.log('   Run: node backend/scripts/addAccurateTokensTable.js');
      process.exit(1);
    }
    console.log('   ✓ Table exists');
    console.log('');

    // 4. Cek superadmin user
    console.log('4. Finding superadmin user...');
    const [users] = await pool.query(`
      SELECT id, nama 
      FROM users 
      WHERE role = 'superadmin' 
      LIMIT 1
    `);
    
    if (users.length === 0) {
      console.log('   ❌ No superadmin user found');
      console.log('   Create superadmin user first');
      process.exit(1);
    }
    
    const userId = users[0].id;
    console.log(`   ✓ Found superadmin: ${users[0].nama} (ID: ${userId})`);
    console.log('');

    // 5. Cek apakah sudah ada token aktif
    console.log('5. Checking existing tokens...');
    const [existingTokens] = await pool.query(`
      SELECT id, is_active, expires_at 
      FROM accurate_tokens 
      WHERE user_id = ? AND is_active = 1
    `, [userId]);
    
    if (existingTokens.length > 0) {
      console.log(`   ⚠ Found ${existingTokens.length} active token(s)`);
      console.log('   Deactivating old tokens...');
      
      await pool.query(`
        UPDATE accurate_tokens 
        SET is_active = 0 
        WHERE user_id = ?
      `, [userId]);
      
      console.log('   ✓ Old tokens deactivated');
    }
    console.log('');

    // 6. Insert token baru
    console.log('6. Inserting new token...');
    
    const accessToken = process.env.ACCURATE_ACCESS_TOKEN;
    const refreshToken = process.env.ACCURATE_REFRESH_TOKEN || null;
    
    // Calculate expiry (default 7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await pool.query(`
      INSERT INTO accurate_tokens 
      (user_id, access_token, refresh_token, token_type, expires_at, is_active)
      VALUES (?, ?, ?, 'bearer', ?, 1)
    `, [userId, accessToken, refreshToken, expiresAt]);
    
    console.log('   ✓ Token inserted successfully');
    console.log('   User ID:', userId);
    console.log('   Token preview:', accessToken.substring(0, 30) + '...');
    console.log('   Expires at:', expiresAt.toISOString());
    console.log('');

    // 7. Verify
    console.log('7. Verifying...');
    const [newTokens] = await pool.query(`
      SELECT id, user_id, expires_at, is_active 
      FROM accurate_tokens 
      WHERE user_id = ? AND is_active = 1
    `, [userId]);
    
    if (newTokens.length > 0) {
      console.log('   ✓ Token verified in database');
      console.log('');
      console.log('='.repeat(70));
      console.log('✓ SUCCESS! Token berhasil ditambahkan');
      console.log('='.repeat(70));
      console.log('');
      console.log('Next steps:');
      console.log('1. Login ke aplikasi');
      console.log('2. Buka halaman Items');
      console.log('3. Klik "Sync dari Accurate"');
      console.log('');
    } else {
      console.log('   ❌ Token verification failed');
    }

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await pool.end();
  }
}

// Run
addTokenFromEnv();
