import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import Product from '@/models/Product';
import { config } from '@/config';

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
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

    // Create delivery person
    const deliveryPassword = await bcrypt.hash('delivery123', 12);
    const deliveryPerson = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@juicydelights.com',
      phone: '+919876543211',
      password: deliveryPassword,
      role: 'delivery',
      isActive: true,
      isVerified: true,
      address: [{
        street: '456 Delivery Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        country: 'India',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      }]
    });

    // Create sample customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customer = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876543212',
      password: customerPassword,
      role: 'customer',
      isActive: true,
      isVerified: true,
      address: [{
        street: '789 Customer Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400003',
        country: 'India',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      }]
    });

    // Create sample products
    const products = [
      {
        name: 'Alphonso Mangoes',
        description: 'Premium Alphonso mangoes from Ratnagiri, known for their sweet taste and golden color',
        price: 150,
        originalPrice: 200,
        category: 'fruits',
        subcategory: 'tropical',
        images: ['https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500'],
        badge: 'seasonal',
        unit: 'kg',
        weight: 1,
        nutritionalInfo: {
          calories: 60,
          protein: 0.8,
          carbs: 15,
          fat: 0.4,
          fiber: 1.6
        },
        origin: 'Ratnagiri, Maharashtra',
        season: ['summer'],
        isOrganic: false,
        isImported: false,
        stock: { available: 50, reserved: 0, minThreshold: 5 },
        rating: { average: 4.5, count: 120 },
        tags: ['mango', 'alphonso', 'seasonal', 'sweet'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Kashmiri Apples',
        description: 'Fresh, crisp Kashmiri apples with a perfect balance of sweetness and tartness',
        price: 120,
        originalPrice: 160,
        category: 'fruits',
        subcategory: 'temperate',
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'],
        badge: 'imported',
        unit: 'kg',
        weight: 1,
        nutritionalInfo: {
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          fiber: 2.4
        },
        origin: 'Kashmir, India',
        season: ['autumn', 'winter'],
        isOrganic: false,
        isImported: false,
        stock: { available: 75, reserved: 0, minThreshold: 10 },
        rating: { average: 4.3, count: 95 },
        tags: ['apple', 'kashmiri', 'crisp', 'fresh'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Fresh Strawberries',
        description: 'Sweet and juicy strawberries, perfect for desserts and smoothies',
        price: 180,
        originalPrice: 220,
        category: 'fruits',
        subcategory: 'berries',
        images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500'],
        badge: 'imported',
        unit: 'pack',
        weight: 0.5,
        nutritionalInfo: {
          calories: 32,
          protein: 0.7,
          carbs: 7.7,
          fat: 0.3,
          fiber: 2.0
        },
        origin: 'Mahabaleshwar, Maharashtra',
        season: ['winter', 'spring'],
        isOrganic: false,
        isImported: false,
        stock: { available: 30, reserved: 0, minThreshold: 5 },
        rating: { average: 4.7, count: 85 },
        tags: ['strawberry', 'berries', 'sweet', 'fresh'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Organic Bananas',
        description: 'Naturally ripened organic bananas, rich in potassium and vitamins',
        price: 60,
        category: 'fruits',
        subcategory: 'tropical',
        images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'],
        badge: 'organic',
        unit: 'dozen',
        weight: 2,
        nutritionalInfo: {
          calories: 89,
          protein: 1.1,
          carbs: 23,
          fat: 0.3,
          fiber: 2.6
        },
        origin: 'Kerala, India',
        season: ['year-round'],
        isOrganic: true,
        isImported: false,
        stock: { available: 100, reserved: 0, minThreshold: 20 },
        rating: { average: 4.2, count: 150 },
        tags: ['banana', 'organic', 'potassium', 'healthy'],
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Premium Grapes',
        description: 'Seedless premium grapes, perfect for snacking and wine making',
        price: 200,
        originalPrice: 250,
        category: 'fruits',
        subcategory: 'temperate',
        images: ['https://images.unsplash.com/photo-1537640538966-79f369143b8f?w=500'],
        badge: 'imported',
        unit: 'kg',
        weight: 1,
        nutritionalInfo: {
          calories: 62,
          protein: 0.6,
          carbs: 16,
          fat: 0.2,
          fiber: 0.9
        },
        origin: 'Nashik, Maharashtra',
        season: ['summer', 'autumn'],
        isOrganic: false,
        isImported: false,
        stock: { available: 40, reserved: 0, minThreshold: 8 },
        rating: { average: 4.4, count: 75 },
        tags: ['grapes', 'seedless', 'premium', 'wine'],
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Fresh Oranges',
        description: 'Juicy and vitamin C rich oranges, perfect for breakfast and juices',
        price: 80,
        category: 'fruits',
        subcategory: 'citrus',
        images: ['https://images.unsplash.com/photo-1557800634-7bf3c73be389?w=500'],
        badge: 'seasonal',
        unit: 'kg',
        weight: 1,
        nutritionalInfo: {
          calories: 47,
          protein: 0.9,
          carbs: 12,
          fat: 0.1,
          fiber: 2.4
        },
        origin: 'Nagpur, Maharashtra',
        season: ['winter'],
        isOrganic: false,
        isImported: false,
        stock: { available: 60, reserved: 0, minThreshold: 10 },
        rating: { average: 4.1, count: 110 },
        tags: ['orange', 'citrus', 'vitamin-c', 'juicy'],
        isActive: true,
        isFeatured: false
      }
    ];

    await Product.insertMany(products);

    console.log('Database seeded successfully!');
    console.log('Created users:');
    console.log('- Admin:', admin.email);
    console.log('- Delivery Person:', deliveryPerson.email);
    console.log('- Customer:', customer.email);
    console.log(`Created ${products.length} products`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
