const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Load .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

console.log('');
console.log('='.repeat(80));
console.log('TEST ACCURATE API CONNECTION');
console.log('='.repeat(80));
console.log('');

const apiUrl = process.env.ACCURATE_API_URL;
const accessToken = process.env.ACCURATE_ACCESS_TOKEN;
const databaseId = process.env.ACCURATE_DATABASE_ID;

console.log('Configuration:');
console.log('  API URL:', apiUrl);
console.log('  Database ID:', databaseId);
console.log('  Access Token:', accessToken ? accessToken.substring(0, 30) + '...' : '❌ NOT SET');
console.log('');

if (!apiUrl || !accessToken || !databaseId) {
  console.log('❌ ERROR: Missing required configuration!');
  process.exit(1);
}

async function testAPI() {
  try {
    console.log('Testing API connection...');
    console.log('-'.repeat(80));
    
    // Test 1: Check database status
    console.log('\n1. Testing database status...');
    const statusResponse = await axios.get(`${apiUrl}/db-status.do`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Api-Key': databaseId
      }
    });
    
    console.log('   ✓ Database Status:', statusResponse.data.s ? 'Active' : 'Inactive');
    console.log('   Response:', JSON.stringify(statusResponse.data, null, 2));
    
    // Test 2: Get item list (first 5)
    console.log('\n2. Testing item list...');
    const itemsResponse = await axios.get(`${apiUrl}/item/list.do`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Api-Key': databaseId
      },
      params: {
        sp: {
          pageSize: 5,
          page: 1
        }
      }
    });
    
    console.log('   ✓ Items found:', itemsResponse.data.sp?.pageCount || 0);
    if (itemsResponse.data.d && itemsResponse.data.d.length > 0) {
      console.log('   Sample items:');
      itemsResponse.data.d.slice(0, 3).forEach((item, idx) => {
        console.log(`     ${idx + 1}. ${item.no} - ${item.name}`);
      });
    }
    
    // Test 3: Get sales order list (first 5)
    console.log('\n3. Testing sales order list...');
    const soResponse = await axios.get(`${apiUrl}/sales-order/list.do`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Api-Key': databaseId
      },
      params: {
        sp: {
          pageSize: 5,
          page: 1
        }
      }
    });
    
    console.log('   ✓ Sales Orders found:', soResponse.data.sp?.pageCount || 0);
    if (soResponse.data.d && soResponse.data.d.length > 0) {
      console.log('   Sample sales orders:');
      soResponse.data.d.slice(0, 3).forEach((so, idx) => {
        console.log(`     ${idx + 1}. ${so.number} - ${so.customerName} (${so.transDate})`);
      });
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log('✓ ALL TESTS PASSED! Accurate API is working correctly.');
    console.log('='.repeat(80));
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('❌ ERROR:', error.message);
    
    if (error.response) {
      console.log('');
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('');
        console.log('⚠ Token expired or invalid!');
        console.log('Please get a new token from Accurate Online.');
      }
    }
    
    console.log('');
    console.log('='.repeat(80));
    process.exit(1);
  }
}

testAPI();
