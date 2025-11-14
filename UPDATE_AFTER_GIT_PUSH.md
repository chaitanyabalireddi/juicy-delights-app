# How to Update After Git Push

## 🔄 Frontend Changes (Mobile App)

### Step 1: Build Frontend
```powershell
npm run build
```

### Step 2: Sync with Android
```powershell
npx cap sync android
```

### Step 3: Rebuild Mobile App
```powershell
# Open Android Studio
npx cap open android

# Then in Android Studio:
# - Build → Generate Signed Bundle / APK (for Play Store)
# - Or Build → Build APK(s) (for testing)
```

---

## 🔄 Backend Changes (Render)

### Automatic Update (Recommended)

If Render is connected to GitHub:
1. **You already pushed to Git** ✅
2. **Render detects the push automatically**
3. **Check Render dashboard** → Your service → Logs
4. **Wait 2-5 minutes** for deployment

### Manual Update (If needed)

1. **Go to:** https://dashboard.render.com
2. **Click your service** (fruit-jet)
3. **Click "Manual Deploy"** button
4. **Select "Deploy latest commit"**
5. **Wait for deployment** (2-5 minutes)

### Check Deployment Status

1. **Go to Render dashboard**
2. **Click your service**
3. **Check status:**
   - ✅ "Live" = Deployed successfully
   - 🟡 "Building" = Currently deploying
   - ❌ "Deploy failed" = Check logs

4. **Check Logs:**
   - Click "Logs" tab
   - Look for deployment messages
   - Check for errors

---

## 📋 Quick Update Checklist

### After Frontend Changes:
- [ ] `npm run build`
- [ ] `npx cap sync android`
- [ ] Build APK/AAB in Android Studio
- [ ] Test on device

### After Backend Changes:
- [ ] Pushed to GitHub ✅ (you already did this)
- [ ] Check Render dashboard
- [ ] Wait for auto-deploy (or trigger manually)
- [ ] Test API endpoints

---

## 🚀 Complete Update Workflow

### For Frontend (Your Changes):
```powershell
# 1. Build
npm run build

# 2. Sync Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. Build app in Android Studio
```

### For Backend (If Changed):
```powershell
# 1. Already pushed to Git ✅

# 2. Check Render:
# - Go to dashboard.render.com
# - Check if auto-deploy is running
# - Or click "Manual Deploy"
```

---

## ✅ Verify Updates

### Frontend:
- Install new APK on device
- Test login/admin features
- Check if UI changes appear

### Backend:
- Test API: `curl https://fruit-jet.onrender.com/api/health`
- Check logs in Render dashboard
- Verify new endpoints work

---

## 💡 Pro Tips

1. **Render Auto-Deploy**: Usually happens automatically within 2-5 minutes of Git push
2. **Frontend Updates**: Always rebuild and sync after making frontend changes
3. **Check Logs**: If something fails, check Render logs for errors
4. **Test First**: Test locally with `npm run dev` before building

---

## 🎯 Summary

**What you need to do:**

1. **Frontend:** `npm run build` → `npx cap sync android` → Rebuild in Android Studio
2. **Backend:** Check Render dashboard - should auto-deploy, or trigger manually

**If Render is connected to GitHub (which it should be), it will automatically deploy backend changes!**

