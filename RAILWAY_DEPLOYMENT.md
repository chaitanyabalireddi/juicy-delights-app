# Deploy to Railway.app - Best Free Option (Always Active)

## Why Railway?
- ✅ **Always active** (no sleep/cold starts)
- ✅ **Perfect for Socket.IO** (real-time tracking works flawlessly)
- ✅ **$5 free credit/month** (enough for ~500-750 hours)
- ✅ **Super easy deployment** (5 minutes from GitHub)
- ✅ **Auto-deploys** on git push

## Prerequisites
- GitHub account
- Credit card (required but won't charge unless you exceed free tier)
- Your code pushed to GitHub

---

## Step 1: Push to GitHub (If Not Done)

```bash
cd juicy-delights-app-main

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/juicy-delights.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Railway

### A. Create Account
1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Authorize Railway

### B. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `juicy-delights`
4. Railway will detect Node.js automatically

### C. Configure Backend Service
1. Railway creates a service automatically
2. Click on the service card
3. Go to **"Settings"** tab
4. Set **Root Directory**: `backend`
5. Set **Start Command**: `npm start`
6. **Build Command**: `npm install`

### D. Add Environment Variables
Click **"Variables"** tab and add:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juicy-delights
JWT_SECRET=super-strong-random-secret-key-change-this-12345
JWT_REFRESH_SECRET=another-strong-secret-change-98765
CORS_ORIGIN=capacitor://localhost,https://localhost
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Replace MongoDB URI with your actual Atlas connection string!

### E. Deploy
1. Click **"Deploy"** (or it auto-deploys)
2. Wait 2-3 minutes for build
3. Check **"Deployments"** tab for status
4. Once deployed, get your public URL

### F. Get Your Backend URL
1. Go to **"Settings"** tab
2. Click **"Generate Domain"** under "Domains"
3. Your URL: `https://juicy-delights-production.up.railway.app`
4. **Save this URL** - you'll need it for frontend!

---

## Step 3: Setup MongoDB Atlas

### A. Create Free Cluster
1. Go to https://mongodb.com/cloud/atlas
2. Sign up and create organization
3. Create free cluster (M0 Sandbox)
4. Choose AWS and closest region
5. Cluster name: `JuicyDelights`

### B. Create Database User
1. Security → Database Access
2. Add New Database User
3. Username: `juicyapp`
4. Password: Generate secure password (save it!)
5. Privileges: "Read and write to any database"

### C. Whitelist IPs
1. Security → Network Access
2. Add IP Address
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Confirm

### D. Get Connection String
1. Click "Connect" on cluster
2. Choose "Connect your application"
3. Copy connection string:
```
mongodb+srv://juicyapp:<password>@cluster.mongodb.net/juicy-delights?retryWrites=true&w=majority
```
4. Replace `<password>` with actual password
5. Add this to Railway environment variables

---

## Step 4: Update Frontend

### A. Create Production Environment File
Create `.env.production` in project root:

```env
VITE_API_URL=https://juicy-delights-production.up.railway.app/api
```

**Replace with YOUR actual Railway URL!**

### B. Update Socket.IO Connection
Update `src/pages/TrackOrder.tsx` around line 84:

```typescript
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://juicy-delights-production.up.railway.app';
```

### C. Build Production Frontend
```bash
npm install
npm run build
```

---

## Step 5: Test Backend

Open browser or Postman:

```
GET https://your-railway-url.up.railway.app/api/health

Should return:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-...",
  "environment": "production"
}
```

---

## Step 6: Build Android App

```bash
# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Build signed APK/AAB for Play Store
```

---

## Step 7: Test Complete Flow

### Test from Mobile App:
1. ✅ Register new user
2. ✅ Login
3. ✅ Browse products (loaded from Railway backend)
4. ✅ Add to cart
5. ✅ Add address with GPS
6. ✅ Place order (COD)
7. ✅ Track order
8. ✅ Socket.IO connection works

### Test Socket.IO:
1. Place an order in app
2. Open browser console at:
```
https://your-railway-url.up.railway.app
```
3. Run in console:
```javascript
const socket = io('https://your-railway-url.up.railway.app');
socket.emit('join-delivery', 'YOUR_ORDER_ID');
setInterval(() => {
  socket.emit('update-location', {
    orderId: 'YOUR_ORDER_ID',
    location: {
      lat: 12.9716 + Math.random() * 0.01,
      lng: 77.5946 + Math.random() * 0.01
    }
  });
}, 5000);
```
4. Check mobile app - location should update in real-time!

---

## 💰 Cost Breakdown

### Free Tier ($5 credit/month):
- **Execution Time**: ~500-750 hours/month
- **Memory**: Up to 512MB
- **Bandwidth**: 100GB
- **Build Time**: Unlimited

**Perfect for:**
- Development
- Testing
- Small production apps
- Apps with < 1000 daily users

### When to Upgrade ($5/month):
- When free credit runs out
- Need more memory (1GB+)
- Higher traffic (1000+ daily users)
- Want priority support

---

## 📊 Monitoring Usage

### Check Usage:
1. Railway Dashboard → Your project
2. Click "Usage" tab
3. See:
   - Execution time used
   - Memory usage
   - Build time
   - Network bandwidth

### Set Alerts:
1. Settings → Notifications
2. Enable usage alerts
3. Get notified at 80% of free tier

---

## 🔧 Troubleshooting

### Build Failed
**Check:**
- Root directory set to `backend`
- `package.json` exists in backend folder
- All dependencies in package.json

**Fix:**
```bash
# Test locally first
cd backend
npm install
npm start
```

### Can't Connect to MongoDB
**Check:**
- Connection string correct in Railway variables
- Password doesn't contain special characters
- Network access allows 0.0.0.0/0
- Database name in connection string

**Test Connection:**
```bash
# In backend directory
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('Connected!')).catch(e => console.error(e));"
```

### Socket.IO Not Working
**Check:**
- CORS_ORIGIN includes `capacitor://localhost`
- Frontend uses correct Railway URL
- No trailing slashes in URLs

**Test:**
```javascript
// In browser console at Railway URL
const socket = io('https://your-railway-url.up.railway.app');
socket.on('connect', () => console.log('Connected!'));
```

### App Shows "Cannot connect to server"
**Check:**
- Railway service is running (green status)
- `.env.production` has correct URL
- Frontend was rebuilt after changing .env
- URL doesn't have trailing `/api/api`

---

## 🚀 Auto-Deploy on Git Push

Railway automatically redeploys when you push to GitHub!

```bash
# Make changes to code
git add .
git commit -m "Update backend"
git push origin main

# Railway auto-deploys in 2-3 minutes
# Check deployment status in Railway dashboard
```

---

## 📈 Scaling Up (When Needed)

### Add More Services:
1. Click "New" → Add database (Redis, PostgreSQL)
2. Add worker services
3. Add cron jobs

### Increase Resources:
1. Settings → Change plan
2. Upgrade to Pro ($5/month)
3. Get more memory, always-on, priority support

### Add Custom Domain:
1. Settings → Domains
2. Add custom domain
3. Update DNS records
4. Get free SSL certificate

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables added
- [ ] MongoDB Atlas connected
- [ ] Backend deployed successfully
- [ ] Health check endpoint working
- [ ] Frontend updated with Railway URL
- [ ] Production build created
- [ ] Android app built
- [ ] Tested on real device
- [ ] All features working (especially Socket.IO)
- [ ] Ready for Play Store!

---

## 🎉 Success!

Your backend is now:
- ✅ Always active (no cold starts)
- ✅ Publicly accessible
- ✅ Auto-deploys from GitHub
- ✅ Perfect for Socket.IO
- ✅ Free for $5/month usage
- ✅ Production-ready

**Your app is ready for Play Store upload!** 🚀

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs: Dashboard → Deployments → Logs

---

## 💡 Pro Tips

1. **Monitor your usage** - Set up alerts at 80%
2. **Use environment variables** - Never hardcode secrets
3. **Check logs regularly** - Dashboard → Logs tab
4. **Test locally first** - Always test changes before pushing
5. **Keep staging environment** - Use Render free tier for staging
6. **Backup your MongoDB** - Set up Atlas backups
7. **Use Railway CLI** - For advanced features: `npm i -g @railway/cli`

---

## Alternative: If Railway Requires Credit Card and You Don't Have One

Use **Koyeb.com**:
- ✅ NO credit card required
- ✅ Always active
- ✅ Free forever tier
- ✅ Socket.IO supported

Same deployment process:
1. Push to GitHub
2. Connect Koyeb to GitHub
3. Deploy
4. Add environment variables
5. Done!

---

Your app will work perfectly on Play Store with Railway backend! 🎊

