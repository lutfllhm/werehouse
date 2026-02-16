const jwt = require('jsonwebtoken');
require('dotenv').config();

// Data user untuk generate token
const userData = {
  userId: 1,
  email: 'superadmin@iware.id',
  role: 'superadmin'
};

// Generate token
const token = jwt.sign(
  userData,
  process.env.JWT_SECRET || 'iware_secret_key_2024_change_this_in_production',
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);

console.log('\n=================================');
console.log('JWT Token Generator');
console.log('=================================');
console.log('\nUser Data:');
console.log(JSON.stringify(userData, null, 2));
console.log('\nGenerated Token:');
console.log(token);
console.log('\n=================================');
console.log('\nCara Menggunakan:');
console.log('Authorization: Bearer ' + token);
console.log('\n=================================\n');

// Verify token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iware_secret_key_2024_change_this_in_production');
  console.log('Token Valid! Decoded:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('\n=================================\n');
} catch (error) {
  console.error('Token Invalid:', error.message);
}
