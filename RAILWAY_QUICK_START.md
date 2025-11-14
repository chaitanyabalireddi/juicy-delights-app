# 🚂 Railway Deployment - Quick Start Checklist

Follow these steps in order to deploy your backend to Railway.

---

## ✅ Step-by-Step Checklist

### 1. Setup MongoDB Atlas
- [ ] Go to https://mongodb.com/cloud/atlas
- [ ] Create free account and cluster
- [ ] Create database user (username + password)
- [ ] Whitelist IP: `0.0.0.0/0` (Allow from anywhere)
- [ ] Get connection string and add database name: `/juicy-delights`
- [ ] **SAVE CONNECTION STRING**

### 2. Create Railway Account
- [ ] Go to https://railway.app
- [ ] Login with GitHub
- [ ] Authorize Railway

### 3. Deploy Backend
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select: `chaitanyabalireddi/juicy-delights-app`
- [ ] Click on the service → "Settings"
- [ ] Set **Root Directory**: `backend`
- [ ] Set **Start Command**: `npm start`

### 4. Add Environment Variables
Go to "Variables" tab and add:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=generate-random-string-here
JWT_REFRESH_SECRET=generate-another-random-string-here
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Generate random strings for JWT secrets (use https://randomkeygen.com/)

### 5. Get Backend URL
- [ ] Go to "Settings" → "Domains"
- [ ] Click "Generate Domain"
- [ ] **COPY THE URL** (e.g., `juicy-delights-production.up.railway.app`)

### 6. Test Backend
- [ ] Open: `https://YOUR-URL.up.railway.app/api/health`
- [ ] Should see: `{"success": true, "message": "Server is running"}`

### 7. Update Frontend
- [ ] Create `.env.production` in project root:
  ```
  VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
  ```
- [ ] Replace `YOUR-RAILWAY-URL` with your actual Railway URL
- [ ] Rebuild: `npm run build`

### 8. Update Mobile App
- [ ] Sync Capacitor: `npx cap sync android`
- [ ] Rebuild Android app

### 9. Test Everything
- [ ] Register new user
- [ ] Login
- [ ] Browse products
- [ ] Add to cart
- [ ] Place order
- [ ] Track order (Socket.IO)

---

## 🔑 Key Information to Save

**MongoDB Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

**Railway Backend URL:**
```
https://your-app-name.up.railway.app
```

**JWT Secrets:** (Save these securely!)
- JWT_SECRET: `your-secret-here`
- JWT_REFRESH_SECRET: `your-refresh-secret-here`

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
- Check Railway logs: Dashboard → Service → Deployments → Logs
- Verify all environment variables are set correctly
- Check MongoDB connection string

**Can't connect to MongoDB?**
- Verify connection string is correct
- Check password is URL-encoded (special characters)
- Verify network access allows 0.0.0.0/0
- Check database name is in connection string

**Frontend can't connect?**
- Verify `.env.production` has correct Railway URL
- Rebuild frontend after changing `.env.production`
- Check URL doesn't have trailing slash

---

## 📚 Full Guide

For detailed instructions, see: `RAILWAY_DEPLOYMENT_STEP_BY_STEP.md`

---

**Once all steps are complete, your backend will be live on Railway!** 🎉

