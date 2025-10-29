# Juicy Delights Backend API

A comprehensive backend API for a fruit delivery application with real-time tracking, payment integration, and order management.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 🛒 **Product Management** - Complete product catalog with categories, inventory, and search
- 📦 **Order Management** - Full order lifecycle from creation to delivery
- 💳 **Payment Integration** - Stripe and Razorpay payment gateways
- 🚚 **Real-time Delivery Tracking** - Live location updates with WebSocket
- 📱 **Notifications** - Email and SMS notifications for order updates
- 📊 **Admin Dashboard** - Order and delivery management
- 🔍 **Search & Filtering** - Advanced product search and filtering
- ⭐ **Rating System** - Customer and delivery person ratings

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **Redis** - Caching and real-time features
- **Socket.IO** - Real-time communication
- **Stripe & Razorpay** - Payment processing
- **Twilio** - SMS notifications
- **Nodemailer** - Email notifications
- **JWT** - Authentication
- **Joi** - Validation

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP for phone verification
- `POST /api/auth/verify-otp` - Verify phone OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/address` - Add user address

### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/search` - Search products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id/stock` - Update product stock (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/:id/tracking` - Get order tracking info
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (Admin/Delivery)

### Payments
- `GET /api/payments/methods` - Get available payment methods
- `POST /api/payments/stripe/intent` - Create Stripe payment intent
- `POST /api/payments/razorpay/order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify Razorpay payment
- `POST /api/payments/refund` - Process refund
- `POST /api/payments/stripe/webhook` - Stripe webhook handler

### Delivery
- `POST /api/delivery/assign` - Assign delivery person (Admin)
- `GET /api/delivery/active` - Get active deliveries (Delivery Person)
- `PUT /api/delivery/:deliveryId/accept` - Accept delivery assignment
- `PUT /api/delivery/:deliveryId/picked-up` - Mark as picked up
- `PUT /api/delivery/:deliveryId/delivered` - Mark as delivered
- `PUT /api/delivery/:deliveryId/location` - Update delivery location
- `GET /api/delivery/:orderId/tracking` - Get delivery tracking
- `POST /api/delivery/:deliveryId/rate` - Rate delivery

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Fill in the required environment variables in `.env`

4. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod
   
   # Redis
   redis-server
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/juicy-delights
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=30d

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS
FRONTEND_URL=http://localhost:3000
```

## Database Models

### User
- Customer, Delivery Person, Admin roles
- Address management
- Preferences and settings

### Product
- Product catalog with categories
- Inventory management
- Nutritional information
- Ratings and reviews

### Order
- Order lifecycle management
- Delivery and pickup options
- Payment integration

### Delivery
- Real-time location tracking
- Delivery person assignment
- Status updates and proof

### Payment
- Multiple payment gateways
- Refund processing
- Transaction history

## Real-time Features

The API includes real-time delivery tracking using Socket.IO:

```javascript
// Connect to delivery tracking
const socket = io('http://localhost:5000');

// Join delivery room
socket.emit('join-delivery', orderId);

// Listen for location updates
socket.on('location-update', (data) => {
  console.log('New location:', data.location);
});

// Listen for status updates
socket.on('status-update', (data) => {
  console.log('Status changed:', data.status);
});
```

## Payment Integration

### Stripe
- Payment intents for secure payments
- Webhook handling for payment events
- Refund processing

### Razorpay
- Order creation and verification
- Signature verification
- Refund processing

## Notification System

- **Email Notifications**: Order confirmations, status updates
- **SMS Notifications**: OTP verification, delivery updates
- **Real-time Updates**: Live delivery tracking

## API Documentation

The API includes comprehensive documentation with:
- Request/response schemas
- Error handling
- Authentication requirements
- Rate limiting

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
