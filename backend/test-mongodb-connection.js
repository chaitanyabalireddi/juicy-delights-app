// Test MongoDB Connection
// Run: node test-mongodb-connection.js

const mongoose = require('mongoose');

// Replace <db_password> with your actual password
// Replace DATABASE_NAME with your database name (e.g., juicy-delights)
const connectionString = 'mongodb+srv://amgochaitanya_db_user:<db_password>@cluster0.rekixpl.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

mongoose.connect(connectionString)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('✅ Connection string is correct!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:');
    console.error(error.message);
    console.log('\n💡 Common issues:');
    console.log('1. Check if password is correct');
    console.log('2. Check if password needs URL encoding (special characters)');
    console.log('3. Check if Network Access allows your IP (0.0.0.0/0 for all)');
    process.exit(1);
  });

