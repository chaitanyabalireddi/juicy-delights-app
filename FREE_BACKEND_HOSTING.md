# Free Backend Hosting Options for Continuous Uptime

This guide covers **truly free** options to deploy your Node.js/Express backend that run **24/7 without sleeping**.

## 🏆 Best Options for Continuous Free Hosting

### 1. **Fly.io** ⭐ (Recommended)
**Best for: Most reliable free tier**

- ✅ **Free Tier**: 3 shared-cpu VMs (256MB RAM each)
- ✅ **Continuous uptime**: Yes, runs 24/7
- ✅ **Supports**: Node.js, Express, MongoDB Atlas (free), Socket.IO
- ✅ **Global regions**: Deploy close to your users
- ✅ **Free SSL**: Automatic HTTPS
- ⚠️ **Limits**: ~160 hours/month per VM (usually enough for 1-2 apps)

**Setup Steps:**
```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Initialize your app (in backend folder)
fly launch

# 4. Create fly.toml (they'll guide you)
# 5. Deploy
fly deploy
```

**Pros:**
- Most reliable free tier
- Easy deployment
- Great documentation
- Supports WebSockets (Socket.IO)

**Cons:**
- Need to monitor CPU hours (160/month per VM)
- Credit card required (but won't charge if under limits)

---

### 2. **Oracle Cloud Always Free** 🆓
**Best for: Maximum resources**

- ✅ **Free Tier**: 2 VMs (1GB RAM, 50GB storage each)
- ✅ **Continuous uptime**: Yes, runs 24/7 forever
- ✅ **Supports**: Full Node.js setup, Docker
- ✅ **No time limits**: Unlimited usage
- ⚠️ **Requires**: Credit card (but truly free - won't charge)

**Setup Steps:**
1. Sign up at [cloud.oracle.com](https://cloud.oracle.com)
2. Create Always Free VM (Ubuntu)
3. SSH into VM and install Node.js
4. Clone your repo and deploy

**Pros:**
- Most generous free tier
- Truly unlimited (no time limits)
- Full VM control
- Best for learning/side projects

**Cons:**
- More complex setup
- Need to manage server yourself
- Credit card required

---

### 3. **Google Cloud Run** 🚀
**Best for: Serverless with continuous capability**

- ✅ **Free Tier**: 2 million requests/month, 360GB-hours compute
- ✅ **Continuous**: Can run continuously (with configuration)
- ✅ **Supports**: Node.js containers
- ✅ **Auto-scaling**: Scales to zero when idle
- ⚠️ **Cold starts**: May have delay if idle

**Setup Steps:**
```bash
# 1. Install Google Cloud SDK
# 2. Create Dockerfile in backend folder
# 3. Build and deploy
gcloud run deploy juicy-delights-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Pros:**
- Pay only for what you use
- Auto-scaling
- Easy deployment
- Generous free tier

**Cons:**
- Cold starts (first request after idle)
- Socket.IO requires special setup
- More complex for WebSockets

---

### 4. **Railway** 🚉
**Best for: Easy deployment**

- ✅ **Free Tier**: $5 credit/month (usually enough for small apps)
- ✅ **Continuous**: Yes, runs 24/7
- ✅ **Supports**: Node.js, MongoDB, Redis
- ✅ **Auto-deploy**: From GitHub
- ⚠️ **Limits**: Limited by $5 credit

**Setup Steps:**
1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Select backend folder
4. Add environment variables
5. Deploy!

**Pros:**
- Easiest deployment
- Auto-deploy from Git
- Built-in database options
- Great developer experience

**Cons:**
- $5/month credit may run out
- Need to monitor usage

---

### 5. **Koyeb** 🌐
**Best for: Simple deployment**

- ✅ **Free Tier**: 2 services, limited resources
- ✅ **Continuous**: Yes, but may throttle under heavy load
- ✅ **Supports**: Node.js, Docker
- ✅ **Auto-deploy**: From GitHub/GitLab

**Setup Steps:**
1. Sign up at [koyeb.com](https://www.koyeb.com)
2. Create new app
3. Connect repository
4. Deploy!

**Pros:**
- Simple setup
- Auto-deploy
- Free SSL

**Cons:**
- Limited resources
- May throttle under load
- Less documentation

---

## 🎯 Recommendation for Your App

### **Option 1: Fly.io** (Easiest & Most Reliable)
Best balance of ease and reliability. Perfect for Socket.IO support.

### **Option 2: Oracle Cloud** (Most Resources)
If you want maximum control and don't mind server management.

### **Option 3: Railway** (Easiest Setup)
If you want the simplest deployment experience.

---

## 📋 Quick Setup Guide for Fly.io

### 1. Create `fly.toml` in your backend folder:

```toml
app = "juicy-delights-backend"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "1s"
```

### 2. Create `Dockerfile` in backend folder:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build || echo "No build script"

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

### 3. Deploy:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (in backend folder)
fly launch

# Deploy
fly deploy
```

### 4. Set Environment Variables:

```bash
fly secrets set MONGODB_URI=your_mongodb_atlas_uri
fly secrets set JWT_SECRET=your_jwt_secret
fly secrets set FRONTEND_URL=https://your-frontend-url.com
# ... add all your env variables
```

---

## 🗄️ Database Options (Free)

Since you need MongoDB, use **MongoDB Atlas** (Free Tier):
- ✅ 512MB storage (enough for small apps)
- ✅ Shared cluster
- ✅ Free forever
- ✅ Automatic backups

**Setup:**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Use in your backend env variables

---

## 🔧 Important Notes

### For Socket.IO (Real-time features):
- ✅ **Fly.io**: Full support
- ✅ **Oracle Cloud**: Full support
- ⚠️ **Railway**: Works but may need config
- ⚠️ **Cloud Run**: Requires special setup

### Environment Variables:
All platforms allow you to set environment variables:
- Fly.io: `fly secrets set KEY=value`
- Railway: Dashboard → Variables
- Oracle Cloud: Edit `.env` file
- Cloud Run: `gcloud run services update`

### MongoDB Connection:
Use **MongoDB Atlas** (free) - works with all hosting options.

### Redis (Optional):
- Use **Upstash Redis** (free tier) or
- **Redis Cloud** (free tier) or
- Skip Redis if not critical

---

## 💡 Pro Tips

1. **Monitor Usage**: Set up alerts to avoid surprises
2. **Use MongoDB Atlas**: Free and works everywhere
3. **Enable Logging**: All platforms provide logs
4. **Set up Health Checks**: Use `/api/health` endpoint
5. **Backup Database**: MongoDB Atlas has automatic backups

---

## 🚀 Deployment Checklist

- [ ] Choose hosting platform
- [ ] Set up MongoDB Atlas (free)
- [ ] Create account on hosting platform
- [ ] Configure environment variables
- [ ] Test deployment locally
- [ ] Deploy backend
- [ ] Test API endpoints
- [ ] Update frontend API URL
- [ ] Set up custom domain (optional)
- [ ] Monitor logs and performance

---

## 📞 Need Help?

- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Oracle Cloud**: [docs.oracle.com](https://docs.oracle.com)

---

## ⚠️ Important Reminders

1. **Never commit `.env` files** - Use platform secrets
2. **Always use HTTPS** - All platforms provide free SSL
3. **Set up CORS** - Configure `FRONTEND_URL` correctly
4. **Monitor logs** - Check for errors regularly
5. **Backup data** - MongoDB Atlas has backups

---

**Recommendation**: Start with **Fly.io** - it's the easiest and most reliable free option for your Node.js backend with Socket.IO support!

