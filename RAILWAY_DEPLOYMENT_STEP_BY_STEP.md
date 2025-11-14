# 🚂 Railway Deployment - Step by Step Guide

This guide will help you deploy your backend to Railway so your app works properly.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your code pushed to GitHub (already done!)
- ✅ A MongoDB Atlas account (free tier works)
- ✅ A Railway account (we'll create this)

---

## Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub account
5. You'll see the Railway dashboard

**Note:** Railway requires a credit card for verification, but won't charge you unless you exceed the free tier ($5 credit/month).

---

## Step 2: Setup MongoDB Atlas (If Not Done)

### A. Create MongoDB Atlas Account
1. Go to **https://www.mongodb.com/cloud/atlas**
2. Sign up for free account
3. Create a free cluster (M0 Sandbox)

### B. Create Database User
1. Go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `juicy-delights-user` (or any name)
5. Password: Generate a strong password (SAVE THIS!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### C. Whitelist IP Addresses
1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### D. Get Connection String
1. Go to **Database** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<username>`** with your database username
6. **Replace `<password>`** with your password (if password has special characters like `@`, `#`, encode them: `@` → `%40`, `#` → `%23`)
7. **Add database name** after `.net/`:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/juicy-delights?retryWrites=true&w=majority
   ```
8. **SAVE THIS CONNECTION STRING** - you'll need it for Railway!

---

## Step 3: Deploy Backend to Railway

### A. Create New Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `chaitanyabalireddi/juicy-delights-app`
4. Railway will detect it's a Node.js project

### B. Configure the Service
1. Railway will create a service automatically
2. Click on the service card (it might be named after your repo)
3. Go to **"Settings"** tab
4. Scroll down to **"Root Directory"**
5. Set **Root Directory**: `backend`
6. Scroll down to **"Start Command"**
7. Set **Start Command**: `npm start`
8. **Build Command** should be: `npm install` (Railway auto-detects this)

### C. Add Environment Variables
1. In the same service, go to **"Variables"** tab
2. Click **"New Variable"** and add each of these:

#### Required Variables:

```
NODE_ENV=production
```

```
PORT=3000
```
*(Railway will override this with their port, but set it anyway)*

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/juicy-delights?retryWrites=true&w=majority
```
**Replace with YOUR actual MongoDB connection string from Step 2!**

```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-12345
```
**Generate a random string** (you can use: https://randomkeygen.com/)

```
JWT_REFRESH_SECRET=another-super-secret-refresh-key-change-this-98765
```
**Generate another random string**

```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
```

```
RATE_LIMIT_WINDOW_MS=900000
```

```
RATE_LIMIT_MAX_REQUESTS=100
```

#### Optional Variables (Add if you need them):

```
REDIS_URL=redis://localhost:6379
```
*(Leave this if you don't use Redis)*

```
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```
*(Only if using Stripe)*

```
RAZORPAY_KEY_ID=your_razorpay_key
```
*(Only if using Razorpay)*

3. After adding all variables, Railway will automatically redeploy

---

## Step 4: Get Your Backend URL

1. Go to **"Settings"** tab in your service
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Railway will create a domain like: `juicy-delights-production.up.railway.app`
5. **COPY THIS URL** - you'll need it for the frontend!

---

## Step 5: Test Your Backend

1. Open your browser
2. Go to: `https://YOUR-RAILWAY-URL.up.railway.app/api/health`
3. You should see:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2024-...",
     "environment": "production"
   }
   ```

If you see this, your backend is working! 🎉

---

## Step 6: Update Frontend to Use Railway Backend

### A. Create Production Environment File
1. In your project root (not backend folder), create a file: `.env.production`
2. Add this content:
   ```env
   VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
   ```
   **Replace `YOUR-RAILWAY-URL` with your actual Railway URL!**

### B. Update Frontend Code (if needed)
Check `src/lib/api.ts` - it should already use `VITE_API_URL` environment variable.

### C. Rebuild Frontend
```bash
npm run build
```

---

## Step 7: Update Mobile App

### A. Update API URL in Capacitor Config
1. Open `capacitor.config.ts`
2. Make sure it uses environment variables or update the API URL

### B. Sync Capacitor
```bash
npx cap sync android
```

### C. Rebuild Android App
```bash
# Open in Android Studio
npx cap open android

# Build signed APK/AAB
```

---

## Step 8: Test Complete Flow

### Test from Mobile App:
1. ✅ Register new user
2. ✅ Login
3. ✅ Browse products (should load from Railway backend)
4. ✅ Add to cart
5. ✅ Place order
6. ✅ Track order (Socket.IO should work)

### Test Backend Endpoints:
- Health: `https://YOUR-URL/api/health`
- Products: `https://YOUR-URL/api/products`
- Auth: `https://YOUR-URL/api/auth/register`

---

## 🔧 Troubleshooting

### Backend Won't Start
**Check Railway Logs:**
1. Go to Railway dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. Click on latest deployment
5. Check **"Logs"** tab for errors

**Common Issues:**
- ❌ MongoDB connection failed → Check `MONGODB_URI` variable
- ❌ Port already in use → Railway handles this automatically
- ❌ Missing dependencies → Check `backend/package.json`

### Can't Connect to MongoDB
**Check:**
- ✅ Connection string is correct
- ✅ Password is URL-encoded (special characters)
- ✅ Database name is in connection string (`/juicy-delights`)
- ✅ Network access allows 0.0.0.0/0
- ✅ Database user has read/write permissions

### Frontend Can't Connect to Backend
**Check:**
- ✅ `.env.production` has correct Railway URL
- ✅ URL doesn't have trailing slash
- ✅ Frontend was rebuilt after changing `.env.production`
- ✅ CORS settings in backend allow your frontend origin

### Socket.IO Not Working
**Check:**
- ✅ `FRONTEND_URL` includes `capacitor://localhost`
- ✅ Frontend uses correct Railway URL (without `/api`)
- ✅ Railway service is running (green status)

---

## 📊 Monitor Your Deployment

### Check Deployment Status:
1. Railway Dashboard → Your Project → Service
2. **"Deployments"** tab shows all deployments
3. Green checkmark = successful
4. Red X = failed (check logs)

### View Logs:
1. Railway Dashboard → Your Project → Service
2. **"Deployments"** → Click on deployment
3. **"Logs"** tab shows real-time logs

### Check Usage:
1. Railway Dashboard → Your Project
2. **"Usage"** tab shows:
   - Execution time used
   - Memory usage
   - Network bandwidth

---

## 💰 Railway Pricing

### Free Tier ($5 credit/month):
- ✅ ~500-750 hours of execution time
- ✅ Up to 512MB RAM
- ✅ 100GB bandwidth
- ✅ Unlimited builds

**Perfect for:**
- Development
- Testing
- Small production apps
- Apps with < 1000 daily users

### When to Upgrade:
- Free credit runs out
- Need more memory (1GB+)
- Higher traffic (1000+ daily users)

---

## ✅ Final Checklist

- [ ] Railway account created
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] MongoDB connection string saved
- [ ] Railway project created
- [ ] Service configured (Root Directory: `backend`)
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Health check endpoint working
- [ ] Railway URL copied
- [ ] `.env.production` created with Railway URL
- [ ] Frontend rebuilt
- [ ] Mobile app updated
- [ ] Tested complete flow

---

## 🎉 Success!

Your backend is now:
- ✅ Deployed on Railway
- ✅ Always active (no sleep/cold starts)
- ✅ Publicly accessible
- ✅ Auto-deploys from GitHub
- ✅ Perfect for Socket.IO
- ✅ Production-ready

**Your app is ready to use!** 🚀

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs for errors
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

## 🔄 Auto-Deploy on Git Push

Railway automatically redeploys when you push to GitHub!

```bash
# Make changes to backend code
git add .
git commit -m "Update backend"
git push origin main

# Railway auto-deploys in 2-3 minutes
# Check deployment status in Railway dashboard
```

---

## 💡 Pro Tips

1. **Monitor usage** - Set up alerts at 80% of free tier
2. **Use environment variables** - Never hardcode secrets
3. **Check logs regularly** - Railway Dashboard → Logs tab
4. **Test locally first** - Always test changes before pushing
5. **Keep MongoDB connection string secure** - Don't commit it to GitHub
6. **Use Railway CLI** - For advanced features: `npm i -g @railway/cli`

---

**Your backend is now live on Railway!** 🎊

