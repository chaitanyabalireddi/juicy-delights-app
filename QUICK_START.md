# Quick Start Guide

## 🚀 Launch the App in 3 Steps

### Step 1: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in backend/.env
```

### Step 2: Start Backend
```bash
cd juicy-delights-app-main/backend
npm install
npm run dev
```
Backend will run on: http://localhost:3000

### Step 3: Start Frontend
```bash
# In a new terminal, from the main directory
cd juicy-delights-app-main
npm install
npm run dev
```
Frontend will run on: http://localhost:5173

## ✨ Features Available

### User Features
- 🛒 Browse and add products to cart
- 📍 Add/manage delivery addresses with GPS location
- 💰 Place orders with Cash on Delivery (COD)
- 📱 Track orders in real-time
- 🚚 See live delivery partner location

### Admin Features
- ➕ Add new products with images
- ✏️ Update product details, prices, images
- 📦 Manage inventory and stock
- 🗑️ Delete products
- 📊 View all orders

## 🔑 Access Admin Dashboard

1. Register a new user at http://localhost:5173/login
2. Open MongoDB and update the user's role:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
);
```
3. Logout and login again
4. Access admin features from the navigation menu

## 📝 Default Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/juicy-delights
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend
- API URL: http://localhost:3000
- Socket.IO: http://localhost:3000 (for real-time tracking)

## 🧪 Test Real-Time Tracking

1. Place an order as a user
2. Go to Orders → Track Order
3. Open browser console and run:
```javascript
const socket = io('http://localhost:3000');
socket.emit('join-delivery', 'YOUR_ORDER_ID');
setInterval(() => {
  socket.emit('update-location', {
    orderId: 'YOUR_ORDER_ID',
    location: {
      lat: 12.9716 + Math.random() * 0.01,
      lng: 77.5946 + Math.random() * 0.01
    }
  });
}, 3000);
```

## 🆘 Troubleshooting

- **Backend won't start**: Check MongoDB connection
- **Frontend can't connect**: Verify backend is running on port 3000
- **Can't login as admin**: Update role in database
- **Socket.IO not working**: Check CORS settings

## 📚 Full Documentation
See `LAUNCH_INSTRUCTIONS.md` for complete setup and deployment guide.

