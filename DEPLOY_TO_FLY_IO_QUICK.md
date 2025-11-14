# 🚀 Deploy to Fly.io - Quick Guide (You're Already Set Up!)

Your backend is **already configured** for Fly.io! Just follow these steps:

---

## ✅ What You Already Have

- ✅ `backend/fly.toml` - Fly.io configuration
- ✅ `backend/Dockerfile` - Docker configuration
- ✅ MongoDB connection string ready
- ✅ Backend code ready

---

## 🚀 Deployment Steps (5 Minutes!)

### Step 1: Install Fly CLI

**Windows (PowerShell as Administrator):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Verify Installation:**
```bash
fly version
```

### Step 2: Login to Fly.io

```bash
fly auth login
```

This will:
- Open your browser
- Ask you to sign up/login
- Authorize Fly CLI

**Note:** Credit card required but won't charge if under free tier limits.

### Step 3: Navigate to Backend Folder

```bash
cd backend
```

### Step 4: Launch Your App (First Time Only)

```bash
fly launch
```

This will:
- Ask for app name (or use existing: `fruit-jet-backend`)
- Ask for region (choose closest to you, e.g., `iad` for US East)
- Ask to deploy now (say **No** - we'll set secrets first)

### Step 5: Set Environment Variables (Secrets)

```bash
# MongoDB Connection String
fly secrets set MONGODB_URI="mongodb+srv://amgochaitanya_db_user:vjwZYRWtnoxSGaMB@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority"

# Node Environment
fly secrets set NODE_ENV=production

# Port (Fly.io will set this automatically, but set it anyway)
fly secrets set PORT=8080

# JWT Secrets (Generate random strings - use https://randomkeygen.com/)
fly secrets set JWT_SECRET="your-random-secret-key-here"
fly secrets set JWT_REFRESH_SECRET="your-random-refresh-secret-here"

# CORS/Frontend URL
fly secrets set FRONTEND_URL="capacitor://localhost,http://localhost,https://localhost"

# Rate Limiting
fly secrets set RATE_LIMIT_WINDOW_MS=900000
fly secrets set RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Replace `your-random-secret-key-here` with actual random strings!

### Step 6: Deploy!

```bash
fly deploy
```

This will:
- Build your Docker image
- Deploy to Fly.io
- Give you a URL like: `https://fruit-jet-backend.fly.dev`

**Wait 2-3 minutes for deployment to complete.**

### Step 7: Get Your Backend URL

```bash
fly status
```

Or check the deployment output. Your URL will be:
```
https://fruit-jet-backend.fly.dev
```

### Step 8: Test Your Backend

Open in browser:
```
https://fruit-jet-backend.fly.dev/api/health
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

**If you see this, your backend is live!** 🎉

---

## 🔧 Update App Name (Optional)

If you want to change the app name from `fruit-jet-backend`:

1. Edit `backend/fly.toml`:
   ```toml
   app = "juicy-delights-backend"  # Change this
   ```

2. Or create new app:
   ```bash
   fly apps create juicy-delights-backend
   fly deploy
   ```

---

## 📋 View Logs

```bash
fly logs
```

This shows real-time logs from your backend.

---

## 🔄 Update Environment Variables Later

```bash
# View current secrets
fly secrets list

# Update a secret
fly secrets set MONGODB_URI="new-connection-string"

# Remove a secret
fly secrets unset SECRET_NAME
```

---

## 🆘 Troubleshooting

### Deployment Fails?

**Check logs:**
```bash
fly logs
```

**Common issues:**
- ❌ MongoDB connection failed → Check `MONGODB_URI` secret
- ❌ Port already in use → Fly.io handles this automatically
- ❌ Build failed → Check `Dockerfile` and `package.json`

### Can't Connect to MongoDB?

**Verify:**
1. MongoDB Atlas → Network Access → `0.0.0.0/0` is whitelisted
2. Connection string is correct (with database name)
3. Database user has read/write permissions

**Test connection:**
```bash
# Check MongoDB URI secret
fly secrets list | grep MONGODB_URI
```

### App Not Starting?

**Check status:**
```bash
fly status
```

**View detailed logs:**
```bash
fly logs --app fruit-jet-backend
```

**Restart app:**
```bash
fly apps restart fruit-jet-backend
```

---

## ✅ Next Steps After Deployment

1. ✅ **Copy your backend URL**: `https://fruit-jet-backend.fly.dev`

2. ✅ **Create `.env.production`** in project root:
   ```env
   VITE_API_URL=https://fruit-jet-backend.fly.dev/api
   ```

3. ✅ **Rebuild frontend**:
   ```bash
   npm run build
   ```

4. ✅ **Update mobile app**:
   ```bash
   npx cap sync android
   ```

5. ✅ **Test everything!**

---

## 💰 Fly.io Free Tier Limits

- ✅ **3 shared-cpu VMs** (256MB RAM each)
- ✅ **~160 hours/month per VM**
- ✅ **3GB persistent storage**
- ✅ **Always active** (no sleep!)

**Usually enough for 1-2 small apps running 24/7.**

**Monitor usage:**
```bash
fly dashboard
```

---

## 🎯 Quick Command Reference

```bash
# Deploy
fly deploy

# View logs
fly logs

# Check status
fly status

# View secrets
fly secrets list

# Set secret
fly secrets set KEY=value

# Open dashboard
fly dashboard

# SSH into app
fly ssh console

# Restart app
fly apps restart fruit-jet-backend
```

---

## 🎉 Success!

Your backend is now:
- ✅ Deployed on Fly.io
- ✅ Always active (24/7)
- ✅ Publicly accessible
- ✅ Perfect for Socket.IO
- ✅ Free tier (enough for your app)

**Your app is ready to use!** 🚀

---

## 📞 Need Help?

- Fly.io Docs: https://fly.io/docs
- Your detailed guide: `backend/FLY_DEPLOYMENT.md`
- Fly.io Discord: https://fly.io/discord
- Check logs: `fly logs`

---

**Ready to deploy? Run the commands above and your backend will be live in 5 minutes!** 🚀

