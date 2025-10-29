# Render Deployment Checklist

## ✅ Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up/login with your GitHub account

2. **Create New Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub account (if not already connected)
   - Select repository: `chaitanyabalireddi/juicy-delights-app`

3. **Configure Service:**
   - **Name:** `juicy-delights-backend` (or any name you prefer)
   - **Root Directory:** `backend` ⚠️ **IMPORTANT!**
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or Starter for better performance)

4. **Click "Create Web Service"**

## ✅ Step 2: Set Up MongoDB Atlas (Free Database)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
   - Sign up/login (free account)
   - Click "Create" → "Database"

2. **Deploy a Cloud Database:**
   - Choose **FREE** (M0 Sandbox)
   - Select a cloud provider and region (closest to you)
   - Click "Create"

3. **Create Database User:**
   - Go to "Database Access" → "Add New Database User"
   - Username: `juicy-delights-user` (or any name)
   - Password: Click "Autogenerate Secure Password" and **COPY IT**
   - User Privileges: "Atlas admin"
   - Click "Add User"

4. **Configure Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for Render)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `juicy-delights` (or change cluster name)
   - **FINAL STRING:** `mongodb+srv://juicy-delights-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/juicy-delights?retryWrites=true&w=majority`

## ✅ Step 3: Configure Environment Variables in Render

After your service is created, go to the "Environment" tab and add these:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://juicy-delights-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/juicy-delights?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-to-random-string
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com,capacitor://localhost,http://localhost,https://localhost
```

**Optional (can add later):**
```
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Important:** 
- Replace `YOUR_PASSWORD` with your actual MongoDB password
- Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with random strings (you can generate at: https://randomkeygen.com/)
- The `MONGODB_URI` should have your actual cluster URL

## ✅ Step 4: Deploy and Test

1. **Click "Save Changes"** in Render
2. **Render will automatically deploy** your backend
3. **Wait for deployment to complete** (takes 2-5 minutes)
4. **Test your API:**
   - Your API URL will be: `https://your-service-name.onrender.com`
   - Test health endpoint: `https://your-service-name.onrender.com/api/health`
   - Test products: `https://your-service-name.onrender.com/api/products`

## ✅ Step 5: Update Frontend with Production API URL

Once your backend is deployed, update the frontend:

1. **Get your Render API URL** (e.g., `https://juicy-delights-backend.onrender.com`)

2. **Update .env.production file:**
   ```
   VITE_API_URL=https://your-service-name.onrender.com/api
   ```

3. **Build frontend:**
   ```powershell
   npm run build
   ```

4. **Sync with Android:**
   ```powershell
   npx cap sync android
   ```

## ✅ Step 6: Build Mobile App for Play Store

1. **Open Android Studio:**
   ```powershell
   npx cap open android
   ```

2. **Wait for Gradle sync** to complete

3. **Generate Signed Bundle:**
   - Build → Generate Signed Bundle / APK
   - Choose "Android App Bundle"
   - Create new keystore (store securely!)
   - Build release bundle

4. **Upload to Google Play Console** (see PLAYSTORE_DEPLOYMENT_GUIDE.md)

## 🎉 You're Done!

Your backend will be live at: `https://your-service-name.onrender.com/api`

**Note:** Render free tier has limitations:
- Apps sleep after 15 minutes of inactivity (first request after sleep takes ~30 seconds)
- Consider upgrading to Starter ($7/month) for production use

