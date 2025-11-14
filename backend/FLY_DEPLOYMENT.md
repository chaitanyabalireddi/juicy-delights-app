# Fly.io Deployment Guide for Fruit Jet Backend

Complete step-by-step guide to deploy your backend to Fly.io.

## 🚀 Quick Start

### Prerequisites
- [ ] Fly.io account ([sign up here](https://fly.io/app/sign-up))
- [ ] MongoDB Atlas account ([sign up here](https://www.mongodb.com/cloud/atlas/register))
- [ ] Git repository (optional, but recommended)

---

## Step 1: Install Fly CLI

### Windows (PowerShell):
```powershell
# Run in PowerShell as Administrator
iwr https://fly.io/install.ps1 -useb | iex
```

### Mac/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify Installation:
```bash
fly version
```

---

## Step 2: Login to Fly.io

```bash
fly auth login
```

This will open your browser to authenticate. After login, you're ready to deploy!

---

## Step 3: Set Up MongoDB Atlas (Free)

1. **Sign up** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Create a Free Cluster**:
   - Choose "M0 Free" tier
   - Select a region close to your Fly.io region
   - Wait for cluster to deploy (~5 minutes)

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `fruit-jet-admin`
   - Password: Generate a strong password (save it!)
   - User Privileges: "Atlas admin"

4. **Whitelist IP Address**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Fly.io IP ranges later

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `fruit-jet` (or your preferred DB name)

**Example connection string:**
```
mongodb+srv://fruit-jet-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fruit-jet?retryWrites=true&w=majority
```

---

## Step 4: Initialize Fly.io App

Navigate to your backend folder:

```bash
cd backend
```

Initialize Fly.io (this will create/update fly.toml):

```bash
fly launch
```

**When prompted:**
- **App name**: `fruit-jet-backend` (or choose your own)
- **Region**: Choose closest to your users (e.g., `iad` for US East)
- **Postgres**: No (we're using MongoDB)
- **Redis**: No (optional, skip for now)
- **Deploy now**: No (we'll set env vars first)

---

## Step 5: Set Environment Variables

Set all your environment variables using Fly.io secrets:

```bash
# Database
fly secrets set MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fruit-jet?retryWrites=true&w=majority"

# Server Configuration
fly secrets set NODE_ENV="production"
fly secrets set PORT="8080"

# JWT Secrets (generate strong random strings)
fly secrets set JWT_SECRET="your-super-secret-jwt-key-change-this-to-random-string"
fly secrets set JWT_REFRESH_SECRET="your-refresh-secret-key-change-this-too"
fly secrets set JWT_EXPIRE="7d"
fly secrets set JWT_REFRESH_EXPIRE="30d"

# Frontend URL (update with your frontend URL)
fly secrets set FRONTEND_URL="https://your-frontend-url.com"

# Payment Gateways (if using)
fly secrets set STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
fly secrets set STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
fly secrets set RAZORPAY_KEY_ID="your_razorpay_key_id"
fly secrets set RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email (optional)
fly secrets set SMTP_HOST="smtp.gmail.com"
fly secrets set SMTP_PORT="587"
fly secrets set SMTP_USER="your-email@gmail.com"
fly secrets set SMTP_PASS="your-app-password"

# Other optional services
fly secrets set REDIS_URL="redis://localhost:6379"  # Skip if not using Redis
fly secrets set CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
fly secrets set CLOUDINARY_API_KEY="your_cloudinary_api_key"
fly secrets set CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

**⚠️ Important**: Generate strong secrets for JWT:
```bash
# Generate random secrets (run these and use the output)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 6: Deploy!

Deploy your backend:

```bash
fly deploy
```

This will:
1. Build your Docker image
2. Push it to Fly.io
3. Deploy and start your app

**First deployment takes 2-5 minutes.**

---

## Step 7: Verify Deployment

### Check Status:
```bash
fly status
```

### View Logs:
```bash
fly logs
```

### Check Health Endpoint:
```bash
fly open /api/health
```

Or visit: `https://fruit-jet-backend.fly.dev/api/health`

---

## Step 8: Get Your Backend URL

Your backend will be available at:
```
https://fruit-jet-backend.fly.dev
```

**Update your frontend** `.env` file:
```env
VITE_API_URL=https://fruit-jet-backend.fly.dev/api
```

---

## Step 9: Seed Database (Optional)

If you need to seed initial data:

```bash
# SSH into your Fly.io machine
fly ssh console

# Inside the machine, run:
npm run seed
```

Or run locally pointing to production DB (not recommended for security).

---

## 🔧 Useful Commands

### View Logs:
```bash
fly logs
```

### SSH into Machine:
```bash
fly ssh console
```

### Check App Status:
```bash
fly status
```

### View Environment Variables:
```bash
fly secrets list
```

### Update Environment Variable:
```bash
fly secrets set KEY="new-value"
```

### Restart App:
```bash
fly apps restart fruit-jet-backend
```

### Scale App:
```bash
# Scale to 1 machine (free tier)
fly scale count 1

# Scale to 2 machines (if needed, uses more free hours)
fly scale count 2
```

### Open App in Browser:
```bash
fly open
```

---

## 🐛 Troubleshooting

### App Won't Start:
1. Check logs: `fly logs`
2. Verify environment variables: `fly secrets list`
3. Check MongoDB connection string is correct
4. Ensure MongoDB Atlas IP whitelist includes Fly.io IPs

### Cannot Connect to Database:
1. Check MongoDB Atlas Network Access → Add Fly.io IPs
2. Verify connection string has correct password
3. Check MongoDB user has correct permissions

### Socket.IO Not Working:
1. Verify CORS settings include your frontend URL
2. Check Fly.io WebSocket support (should work automatically)
3. Ensure `FRONTEND_URL` env var is set correctly

### Port Issues:
- Fly.io automatically sets `PORT` env variable
- Your app should use `process.env.PORT || 8080`
- Internal port in fly.toml should match (8080)

### Out of Memory:
- Free tier has 256MB RAM
- If issues, consider upgrading or optimizing app
- Check logs for memory errors

---

## 📊 Monitoring

### View Metrics:
```bash
fly metrics
```

### View Resource Usage:
```bash
fly status
```

### Monitor Free Tier Usage:
Visit [fly.io dashboard](https://fly.io/dashboard) → Your App → Usage

**Free Tier Limits:**
- 3 shared-cpu VMs
- ~160 hours/month per VM
- 256MB RAM per VM

---

## 🔄 Updating Your App

### After Making Changes:

1. **Commit changes**:
```bash
git add .
git commit -m "Update backend"
```

2. **Deploy**:
```bash
fly deploy
```

Fly.io will automatically:
- Build new image
- Deploy new version
- Keep old version running until new one is healthy
- Switch traffic to new version

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` files**
2. ✅ **Use Fly.io secrets** for all sensitive data
3. ✅ **Generate strong JWT secrets**
4. ✅ **Use MongoDB Atlas** (not local DB)
5. ✅ **Enable MongoDB Atlas IP whitelist**
6. ✅ **Use HTTPS** (automatic with Fly.io)
7. ✅ **Set CORS** correctly for your frontend domain

---

## 💰 Cost Management

### Free Tier Limits:
- **3 shared-cpu VMs** available
- **~160 hours/month** per VM
- **256MB RAM** per VM

### Tips to Stay Free:
1. Run only **1 machine** (default)
2. Monitor usage in dashboard
3. Use MongoDB Atlas free tier
4. Skip Redis if not critical

### If You Exceed Free Tier:
- Fly.io will notify you
- You can scale down or upgrade
- $5/month gets you more resources

---

## 🎉 Success Checklist

- [ ] Fly.io account created
- [ ] Fly CLI installed
- [ ] MongoDB Atlas set up
- [ ] App deployed to Fly.io
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] Frontend updated with new API URL
- [ ] Can login/register
- [ ] API endpoints responding

---

## 📞 Need Help?

- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **Fly.io Community**: [community.fly.io](https://community.fly.io)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

## 🚀 Next Steps

1. ✅ Deploy backend to Fly.io
2. ✅ Set up MongoDB Atlas
3. ✅ Update frontend API URL
4. ✅ Test all endpoints
5. ✅ Deploy frontend (Vercel/Netlify)
6. ✅ Set up custom domain (optional)

**Your backend is now running 24/7 for free! 🎉**

