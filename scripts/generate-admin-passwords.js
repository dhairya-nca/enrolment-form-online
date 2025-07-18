// scripts/generate-admin-passwords.js
// Run this script to generate password hashes for your admin users

const bcrypt = require('bcryptjs');

// Configure your admin credentials here
const adminCredentials = [
  {
    email: 'dhairya@nca.edu.au', // Replace with your actual email
    password: 'apt123' // Replace with your desired password
  },
  {
    email: 'admin@nca.edu.au', // Replace with team member email
    password: 'apt1234' // Replace with team member password
  }
];

console.log('🔐 Generating Admin Password Hashes...\n');

adminCredentials.forEach(({ email, password }) => {
  const hash = bcrypt.hashSync(password, 10);
  
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('---');
  
  // Verify the hash works
  const isValid = bcrypt.compareSync(password, hash);
  console.log(`Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log('\n');
});

console.log('📋 Copy these hashes to your login API file:');
console.log('\nconst ADMIN_PASSWORDS = {');
adminCredentials.forEach(({ email }) => {
  const hash = bcrypt.hashSync(adminCredentials.find(c => c.email === email).password, 10);
  console.log(`  '${email}': '${hash}',`);
});
console.log('};');

console.log('\n🔧 Also update the ADMIN_USERS object with these emails:');
console.log('\nconst ADMIN_USERS = {');
adminCredentials.forEach(({ email }, index) => {
  const role = index === 0 ? 'super_admin' : 'viewer';
  const permissions = index === 0 
    ? "['view_all', 'edit_all', 'delete_all', 'reset_attempts', 'view_folders', 'manage_users', 'view_analytics', 'export_data']"
    : "['view_all', 'view_analytics']";
    
  console.log(`  '${email}': {`);
  console.log(`    id: 'admin-${index + 1}',`);
  console.log(`    email: '${email}',`);
  console.log(`    role: '${role}',`);
  console.log(`    permissions: ${permissions}`);
  console.log(`  },`);
});
console.log('};');