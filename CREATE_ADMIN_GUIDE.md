# 🔐 Create Admin Account - Guide

You need an admin account to access admin features. Here are several ways to create one:

---

## ✅ Method 1: Run Seed Script (Recommended)

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Run Seed Script
```bash
node seed-database.js
```

This will create an admin user with:
- **Email:** `admin@juicydelights.com`
- **Password:** `admin123`
- **Role:** `admin`

---

## ✅ Method 2: Use API Endpoint (Quick)

### Step 1: Make API Call

**Using curl:**
```bash
curl -X POST https://fruitjet.onrender.com/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@juicydelights.com",
    "password": "admin123",
    "secret": "CREATE_ADMIN_SECRET_2024"
  }'
```

**Using Postman or Browser:**
1. URL: `https://fruitjet.onrender.com/api/auth/create-admin`
2. Method: `POST`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "email": "admin@juicydelights.com",
  "password": "admin123",
  "secret": "CREATE_ADMIN_SECRET_2024"
}
```

**Using JavaScript (Browser Console):**
```javascript
fetch('https://fruitjet.onrender.com/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@juicydelights.com',
    password: 'admin123',
    secret: 'CREATE_ADMIN_SECRET_2024'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## ✅ Method 3: Update Existing User to Admin

If you already have a user account, you can update it to admin:

### Using MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Go to **Database** → **Browse Collections**
3. Find your `users` collection
4. Find your user document
5. Edit the document:
   - Change `role` from `"customer"` to `"admin"`
   - Save

### Using MongoDB Compass:

1. Connect to your MongoDB database
2. Navigate to `juicy-delights` database
3. Open `users` collection
4. Find your user
5. Update `role` field to `"admin"`

---

## ✅ Method 4: Use create-admin.js Script

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Run Script
```bash
node create-admin.js
```

This will create or update admin user.

---

## 🔑 Default Admin Credentials

After running any method above, use these credentials:

- **Email:** `admin@juicydelights.com`
- **Password:** `admin123`

**⚠️ Important:** Change the password after first login!

---

## 🧪 Test Admin Login

### Step 1: Login in Your App

1. Open your app
2. Go to Login page
3. Enter:
   - Email: `admin@juicydelights.com`
   - Password: `admin123`
4. Click Login

### Step 2: Verify Admin Access

After login, you should be able to access:
- `/admin/stock` - Admin Stock Management
- `/admin/orders` - Admin Orders Management

---

## 🆘 Troubleshooting

### "Invalid credentials" Error?

**Check:**
- ✅ Admin user exists in database
- ✅ Email is correct: `admin@juicydelights.com`
- ✅ Password is correct: `admin123`
- ✅ User role is `"admin"` (not `"customer"`)

### "Access Denied" When Accessing Admin Pages?

**Check:**
- ✅ User role is `"admin"` in database
- ✅ Logged in user has admin role
- ✅ Check browser console for errors
- ✅ Try logging out and logging back in

### Can't Create Admin via API?

**Check:**
- ✅ Secret key is correct: `CREATE_ADMIN_SECRET_2024`
- ✅ Backend is running
- ✅ MongoDB connection is working
- ✅ Check backend logs for errors

---

## 🔒 Security Note

**For Production:**
1. Change the secret in `/api/auth/create-admin` endpoint
2. Remove or disable the endpoint after creating admin
3. Change default admin password
4. Use strong passwords

---

## 📋 Quick Checklist

- [ ] Run seed script or use API endpoint
- [ ] Verify admin user exists in database
- [ ] Login with admin credentials
- [ ] Test admin pages access
- [ ] Change admin password (recommended)

---

## ✅ Summary

**Easiest Method:**
1. Run: `cd backend && node seed-database.js`
2. Login with: `admin@juicydelights.com` / `admin123`
3. Done!

**Or use API:**
1. POST to `/api/auth/create-admin` with secret
2. Login with created credentials
3. Done!

---

**Your admin account is ready!** 🎉

