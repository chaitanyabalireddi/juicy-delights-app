# How to Install Your App on Android Device for Testing

## ❌ AAB Files Cannot Be Installed Directly

AAB (Android App Bundle) files are **only for Google Play Store**. They cannot be installed directly on devices.

---

## ✅ Option 1: Build Debug APK (Easiest for Testing)

### In Android Studio:

1. **Build → Generate Signed Bundle / APK**
2. **Select "APK"** (not Android App Bundle this time)
3. **Select existing keystore** (or create new one for testing)
4. **Choose "debug" build variant** (or release if you want release APK)
5. **Click "Finish"**

### Or Use Command Line:

```powershell
cd android
.\gradlew assembleDebug
```

**APK Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on Device:

1. **Transfer APK to phone:**
   - Email it to yourself
   - Use USB cable
   - Use cloud storage (Google Drive, etc.)

2. **Enable Unknown Sources:**
   - Settings → Security → Enable "Install from Unknown Sources"
   - Or Settings → Apps → Special Access → Install Unknown Apps

3. **Install:**
   - Open APK file on phone
   - Tap "Install"
   - Done! ✅

---

## ✅ Option 2: Build Release APK

### In Android Studio:

1. **Build → Generate Signed Bundle / APK**
2. **Select "APK"**
3. **Select existing keystore** (use the same one you created for AAB)
4. **Choose "release" build variant**
5. **Click "Finish"**

### Or Use Command Line:

```powershell
cd android
.\gradlew assembleRelease
```

**APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

**Note:** Release APK requires signing. Use the same keystore you used for AAB.

---

## ✅ Option 3: Use Bundletool (Convert AAB to APK)

This converts your AAB to APK set for testing:

### Step 1: Download Bundletool

1. Download from: https://github.com/google/bundletool/releases
2. Get latest `bundletool-all-x.x.x.jar` file
3. Save to a folder (e.g., `C:\bundletool\`)

### Step 2: Convert AAB to APK Set

```powershell
# Navigate to bundletool folder
cd C:\bundletool

# Convert AAB to APK set
java -jar bundletool-all-1.15.6.jar build-apks --bundle="C:\path\to\your\app-release.aab" --output="app.apks" --mode=universal
```

### Step 3: Extract APK

The `.apks` file is a ZIP. Extract it:

```powershell
# Rename to zip and extract
Rename-Item app.apks app.zip
Expand-Archive app.zip -DestinationPath .
```

Find `universal.apk` inside - that's your installable APK!

---

## ✅ Option 4: Connect Phone via USB (Direct Install)

### Step 1: Enable USB Debugging

On your Android phone:
1. **Settings → About Phone**
2. Tap **"Build Number"** 7 times (enables Developer Options)
3. **Settings → Developer Options**
4. Enable **"USB Debugging"**

### Step 2: Connect Phone

1. Connect phone to computer via USB
2. On phone, allow USB debugging when prompted

### Step 3: Install via ADB

```powershell
# Check if device is connected
adb devices

# Install debug APK
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Or install release APK
adb install android\app\build\outputs\apk\release\app-release.apk
```

---

## ✅ Option 5: Google Play Console Internal Testing (Best for Production Testing)

If you want to test exactly like Play Store users:

1. **Upload AAB to Google Play Console**
2. **Create Internal Testing Track**
3. **Add testers** (email addresses)
4. **Release to Internal Testing**
5. **Testers get link** to install from Play Store

This is the best way to test the actual Play Store experience!

---

## 🎯 Recommended Approach

**For Quick Testing:**
- ✅ Build Debug APK (Option 1)
- ✅ Transfer to phone and install

**For Production Testing:**
- ✅ Build Release APK with same keystore as AAB
- ✅ Test on multiple devices
- ✅ Upload AAB to Play Console Internal Testing

---

## 📱 Step-by-Step: Build Debug APK

### Quick Method:

```powershell
cd android
.\gradlew assembleDebug
```

**APK will be at:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on Phone:

1. **Copy APK to phone** (USB, email, cloud)
2. **Enable Unknown Sources** on phone
3. **Tap APK** → Install → Done!

---

## 🔍 Check Your AAB File

Your AAB file is located at:
```
android/app/release/app-release.aab
```

**This is for Play Store only!** Use APK for device testing.

---

## 💡 Quick Comparison

| Format | Use For | Installable? |
|--------|---------|--------------|
| **AAB** | Play Store only | ❌ No |
| **APK** | Direct installation | ✅ Yes |
| **Debug APK** | Testing | ✅ Yes |
| **Release APK** | Testing/release | ✅ Yes |

---

## ✅ Summary

**Easiest way to test:**
1. Build Debug APK: `cd android && .\gradlew assembleDebug`
2. Find APK: `android/app/build/outputs/apk/debug/app-debug.apk`
3. Transfer to phone
4. Install!

**For Play Store testing:**
- Upload AAB to Play Console Internal Testing track

Good luck testing! 🚀

