# 🚀 Update Frontend to Use Render Backend

Your backend is live at: **https://fruitjet.onrender.com** ✅

Now let's connect your frontend to use this backend!

---

## ✅ Step 1: Create Production Environment File

Create a file named `.env.production` in your **project root** (same folder as `package.json`):

**File:** `.env.production`
```env
VITE_API_URL=https://fruitjet.onrender.com/api
```

**Important:**
- File must be named exactly `.env.production`
- Must be in project root (not in `src` or `backend` folder)
- No spaces around the `=` sign

---

## ✅ Step 2: Check Socket.IO Configuration (If Using)

If you have Socket.IO for real-time features, check `src/pages/TrackOrder.tsx`:

The Socket.IO URL should be:
```typescript
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://fruitjet.onrender.com';
```

This will automatically use your backend URL.

---

## ✅ Step 3: Rebuild Frontend

After creating `.env.production`, rebuild your frontend:

```bash
npm run build
```

This creates a production build with the correct API URL.

---

## ✅ Step 4: Sync with Capacitor (For Mobile App)

```bash
npx cap sync android
```

This updates your Android app with the new build.

---

## ✅ Step 5: Test Your App

### Test from Browser (Development):

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:5173 (or whatever port Vite uses)

3. **Check browser console** - API calls should go to `https://fruitjet.onrender.com/api`

### Test from Mobile App:

1. **Build Android app:**
   ```bash
   npx cap open android
   ```

2. **Run on device/emulator**

3. **Test features:**
   - ✅ Browse products (should load from Render backend)
   - ✅ Login/Register
   - ✅ Add to cart
   - ✅ Place order

---

## 🔍 Verify It's Working

### Check API Calls:

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Use your app**
4. **Look for API requests** - they should go to `https://fruitjet.onrender.com/api`

### Test API Directly:

Open in browser:
```
https://fruitjet.onrender.com/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-...",
  "environment": "production"
}
```

---

## 🔄 Keep Render Awake (Optional)

Since Render free tier sleeps after 15 minutes, you can keep it awake:

### Option 1: Use cron-job.org (Free)

1. Go to https://cron-job.org
2. Sign up (free, no credit card)
3. Create cron job:
   - **URL**: `https://fruitjet.onrender.com/api/health`
   - **Schedule**: Every 10 minutes
   - Click "Create"

### Option 2: Use UptimeRobot (Free)

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add monitor:
   - **URL**: `https://fruitjet.onrender.com/api/health`
   - **Interval**: 5 minutes

This keeps your backend awake so it doesn't sleep!

---

## 📋 Quick Checklist

- [ ] Created `.env.production` file with `VITE_API_URL=https://fruitjet.onrender.com/api`
- [ ] Rebuilt frontend: `npm run build`
- [ ] Synced Capacitor: `npx cap sync android`
- [ ] Tested API connection
- [ ] (Optional) Set up ping service to keep Render awake

---

## 🆘 Troubleshooting

### Frontend Still Using Localhost?

**Check:**
- ✅ `.env.production` file exists in project root
- ✅ File name is exactly `.env.production` (not `.env.production.txt`)
- ✅ Rebuilt frontend after creating file
- ✅ Cleared browser cache

### API Calls Failing?

**Check:**
- ✅ Backend is running (test `https://fruitjet.onrender.com/api/health`)
- ✅ CORS is configured correctly in backend
- ✅ `FRONTEND_URL` environment variable in Render includes `capacitor://localhost`
- ✅ Check browser console for CORS errors

### Mobile App Can't Connect?

**Check:**
- ✅ Rebuilt frontend: `npm run build`
- ✅ Synced Capacitor: `npx cap sync android`
- ✅ Rebuilt Android app in Android Studio
- ✅ Check Android logs for errors

---

## 🎉 Success!

Your frontend is now connected to your Render backend!

**Your Backend URL:** https://fruitjet.onrender.com  
**API Endpoint:** https://fruitjet.onrender.com/api

**Next Steps:**
1. ✅ Test all features
2. ✅ Build Android app for Play Store
3. ✅ (Optional) Set up ping service to keep Render awake

---

## 📝 Environment Variables Summary

**Backend (Render):**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret
- `JWT_REFRESH_SECRET` - Your refresh secret
- `FRONTEND_URL` - `capacitor://localhost,http://localhost,https://localhost`

**Frontend (.env.production):**
- `VITE_API_URL` - `https://fruitjet.onrender.com/api`

---

**Your app is now ready to use with the Render backend!** 🚀

