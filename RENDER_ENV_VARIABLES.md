# Render Environment Variables Setup

## Step-by-Step Guide

### After Creating the Service:

1. **Go to your service dashboard** in Render
2. **Click on "Environment"** tab (left sidebar)
3. **Click "Add Environment Variable"** button
4. **Add each variable one by one** (or all at once)

---

## Environment Variables to Add

Add these variables in order:

### 1. Node Environment
**Variable Name:** `NODE_ENV`  
**Value:** `production`

---

### 2. Port
**Variable Name:** `PORT`  
**Value:** `10000`

**Note:** Render automatically sets PORT, but setting it explicitly ensures compatibility.

---

### 3. MongoDB Connection String
**Variable Name:** `MONGODB_URI`  
**Value:** 
```
mongodb+srv://amgochaitanya_db_user:Vjd2uWhbWJTppGxG@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

**Copy this entire string exactly as shown!**

---

### 4. JWT Secret
**Variable Name:** `JWT_SECRET`  
**Value:** Generate a random secret

**How to generate:**
- Go to: https://randomkeygen.com/
- Click "CodeIgniter Encryption Keys"
- Copy one of the keys
- Example: `aB3$fGh8@jKl1#mNo5&pQr7*tUv9-wXy2`

**Or use this example:**
```
JWT_SECRET=juicy-delights-super-secret-key-2024-please-change-this
```

---

### 5. JWT Refresh Secret
**Variable Name:** `JWT_REFRESH_SECRET`  
**Value:** Generate a different random secret

**Example:**
```
JWT_REFRESH_SECRET=juicy-delights-refresh-secret-key-2024-please-change-this
```

---

### 6. JWT Expire Time
**Variable Name:** `JWT_EXPIRE`  
**Value:** `7d`

---

### 7. JWT Refresh Expire Time
**Variable Name:** `JWT_REFRESH_EXPIRE`  
**Value:** `30d`

---

### 8. Frontend URL (CORS)
**Variable Name:** `FRONTEND_URL`  
**Value:**
```
https://yourdomain.com,capacitor://localhost,http://localhost,https://localhost
```

**For now, use this (you can update later):**
```
capacitor://localhost,http://localhost,https://localhost
```

---

## Quick Copy-Paste Format

If Render allows bulk adding, use this format:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://amgochaitanya_db_user:Vjd2uWhbWJTppGxG@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-change-this
JWT_REFRESH_SECRET=your-random-refresh-secret-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
```

---

## Optional Variables (Add Later if Needed)

These are optional and can be added later:

```
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## After Adding Variables

1. **Click "Save Changes"** (if there's a save button)
2. **Render will automatically redeploy** with new environment variables
3. **Wait for deployment to complete** (2-5 minutes)
4. **Check logs** to ensure MongoDB connection is successful

---

## Verify Deployment

After deployment, test your API:

1. **Go to your service URL** (e.g., `https://your-service-name.onrender.com`)
2. **Test health endpoint:**
   ```
   https://your-service-name.onrender.com/api/health
   ```
3. **Should return:**
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "...",
     "environment": "production"
   }
   ```

---

## Troubleshooting

**If MongoDB connection fails:**
- Check MongoDB Atlas Network Access (should allow `0.0.0.0/0`)
- Verify connection string is correct
- Check MongoDB username/password

**If service won't start:**
- Check logs in Render dashboard
- Verify PORT is set correctly
- Ensure all required environment variables are set

---

## Ready to Add!

Copy each variable name and value, then paste into Render's Environment tab!

