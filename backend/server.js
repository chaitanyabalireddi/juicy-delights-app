const useLegacyServer = process.env.LEGACY_SIMPLE_SERVER === 'true';

if (!useLegacyServer) {
  require('tsconfig-paths/register');
  module.exports = require('./dist/server.js');
  return;
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = createServer(app);

// Respect proxy headers (required on Render/Heroku/etc.)
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'capacitor://localhost',
      'http://localhost',
      'https://localhost'
    ],
    methods: ['GET', 'POST']
  }
});

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/juicy-delights';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// User Schema (simple version for server.js)
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

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user exists (case-insensitive email)
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken: token,
          refreshToken: refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user (case-insensitive email search)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Login failed: Invalid password for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken: token,
          refreshToken: refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Create Admin Endpoint (for initial setup - use with caution!)
app.post('/api/auth/create-admin', async (req, res) => {
  try {
    const { email, password, secret } = req.body;

    // Simple secret check (change this in production!)
    if (secret !== 'CREATE_ADMIN_SECRET_2024') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists (case-insensitive email)
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.isActive = true;
      user.isVerified = true;
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      
      await user.save();
      
      return res.json({
        success: true,
        message: 'User updated to admin',
        data: {
          email: user.email,
          role: user.role
        }
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 12);
      
      user = await User.create({
        name: 'Admin User',
        email,
        phone: '+919876543210',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true
      });

      return res.status(201).json({
        success: true,
        message: 'Admin user created',
        data: {
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create admin'
    });
  }
});

// Check if admin exists endpoint
app.get('/api/auth/check-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@juicydelights.com';
    const admin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    res.json({
      success: true,
      exists: !!admin,
      email: adminEmail,
      role: admin?.role || null,
      isActive: admin?.isActive || false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Sample products endpoint
app.get('/api/products', (req, res) => {
  const products = [
    {
      _id: '1',
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
      _id: '2',
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
      _id: '3',
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
      _id: '4',
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
      _id: '5',
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
      _id: '6',
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

  res.json({
    success: true,
    data: { products }
  });
});

// Get featured products
app.get('/api/products/featured', (req, res) => {
  const featuredProducts = [
    {
      _id: '1',
      name: 'Alphonso Mangoes',
      description: 'Premium Alphonso mangoes from Ratnagiri',
      price: 150,
      originalPrice: 200,
      category: 'fruits',
      images: ['https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500'],
      badge: 'seasonal',
      unit: 'kg',
      stock: { available: 50 },
      rating: { average: 4.5, count: 120 },
      isActive: true,
      isFeatured: true
    },
    {
      _id: '2',
      name: 'Kashmiri Apples',
      description: 'Fresh, crisp Kashmiri apples',
      price: 120,
      originalPrice: 160,
      category: 'fruits',
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'],
      badge: 'imported',
      unit: 'kg',
      stock: { available: 75 },
      rating: { average: 4.3, count: 95 },
      isActive: true,
      isFeatured: true
    },
    {
      _id: '3',
      name: 'Fresh Strawberries',
      description: 'Sweet and juicy strawberries',
      price: 180,
      originalPrice: 220,
      category: 'fruits',
      images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500'],
      badge: 'imported',
      unit: 'pack',
      stock: { available: 30 },
      rating: { average: 4.7, count: 85 },
      isActive: true,
      isFeatured: true
    }
  ];

  res.json({
    success: true,
    data: { products: featuredProducts }
  });
});

// Sample categories endpoint
app.get('/api/products/categories', (req, res) => {
  const categories = [
    { name: 'fruits', count: 15, subcategories: ['tropical', 'temperate', 'berries', 'citrus'] },
    { name: 'vegetables', count: 12, subcategories: ['leafy', 'root', 'cruciferous'] },
    { name: 'dried-fruits', count: 8, subcategories: ['nuts', 'seeds', 'dried'] },
    { name: 'juices', count: 5, subcategories: ['fresh', 'packaged'] },
    { name: 'gift-packs', count: 3, subcategories: ['premium', 'seasonal'] }
  ];

  res.json({
    success: true,
    data: { categories }
  });
});

// Search products
app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  // Mock search results
  const searchResults = [
    {
      _id: '1',
      name: 'Alphonso Mangoes',
      description: 'Premium Alphonso mangoes from Ratnagiri',
      price: 150,
      originalPrice: 200,
      category: 'fruits',
      images: ['https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500'],
      badge: 'seasonal',
      unit: 'kg',
      stock: { available: 50 },
      rating: { average: 4.5, count: 120 },
      isActive: true,
      isFeatured: true
    }
  ];

  res.json({
    success: true,
    data: { products: searchResults }
  });
});

// Sample payment methods endpoint
app.get('/api/payments/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or other cards',
      icon: '💳',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using UPI apps like Google Pay, PhonePe',
      icon: '📱',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: '🏦',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay using Paytm, PhonePe wallet',
      icon: '💰',
      enabled: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: '💵',
      enabled: true
    }
  ];

  res.json({
    success: true,
    data: { paymentMethods }
  });
});

// Mock order creation
app.post('/api/orders', (req, res) => {
  const { items, deliveryType, deliveryAddress, paymentMethod } = req.body;
  
  // Mock order creation
  const order = {
    _id: 'ORD' + Date.now(),
    orderNumber: 'JD' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
    items: items || [],
    subtotal: 300,
    deliveryFee: deliveryType === 'delivery' ? 20 : 0,
    serviceFee: deliveryType === 'pickup' ? 10 : 0,
    total: 320,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: paymentMethod || 'cod',
    deliveryType: deliveryType || 'delivery',
    deliveryAddress: deliveryAddress,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

// Mock delivery tracking
app.get('/api/delivery/:orderId/tracking', (req, res) => {
  const { orderId } = req.params;
  
  const tracking = {
    orderId,
    status: 'out-for-delivery',
    progressPercentage: 70,
    currentLocation: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Near Bandra Station, Mumbai',
      timestamp: new Date()
    },
    estimatedArrival: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    timeRemaining: 20,
    deliveryPerson: {
      name: 'Rajesh Kumar',
      phone: '+919876543211'
    },
    route: [
      { lat: 19.0760, lng: 72.8777, address: 'Warehouse', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      { lat: 19.0760, lng: 72.8777, address: 'Near Bandra Station', timestamp: new Date() }
    ]
  };

  res.json({
    success: true,
    data: { delivery: tracking }
  });
});

// Socket.IO for real-time delivery tracking
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join delivery room for real-time tracking
  socket.on('join-delivery', (orderId) => {
    socket.join(`delivery-${orderId}`);
    console.log(`Client ${socket.id} joined delivery room for order ${orderId}`);
  });

  // Leave delivery room
  socket.on('leave-delivery', (orderId) => {
    socket.leave(`delivery-${orderId}`);
    console.log(`Client ${socket.id} left delivery room for order ${orderId}`);
  });

  // Handle delivery location updates
  socket.on('update-location', (data) => {
    const { orderId, location } = data;
    socket.to(`delivery-${orderId}`).emit('location-update', {
      orderId,
      location,
      timestamp: new Date()
    });
  });

  // Handle delivery status updates
  socket.on('delivery-status-update', (data) => {
    const { orderId, status } = data;
    socket.to(`delivery-${orderId}`).emit('status-update', {
      orderId,
      status,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📱 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🛒 Products API: http://localhost:${PORT}/api/products`);
  console.log(`💳 Payment Methods: http://localhost:${PORT}/api/payments/methods`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, io };
