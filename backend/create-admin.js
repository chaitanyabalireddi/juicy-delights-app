// Script to create or update admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (matching server.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'customer' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  addresses: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/juicy-delights';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    const adminEmail = 'admin@juicydelights.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      // Update existing user to admin
      console.log('⚠️  User exists, updating to admin...');
      admin.role = 'admin';
      admin.isActive = true;
      admin.isVerified = true;
      
      // Update password if needed
      const isPasswordCorrect = await bcrypt.compare(adminPassword, admin.password);
      if (!isPasswordCorrect) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        admin.password = hashedPassword;
      }
      
      await admin.save();
      console.log('✅ User updated to admin');
    } else {
      // Create new admin user
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        phone: '+919876543210',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true
      });
      
      console.log('✅ Admin user created');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Email: ' + adminEmail);
    console.log('   Password: ' + adminPassword);
    console.log('   Role: admin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.log('⚠️  User already exists with this email');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run script
createAdmin();

