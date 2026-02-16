const bcrypt = require('bcryptjs');

// Script untuk generate password hash
const password = process.argv[2] || 'jasad666';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n=================================');
  console.log('Password Hash Generator');
  console.log('=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('Copy hash di atas dan paste ke file config/database.sql');
  console.log('pada bagian INSERT superadmin\n');
});
