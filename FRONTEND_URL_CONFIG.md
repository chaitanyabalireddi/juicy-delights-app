# 🌐 FRONTEND_URL Configuration Guide

The `FRONTEND_URL` environment variable is used for **CORS (Cross-Origin Resource Sharing)** configuration. It tells your backend which origins (domains) are allowed to make requests.

---

## 🎯 What Should Your FRONTEND_URL Be?

Since you have a **Capacitor mobile app**, you need to allow multiple origins:

### ✅ Recommended Value for Your App:

```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
```

**Why these values?**
- `capacitor://localhost` - For Android/iOS mobile app (Capacitor)
- `http://localhost` - For local web development
- `https://localhost` - For local HTTPS development

---

## 📱 For Mobile App (Capacitor)

Your backend already includes these origins in the code, but setting `FRONTEND_URL` ensures consistency:

**Set in Render/Fly.io/Railway:**
```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
```

**This allows:**
- ✅ Android app to connect
- ✅ iOS app to connect
- ✅ Local development/testing
- ✅ Socket.IO connections from mobile app

---

## 🌐 If You Deploy a Web Version Later

If you deploy your frontend to a web hosting service (Vercel, Netlify, etc.), add that URL too:

**Example:**
```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost,https://your-app.vercel.app
```

**Or if you have a custom domain:**
```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost,https://juicydelights.com
```

---

## 🔧 How Your Backend Uses FRONTEND_URL

Looking at your `backend/server.js`, it already includes these origins:

```javascript
origin: [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost'
]
```

**So even if `FRONTEND_URL` is not set, these origins work:**
- ✅ `capacitor://localhost` (mobile app)
- ✅ `http://localhost` (local dev)
- ✅ `https://localhost` (local HTTPS)

**But setting `FRONTEND_URL` is still recommended** for:
- ✅ Consistency
- ✅ Easy configuration
- ✅ Adding web URLs later

---

## 📋 Setting FRONTEND_URL in Your Deployment

### For Render.com:

1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab
3. Add variable:
   ```
   FRONTEND_URL = capacitor://localhost,http://localhost,https://localhost
   ```

### For Fly.io:

```bash
fly secrets set FRONTEND_URL="capacitor://localhost,http://localhost,https://localhost"
```

### For Railway:

1. Railway Dashboard → Service → Variables
2. Add:
   ```
   FRONTEND_URL = capacitor://localhost,http://localhost,https://localhost
   ```

---

## 🧪 Testing CORS

### Test from Mobile App:

1. **Build and install** your Android/iOS app
2. **Try to login** or make API calls
3. **Check backend logs** for CORS errors

### Test from Browser (Local):

1. **Open browser console**
2. **Try to fetch** from your backend:
   ```javascript
   fetch('https://your-backend-url.onrender.com/api/health')
     .then(r => r.json())
     .then(console.log)
   ```
3. **Should work** if CORS is configured correctly

---

## 🆘 Troubleshooting CORS Issues

### "CORS policy blocked" Error?

**Check:**
- ✅ `FRONTEND_URL` is set correctly
- ✅ Backend restarted after setting `FRONTEND_URL`
- ✅ Origin matches exactly (no trailing slashes)
- ✅ Protocol matches (`http://` vs `https://`)

### Mobile App Can't Connect?

**Check:**
- ✅ `capacitor://localhost` is in `FRONTEND_URL`
- ✅ Backend CORS includes Capacitor origins
- ✅ Backend is accessible from internet
- ✅ Check backend logs for CORS errors

### Socket.IO Not Working?

**Check:**
- ✅ `FRONTEND_URL` includes `capacitor://localhost`
- ✅ Socket.IO CORS config matches Express CORS
- ✅ Backend URL is correct in frontend

---

## 📝 Quick Reference

### For Mobile App Only:
```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
```

### For Mobile App + Web Version:
```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost,https://your-web-url.com
```

### For Development Only:
```
FRONTEND_URL=http://localhost:3000
```

---

## ✅ Summary

**For your Capacitor mobile app, use:**

```
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
```

**This allows:**
- ✅ Android app to connect
- ✅ iOS app to connect  
- ✅ Local development
- ✅ Socket.IO real-time features

**Add this to your Render/Fly.io/Railway environment variables!**

---

## 🎯 Next Steps

1. ✅ Set `FRONTEND_URL` in your hosting platform
2. ✅ Use: `capacitor://localhost,http://localhost,https://localhost`
3. ✅ Deploy backend
4. ✅ Test from mobile app
5. ✅ If deploying web version later, add that URL too

---

**That's it! Set this value and your mobile app will be able to connect to your backend.** 🚀

