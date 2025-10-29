@echo off
echo 🍎 Juicy Delights - Play Store Deployment Quick Start
echo ====================================================
echo.

echo 📦 Step 1: Building web app...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)
echo ✅ Web app built successfully!
echo.

echo 🔄 Step 2: Syncing with Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Capacitor sync failed! Please check for errors.
    pause
    exit /b 1
)
echo ✅ Capacitor sync completed!
echo.

echo 📱 Step 3: Opening Android Studio...
echo Please wait while Android Studio opens...
call npx cap open android
echo.

echo 🎯 Next Steps:
echo 1. Wait for Android Studio to load completely
echo 2. Go to Build → Generate Signed Bundle/APK
echo 3. Choose Android App Bundle (.aab)
echo 4. Create new keystore (SAVE THE PASSWORD!)
echo 5. Build the release
echo 6. Upload .aab file to Google Play Console
echo.

echo 📖 For detailed instructions, see: PLAYSTORE_DEPLOYMENT_GUIDE.md
echo.

echo 🚀 Your app is ready to build for Play Store!
pause
