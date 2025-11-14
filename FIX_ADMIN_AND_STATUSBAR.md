# 🔧 Fix Admin Login & Status Bar Issues

## Issue 1: Admin Login - Invalid Credentials

### Step 1: Check if Admin Exists

Open browser console and run:
```javascript
fetch('https://fruitjet.onrender.com/api/auth/check-admin')
  .then(r => r.json())
  .then(console.log);
```

**If `exists: false`:**
- Admin user doesn't exist yet
- Create it using the method below

**If `exists: true`:**
- Admin exists but login is failing
- Check the role is "admin"

### Step 2: Create Admin User

**Option A: Use API Endpoint (Easiest)**

Open browser console and run:
```javascript
fetch('https://fruitjet.onrender.com/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@juicydelights.com',
    password: 'admin123',
    secret: 'CREATE_ADMIN_SECRET_2024'
  })
})
.then(r => r.json())
.then(console.log);
```

**Option B: Update Existing User to Admin**

If you already registered with `admin@juicydelights.com`:
1. The API endpoint will update it to admin
2. Or manually update in MongoDB Atlas

### Step 3: Verify Admin Created

Check again:
```javascript
fetch('https://fruitjet.onrender.com/api/auth/check-admin')
  .then(r => r.json())
  .then(console.log);
```

Should show: `exists: true, role: "admin"`

### Step 4: Login

Use these credentials:
- **Email:** `admin@juicydelights.com`
- **Password:** `admin123`

---

## Issue 2: Status Bar Not Visible

### Step 1: Rebuild Frontend

```bash
npm run build
```

### Step 2: Sync Capacitor

```bash
npx cap sync android
```

### Step 3: Open Android Studio

```bash
npx cap open android
```

### Step 4: In Android Studio

1. **Clean Project:**
   - Build → Clean Project

2. **Rebuild Project:**
   - Build → Rebuild Project

3. **Run App:**
   - Run → Run 'app'

### Step 5: Check Status Bar

The status bar should now:
- ✅ Show time
- ✅ Show battery icon
- ✅ Show notification icons
- ✅ Have dark icons on white background

---

## 🔍 Troubleshooting Admin Login

### Still Getting "Invalid Credentials"?

**Check Render Logs:**
1. Go to Render Dashboard
2. Your Service → Logs
3. Look for: "Login failed: User not found" or "Login failed: Invalid password"

**Verify Admin Exists:**
```javascript
fetch('https://fruitjet.onrender.com/api/auth/check-admin')
  .then(r => r.json())
  .then(console.log);
```

**Try Creating Admin Again:**
```javascript
fetch('https://fruitjet.onrender.com/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@juicydelights.com',
    password: 'admin123',
    secret: 'CREATE_ADMIN_SECRET_2024'
  })
})
.then(r => r.json())
.then(console.log);
```

**Check Email Case:**
- Make sure email is exactly: `admin@juicydelights.com`
- Not: `Admin@JuicyDelights.com` (case-sensitive in some cases)

---

## 🔍 Troubleshooting Status Bar

### Status Bar Still Not Visible?

**Check 1: Plugin Installed**
```bash
npm list @capacitor/status-bar
```
Should show version installed

**Check 2: Capacitor Synced**
```bash
npx cap sync android
```

**Check 3: Rebuild App**
- Clean and rebuild in Android Studio
- Uninstall old app from device
- Install fresh build

**Check 4: Android Version**
- Status bar works on Android 5.0+
- Check your device Android version

**Check 5: Test in Browser**
- Status bar only works on native apps
- Won't show in browser/emulator sometimes
- Test on real device

---

## ✅ Quick Fix Checklist

### Admin Login:
- [ ] Check if admin exists: `/api/auth/check-admin`
- [ ] Create admin: `/api/auth/create-admin`
- [ ] Verify admin exists
- [ ] Login with: `admin@juicydelights.com` / `admin123`

### Status Bar:
- [ ] Rebuild frontend: `npm run build`
- [ ] Sync Capacitor: `npx cap sync android`
- [ ] Clean & rebuild in Android Studio
- [ ] Test on real device

---

## 🆘 Still Having Issues?

**For Admin:**
- Check Render logs for errors
- Verify MongoDB connection
- Try creating admin again
- Check email spelling exactly

**For Status Bar:**
- Make sure testing on real device (not emulator)
- Check Android version (5.0+)
- Uninstall and reinstall app
- Check Android Studio logs

---

**Both issues should be fixed after following these steps!** 🚀

