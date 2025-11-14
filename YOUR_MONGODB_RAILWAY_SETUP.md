# Your MongoDB Connection String for Railway

## Your Original Connection String
```
mongodb+srv://amgochaitanya_db_user:vjwZYRWtnoxSGaMB@cluster0.rekixpl.mongodb.net/?appName=Cluster0
```

## ✅ Formatted for Railway (Use This!)

Add the database name `/juicy-delights` after `.net/`:

```
mongodb+srv://amgochaitanya_db_user:vjwZYRWtnoxSGaMB@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

**This is the connection string you'll use in Railway!**

---

## 📋 How to Use in Railway

### Step 1: Go to Railway Dashboard
1. Open your Railway project
2. Click on your backend service
3. Go to **"Variables"** tab

### Step 2: Add MongoDB URI Variable
1. Click **"New Variable"**
2. **Variable Name:** `MONGODB_URI`
3. **Variable Value:** (paste the formatted string above)
   ```
   mongodb+srv://amgochaitanya_db_user:vjwZYRWtnoxSGaMB@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
   ```
4. Click **"Add"**

### Step 3: Verify
- Make sure the variable is saved
- Railway will automatically redeploy
- Check the deployment logs to confirm MongoDB connection

---

## 🔍 What Changed?

**Before:**
```
mongodb+srv://...@cluster0.rekixpl.mongodb.net/?appName=Cluster0
```
❌ Missing database name

**After:**
```
mongodb+srv://...@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```
✅ Database name added: `/juicy-delights`
✅ Standard query parameters added

---

## ✅ Complete Railway Environment Variables

Here are ALL the variables you need for Railway:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://amgochaitanya_db_user:vjwZYRWtnoxSGaMB@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-random-refresh-secret-here
FRONTEND_URL=capacitor://localhost,http://localhost,https://localhost
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** 
- Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with random strings
- You can generate them at: https://randomkeygen.com/

---

## 🧪 Test Your Connection

After adding the MongoDB URI to Railway:

1. Check Railway logs:
   - Dashboard → Service → Deployments → Latest → Logs
   - Look for: `✅ MongoDB connected successfully`

2. Test the health endpoint:
   - Open: `https://YOUR-RAILWAY-URL.up.railway.app/api/health`
   - Should return: `{"success": true, "message": "Server is running"}`

---

## 🆘 Troubleshooting

### If MongoDB Connection Fails:

1. **Check Network Access:**
   - Go to MongoDB Atlas → Security → Network Access
   - Make sure `0.0.0.0/0` is whitelisted (Allow from anywhere)

2. **Verify Database User:**
   - Go to MongoDB Atlas → Security → Database Access
   - Make sure user `amgochaitanya_db_user` exists
   - Make sure it has "Read and write to any database" privileges

3. **Check Connection String:**
   - Verify database name is correct: `juicy-delights`
   - Verify no extra spaces or characters
   - Verify password is correct: `vjwZYRWtnoxSGaMB`

4. **Check Railway Logs:**
   - Look for specific error messages
   - Common errors:
     - "Authentication failed" → Wrong password
     - "Network timeout" → IP not whitelisted
     - "Database not found" → Database name incorrect

---

## ✅ Next Steps

1. ✅ MongoDB connection string is ready
2. ⏭️ Deploy to Railway (follow `RAILWAY_DEPLOYMENT_STEP_BY_STEP.md`)
3. ⏭️ Add all environment variables
4. ⏭️ Get Railway URL
5. ⏭️ Update frontend `.env.production`
6. ⏭️ Test your app!

---

**Your MongoDB is ready for Railway!** 🎉

