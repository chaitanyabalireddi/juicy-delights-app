# How to Check if Your Backend is Deployed

## ✅ Step 1: Check Render Dashboard

1. **Go to your Render dashboard:** https://dashboard.render.com
2. **Click on your service** (e.g., `juicy-delights-backend`)
3. **Check the status** at the top:
   - ✅ **"Live"** = Successfully deployed and running!
   - 🟡 **"Building"** = Still deploying (wait 2-5 minutes)
   - ❌ **"Deploy failed"** = Check logs for errors

---

## ✅ Step 2: Check Logs

1. **Click "Logs" tab** in your Render service
2. **Look for these success messages:**
   ```
   ✅ MongoDB connected successfully
   🚀 Server running on port 10000 in production mode
   📱 API Documentation: http://localhost:10000/api/health
   ```

3. **If you see errors:**
   - Check MongoDB connection errors
   - Check missing environment variables
   - Check port conflicts

---

## ✅ Step 3: Find Your API URL

**Your API URL will be:**
```
https://your-service-name.onrender.com
```

**Where to find it:**
- Look at the top of your Render service dashboard
- It's shown under your service name
- Example: `https://juicy-delights-backend.onrender.com`

---

## ✅ Step 4: Test Your API

### Test 1: Health Check Endpoint

Open in browser or use curl:
```
https://your-service-name.onrender.com/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-...",
  "environment": "production"
}
```

### Test 2: Products Endpoint

```
https://your-service-name.onrender.com/api/products
```

**Expected Response:**
```json
[
  {
    "_id": "1",
    "name": "Alphonso Mangoes",
    "price": 150,
    ...
  }
]
```

---

## ✅ Step 5: Test from PowerShell

Run these commands in PowerShell:

```powershell
# Test health endpoint
curl https://your-service-name.onrender.com/api/health

# Test products endpoint
curl https://your-service-name.onrender.com/api/products
```

**Or use browser:**
Just paste the URL in your browser!

---

## ✅ Step 6: Check MongoDB Connection

**In Render Logs, look for:**
- ✅ `MongoDB connected successfully` = Database connected!
- ❌ `MongoDB connection error` = Check connection string

**Common MongoDB Issues:**
- Wrong password in connection string
- Network access not configured (should allow `0.0.0.0/0`)
- Database name missing in connection string

---

## ✅ Step 7: Check All Endpoints

Test these endpoints:

1. **Health:**
   ```
   GET https://your-service-name.onrender.com/api/health
   ```

2. **Products:**
   ```
   GET https://your-service-name.onrender.com/api/products
   ```

3. **Featured Products:**
   ```
   GET https://your-service-name.onrender.com/api/products/featured
   ```

4. **Categories:**
   ```
   GET https://your-service-name.onrender.com/api/products/categories
   ```

5. **Payment Methods:**
   ```
   GET https://your-service-name.onrender.com/api/payments/methods
   ```

---

## 🎯 Quick Checklist

- [ ] Service shows "Live" status in Render
- [ ] Logs show "MongoDB connected successfully"
- [ ] Logs show "Server running on port..."
- [ ] Health endpoint returns success JSON
- [ ] Products endpoint returns product list
- [ ] No errors in logs

---

## ❌ Troubleshooting

### If Service Shows "Failed":

1. **Check Logs:**
   - Click "Logs" tab
   - Look for error messages
   - Common errors:
     - MongoDB connection failed
     - Missing environment variables
     - Port already in use

2. **Check Environment Variables:**
   - Go to "Environment" tab
   - Verify all variables are set correctly
   - Check for typos in variable names

3. **Check MongoDB:**
   - Verify connection string is correct
   - Check MongoDB Atlas Network Access
   - Ensure database user exists

### If API Returns 404:

- Check if service is actually running
- Verify the URL is correct
- Check if endpoint path is correct (`/api/health`)

### If API Returns 500 Error:

- Check Render logs for server errors
- Verify MongoDB connection
- Check environment variables

---

## ✅ Success Indicators

Your backend is successfully deployed if:
- ✅ Status shows "Live"
- ✅ Logs show successful MongoDB connection
- ✅ Health endpoint returns JSON with `"success": true`
- ✅ Products endpoint returns product list
- ✅ No errors in logs

---

## 🚀 Next Steps

Once deployed:
1. ✅ Test all endpoints
2. ✅ Update frontend `.env.production` with API URL
3. ✅ Build frontend: `npm run build`
4. ✅ Sync with Android: `npx cap sync android`
5. ✅ Build mobile app for Play Store!

---

## Quick Test Command

```powershell
# Replace with your actual service URL
$apiUrl = "https://your-service-name.onrender.com"

# Test health
curl "$apiUrl/api/health"

# Test products
curl "$apiUrl/api/products"
```

**If both return JSON responses, you're good to go!** 🎉

