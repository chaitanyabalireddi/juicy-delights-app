// Simple seed script to create admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  address: [{
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/juicy-delights';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@juicydelights.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('   Email: admin@juicydelights.com');
      console.log('   Password: admin123');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@juicydelights.com',
      phone: '+919876543210',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      address: [{
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      }]
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@juicydelights.com');
    console.log('   Password: admin123');
    console.log('   Role: admin\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.code === 11000) {
      console.log('⚠️  Admin user already exists with this email');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run seeding
seedDatabase();

