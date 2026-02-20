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

async function checkAccurateIntegration() {
  console.log('='.repeat(70));
  console.log('DIAGNOSA INTEGRASI ACCURATE ONLINE');
  console.log('='.repeat(70));
  console.log('');

  try {
    // 1. Cek environment variables
    console.log('1. ENVIRONMENT VARIABLES');
    console.log('-'.repeat(70));
    console.log('   ACCURATE_API_URL:', process.env.ACCURATE_API_URL || '❌ NOT SET');
    console.log('   ACCURATE_DATABASE_ID:', process.env.ACCURATE_DATABASE_ID || '❌ NOT SET');
    console.log('   ACCURATE_ACCESS_TOKEN:', process.env.ACCURATE_ACCESS_TOKEN ? '✓ SET' : '❌ NOT SET');
    console.log('   ACCURATE_CLIENT_ID:', process.env.ACCURATE_CLIENT_ID || '❌ NOT SET');
    console.log('   ACCURATE_CLIENT_SECRET:', process.env.ACCURATE_CLIENT_SECRET ? '✓ SET' : '❌ NOT SET');
    console.log('');

    // 2. Cek database connection
    console.log('2. DATABASE CONNECTION');
    console.log('-'.repeat(70));
    try {
      await pool.query('SELECT 1');
      console.log('   ✓ Database connected');
    } catch (dbError) {
      console.log('   ❌ Database connection failed:', dbError.message);
      return;
    }
    console.log('');

    // 3. Cek tabel accurate_tokens
    console.log('3. TABLE accurate_tokens');
    console.log('-'.repeat(70));
    const [tables] = await pool.query("SHOW TABLES LIKE 'accurate_tokens'");
    if (tables.length === 0) {
      console.log('   ❌ Table accurate_tokens NOT FOUND!');
      console.log('   📝 Solusi: Jalankan migration');
      console.log('      node backend/scripts/addAccurateTokensTable.js');
      console.log('');
    } else {
      console.log('   ✓ Table accurate_tokens exists');
      
      // Cek struktur tabel
      const [columns] = await pool.query("DESCRIBE accurate_tokens");
      console.log('   Columns:', columns.map(c => c.Field).join(', '));
      console.log('');
    }

    // 4. Cek tokens di database
    console.log('4. TOKENS IN DATABASE');
    console.log('-'.repeat(70));
    const [tokens] = await pool.query(`
      SELECT id, user_id, token_type, 
             LEFT(access_token, 20) as token_preview,
             expires_at, is_active, created_at 
      FROM accurate_tokens 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (tokens.length === 0) {
      console.log('   ❌ No tokens found in database');
      console.log('');
      console.log('   📝 SOLUSI:');
      console.log('   1. Login ke aplikasi sebagai superadmin');
      console.log('   2. Buka halaman Settings');
      console.log('   3. Klik "Hubungkan Accurate"');
      console.log('   4. Authorize aplikasi di Accurate');
      console.log('');
    } else {
      console.log(`   ✓ Found ${tokens.length} token(s):`);
      tokens.forEach((token, idx) => {
        const isExpired = new Date(token.expires_at) < new Date();
        const status = token.is_active && !isExpired ? '✓ ACTIVE' : '❌ INACTIVE/EXPIRED';
        console.log(`   ${idx + 1}. ${status}`);
        console.log(`      User ID: ${token.user_id}`);
        console.log(`      Token: ${token.token_preview}...`);
        console.log(`      Expires: ${token.expires_at}`);
        console.log(`      Created: ${token.created_at}`);
      });
      console.log('');
    }

    // 5. Cek users (superadmin)
    console.log('5. SUPERADMIN USERS');
    console.log('-'.repeat(70));
    const [users] = await pool.query(`
      SELECT id, email, nama, role 
      FROM users 
      WHERE role = 'superadmin'
    `);
    
    if (users.length === 0) {
      console.log('   ❌ No superadmin user found');
      console.log('   📝 Solusi: Buat user superadmin terlebih dahulu');
      console.log('');
    } else {
      console.log(`   ✓ Found ${users.length} superadmin(s):`);
      users.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email} (${user.nama}) - ID: ${user.id}`);
      });
      console.log('');
    }

    // 6. Cek items di database
    console.log('6. ITEMS IN DATABASE');
    console.log('-'.repeat(70));
    const [itemCount] = await pool.query('SELECT COUNT(*) as total FROM items');
    const [recentItems] = await pool.query(`
      SELECT id, kode_item, nama_item, last_sync 
      FROM items 
      ORDER BY last_sync DESC 
      LIMIT 5
    `);
    
    console.log(`   Total items: ${itemCount[0].total}`);
    if (itemCount[0].total === 0) {
      console.log('   ❌ No items in database');
      console.log('   📝 Solusi: Klik tombol "Sync dari Accurate" di halaman Items');
      console.log('');
    } else {
      console.log('   ✓ Recent items:');
      recentItems.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.kode_item} - ${item.nama_item}`);
        console.log(`      Last sync: ${item.last_sync}`);
      });
      console.log('');
    }

    // 7. Kesimpulan
    console.log('='.repeat(70));
    console.log('KESIMPULAN');
    console.log('='.repeat(70));
    
    const hasEnvVars = process.env.ACCURATE_API_URL && process.env.ACCURATE_DATABASE_ID;
    const hasTable = tables.length > 0;
    const hasTokens = tokens.length > 0 && tokens.some(t => t.is_active);
    const hasItems = itemCount[0].total > 0;
    
    if (hasEnvVars && hasTable && hasTokens && hasItems) {
      console.log('✓ Integrasi Accurate sudah berfungsi dengan baik!');
    } else {
      console.log('❌ Integrasi Accurate belum lengkap. Perlu action:');
      console.log('');
      
      if (!hasEnvVars) {
        console.log('   [ ] Set environment variables di .env atau docker-compose.yml');
      }
      if (!hasTable) {
        console.log('   [ ] Jalankan migration: node backend/scripts/addAccurateTokensTable.js');
      }
      if (!hasTokens) {
        console.log('   [ ] Connect Accurate via Settings page di aplikasi');
      }
      if (!hasItems) {
        console.log('   [ ] Sync items dari Accurate via Items page');
      }
    }
    console.log('='.repeat(70));

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

// Run check
checkAccurateIntegration();
