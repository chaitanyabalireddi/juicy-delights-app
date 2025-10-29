#!/usr/bin/env node

/**
 * Mobile App Build Script for Juicy Delights
 * This script helps you build mobile apps for Play Store and App Store
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 Building Juicy Delights Mobile Apps...\n');

// Step 1: Build web app
console.log('📦 Step 1: Building web app for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web app built successfully!\n');
} catch (error) {
  console.error('❌ Failed to build web app:', error.message);
  process.exit(1);
}

// Step 2: Sync with Capacitor
console.log('🔄 Step 2: Syncing with Capacitor...');
try {
  execSync('npx cap sync', { stdio: 'inherit' });
  console.log('✅ Capacitor sync completed!\n');
} catch (error) {
  console.error('❌ Failed to sync with Capacitor:', error.message);
  process.exit(1);
}

// Step 3: Check platforms
console.log('📱 Step 3: Checking mobile platforms...');

const androidExists = fs.existsSync('android');
const iosExists = fs.existsSync('ios');

console.log(`Android platform: ${androidExists ? '✅ Found' : '❌ Missing'}`);
console.log(`iOS platform: ${iosExists ? '✅ Found' : '❌ Missing'}\n`);

// Step 4: Provide next steps
console.log('🚀 Next Steps:\n');

if (androidExists) {
  console.log('📱 For Android (Play Store):');
  console.log('1. Run: npx cap open android');
  console.log('2. In Android Studio: Build → Generate Signed Bundle/APK');
  console.log('3. Upload .aab file to Google Play Console');
  console.log('4. Fill in store listing and submit for review\n');
}

if (iosExists) {
  console.log('🍎 For iOS (App Store):');
  console.log('1. Run: npx cap open ios');
  console.log('2. In Xcode: Product → Archive');
  console.log('3. Distribute App → App Store Connect');
  console.log('4. Upload to App Store Connect\n');
}

console.log('📋 Required for App Stores:');
console.log('• Google Play Console account ($25 one-time)');
console.log('• Apple Developer account ($99/year)');
console.log('• App icons and screenshots');
console.log('• Privacy policy and terms of service');
console.log('• Store listing descriptions\n');

console.log('📖 For detailed instructions, see: MOBILE_BUILD_GUIDE.md');
console.log('🎉 Your mobile apps are ready to build!');
