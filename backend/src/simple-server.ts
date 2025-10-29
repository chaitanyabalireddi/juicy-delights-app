import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { config } from '@/config';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST']
  }
});

// Connect to database
const connectDB = async (): Promise<void> => {
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
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Sample products endpoint
app.get('/api/products', (req, res) => {
  const products = [
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
    data: { products }
  });
});

// Sample categories endpoint
app.get('/api/products/categories', (req, res) => {
  const categories = [
    { name: 'fruits', count: 15, subcategories: ['tropical', 'temperate', 'berries'] },
    { name: 'vegetables', count: 12, subcategories: ['leafy', 'root', 'cruciferous'] },
    { name: 'dried-fruits', count: 8, subcategories: ['nuts', 'seeds', 'dried'] }
  ];

  res.json({
    success: true,
    data: { categories }
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
const PORT = config.port;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`📱 API Documentation: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { io };
