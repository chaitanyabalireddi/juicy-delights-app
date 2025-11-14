# Juicy Delights Delivery App - Launch Instructions

## Overview
This is a complete delivery app with live location tracking, address management, COD-only payments, and an admin dashboard for product management.

## Features Implemented

### User Features
- ✅ User registration and login
- ✅ Browse products by categories
- ✅ Add products to cart
- ✅ Address management (add, edit, delete addresses with GPS location)
- ✅ Place orders with Cash on Delivery (COD) only
- ✅ Real-time order tracking with live delivery partner location
- ✅ Order history and status updates

### Admin Features
- ✅ Add new products with images, pricing, and stock
- ✅ Update product details (name, description, images, prices)
- ✅ Manage product inventory (stock levels)
- ✅ Delete products
- ✅ View and manage orders

### Technical Features
- ✅ Socket.IO for real-time location tracking
- ✅ MongoDB for data persistence
- ✅ JWT authentication
- ✅ RESTful API with Express.js
- ✅ React with TypeScript
- ✅ Responsive design

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd juicy-delights-app-main/backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/juicy-delights
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juicy-delights

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Start the backend server:

```bash
npm run dev
# or
node server.js
```

The backend will run on http://localhost:3000

### 2. Frontend Setup

```bash
# Go back to the main directory
cd ..

# Install dependencies
npm install

# Create environment file (if needed)
# Add VITE_API_URL=http://localhost:3000 to .env
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Default Admin Account

To access the admin dashboard, you'll need to create an admin user in MongoDB or register a user and manually set their role to 'admin' in the database.

### Option 1: Create Admin via MongoDB

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@juicydelights.com",
  phone: "+1234567890",
  password: "$2a$12$...", // Use bcrypt to hash "admin123"
  role: "admin",
  isActive: true,
  isVerified: true,
  address: [],
  preferences: {
    notifications: true,
    sms: true,
    email: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Option 2: Update Existing User

```javascript
// After registering a user, update their role:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
);
```

## Using the Application

### For Users

1. **Register/Login**: Create an account or log in
2. **Browse Products**: Explore fruits and products on the home page
3. **Add to Cart**: Select products and add them to cart
4. **Add Address**: 
   - Go to Profile or during checkout
   - Click "Add Address"
   - Fill in address details
   - Optionally, click "Use Current Location" to capture GPS coordinates
5. **Place Order**:
   - Go to Cart
   - Select delivery address
   - Review COD payment method (only option available)
   - Click "Place Order (COD)"
6. **Track Order**:
   - Go to Orders page
   - Click "Track Order" on active orders
   - View real-time delivery partner location updates

### For Admin

1. **Login**: Use admin credentials
2. **Manage Products** (Admin → Stock):
   - Click "Add Product" to create new products
   - Fill in product details (name, description, price, images, category, stock)
   - Edit existing products' names, descriptions, prices, images
   - Update stock levels
   - Delete products
3. **Manage Orders** (Admin → Orders):
   - View all orders
   - Update order status
   - Assign delivery partners

## Real-Time Location Tracking

The app uses Socket.IO for real-time communication:

### For Delivery Partners (Manual Testing)

You can simulate delivery partner location updates using Socket.IO client or the browser console:

```javascript
// Connect to socket
const socket = io('http://localhost:3000');

// Join delivery room for an order
socket.emit('join-delivery', 'ORDER_ID');

// Send location updates (simulate delivery partner moving)
setInterval(() => {
  socket.emit('update-location', {
    orderId: 'ORDER_ID',
    location: {
      lat: 12.9716 + Math.random() * 0.01, // Simulate movement
      lng: 77.5946 + Math.random() * 0.01
    }
  });
}, 5000); // Update every 5 seconds
```

## Payment Method

Currently, the app **ONLY supports Cash on Delivery (COD)**. Online payment methods are not implemented.

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user profile
- POST `/api/auth/address` - Add address
- PUT `/api/auth/address/:index` - Update address
- DELETE `/api/auth/address/:index` - Delete address

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin only)
- PUT `/api/products/:id` - Update product (Admin only)
- PUT `/api/products/:id/stock` - Update stock (Admin only)
- DELETE `/api/products/:id` - Delete product (Admin only)

### Orders
- GET `/api/orders` - Get user orders
- GET `/api/orders/:id` - Get single order
- POST `/api/orders` - Create order
- PUT `/api/orders/:id/status` - Update order status (Admin only)

### Delivery (Real-time via Socket.IO)
- `join-delivery` - Join order tracking room
- `leave-delivery` - Leave order tracking room
- `update-location` - Update delivery partner location
- `location-update` - Receive location updates
- `delivery-status-update` - Update delivery status
- `status-update` - Receive status updates

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MongoDB connection string in .env
- Ensure port 3000 is not in use

### Frontend won't connect to backend
- Verify backend is running on http://localhost:3000
- Check CORS settings in backend
- Verify VITE_API_URL in frontend environment

### Socket.IO not connecting
- Ensure backend server is running
- Check browser console for connection errors
- Verify CORS settings allow Socket.IO connections

### Can't access admin dashboard
- Verify user role is set to 'admin' in database
- Check authentication token is valid
- Try logging out and logging back in

## Mobile App Build (Optional)

To build for Android/iOS:

```bash
# Build the web app first
npm run build

# Sync with Capacitor
npx cap sync

# Open in Android Studio
npx cap open android

# Or open in Xcode
npx cap open ios
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in environment
2. Use a production MongoDB instance
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Deploy to services like Heroku, Railway, or Render

### Frontend
1. Build the production bundle: `npm run build`
2. Deploy `dist` folder to Netlify, Vercel, or similar
3. Set `VITE_API_URL` to production backend URL

## Support

For issues or questions, please check:
- MongoDB connection status
- Backend logs in terminal
- Browser console for frontend errors
- Network tab for API calls

## License

MIT License

