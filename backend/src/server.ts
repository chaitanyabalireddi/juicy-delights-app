import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { config } from '@/config';
import connectDB from '@/config/database';
import { errorHandler, notFound } from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/routes/auth';
import productRoutes from '@/routes/products';
import orderRoutes from '@/routes/orders';
import paymentRoutes from '@/routes/payments';
import deliveryRoutes from '@/routes/delivery';
import uploadRoutes from '@/routes/uploads';

const app = express();
const server = createServer(app);

// Trust proxy so rate limiting & IP detection work behind Render/Heroku, etc.
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

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

const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
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
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
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
