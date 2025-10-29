# How to Update Your App's UI

## 📁 Understanding Your App Structure

Your UI code is located in the `src` folder:

```
src/
├── pages/              # Main pages (Index, Cart, Profile, etc.)
├── components/          # Reusable components
│   ├── Header.tsx      # Top navigation bar
│   ├── BottomNavigation.tsx  # Bottom menu
│   └── ui/             # UI component library (shadcn)
├── assets/             # Images and media files
├── contexts/           # State management (CartContext)
├── index.css           # Global styles
└── App.tsx             # Main app component
```

---

## 🎨 What You Can Change

### 1. **Pages** (`src/pages/`)
- `Index.tsx` - Home page
- `Cart.tsx` - Shopping cart
- `Profile.tsx` - User profile
- `ProductDetail.tsx` - Product details page
- `Search.tsx` - Search page
- `Categories.tsx` - Categories page
- `Orders.tsx` - Orders page
- `Favorites.tsx` - Favorites page
- `Offers.tsx` - Offers page

### 2. **Components** (`src/components/`)
- `Header.tsx` - Top navigation
- `BottomNavigation.tsx` - Bottom menu

### 3. **Styles**
- `src/index.css` - Global CSS styles
- Tailwind CSS classes in components

### 4. **Assets** (`src/assets/`)
- Images: `mangoes.jpg`, `apples.jpg`, etc.

---

## 🔄 Complete UI Update Workflow

### Step 1: Make Your UI Changes

1. **Edit any file** in `src/pages/` or `src/components/`
2. **Change colors, text, layouts** using:
   - Tailwind CSS classes (e.g., `bg-blue-500`, `text-white`)
   - Custom CSS in `index.css`
   - Component props and states

### Step 2: Test Changes Locally

```powershell
# Start development server
npm run dev
```

- Opens at: `http://localhost:8080`
- **Changes appear automatically** (hot reload)
- Test all pages and features

### Step 3: Build for Production

```powershell
# Build the app
npm run build
```

- Creates optimized files in `dist/` folder
- This is what gets bundled into your mobile app

### Step 4: Sync with Android

```powershell
# Sync changes to Android project
npx cap sync android
```

- Copies `dist/` files to Android project
- Updates the web assets in your mobile app

### Step 5: Rebuild Mobile App

#### Option A: Debug APK (Quick Testing)
```powershell
# In Android Studio
Build → Build APK(s)
```

#### Option B: Release AAB (For Play Store)
```powershell
# In Android Studio
Build → Generate Signed Bundle / APK
# Select Android App Bundle
# Use your existing keystore
```

---

## 📝 Common UI Updates

### Change Colors

**In any component file**, update Tailwind classes:

```tsx
// Example: Change button color from orange to blue
// Before:
<button className="bg-orange-500 text-white">

// After:
<button className="bg-blue-500 text-white">
```

**Or change in `index.css`:**

```css
:root {
  --primary: #3b82f6; /* Changed from orange to blue */
}
```

### Change Text Content

**Edit directly in page files:**

```tsx
// src/pages/Index.tsx
// Change title:
<h1>Fresh Fruits Delivered</h1>
// To:
<h1>Premium Quality Fruits</h1>
```

### Change Images

1. **Replace image files** in `src/assets/`
2. **Keep same filename** OR update imports:

```tsx
// src/pages/Index.tsx
// Before:
import mangoesImg from '@/assets/mangoes.jpg';

// After:
import mangoesImg from '@/assets/new-mangoes.jpg';
```

### Change Layout

**Edit component structure:**

```tsx
// Example: Change from 2 columns to 3 columns
// Before:
<div className="grid grid-cols-2 gap-4">

// After:
<div className="grid grid-cols-3 gap-4">
```

### Add New Pages

1. **Create new file** in `src/pages/`:
   ```tsx
   // src/pages/NewPage.tsx
   import Header from '@/components/Header';
   
   const NewPage = () => {
     return (
       <div>
         <Header />
         <h1>New Page</h1>
       </div>
     );
   };
   
   export default NewPage;
   ```

2. **Add route** in `src/App.tsx`:
   ```tsx
   <Route path="/newpage" element={<NewPage />} />
   ```

---

## 🎨 Styling Options

### Using Tailwind CSS (Recommended)

Your app uses **Tailwind CSS** - add classes directly:

```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Blue box with white text, padding, and rounded corners
</div>
```

**Common Tailwind classes:**
- Colors: `bg-blue-500`, `text-gray-800`, `border-red-300`
- Spacing: `p-4` (padding), `m-2` (margin), `gap-4` (gap)
- Layout: `flex`, `grid`, `grid-cols-3`
- Sizing: `w-full`, `h-screen`, `max-w-md`
- Effects: `shadow-lg`, `rounded-xl`, `opacity-50`

### Using Custom CSS

**In `src/index.css`:**

```css
.my-custom-class {
  background-color: #ff6b35;
  border-radius: 12px;
  padding: 16px;
}
```

**Use in components:**

```tsx
<div className="my-custom-class">Content</div>
```

---

## 📱 Example: Change Home Page Colors

### Step 1: Edit `src/pages/Index.tsx`

```tsx
// Find this line (around line 87):
<div className="bg-gradient-primary rounded-xl p-6 mb-6 text-white">

// Change to:
<div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-6 text-white">
```

### Step 2: Test Locally

```powershell
npm run dev
```

Check `http://localhost:8080` - see your changes!

### Step 3: Build and Sync

```powershell
npm run build
npx cap sync android
```

### Step 4: Rebuild App

Build APK/AAB in Android Studio

---

## 🔍 Finding What to Edit

### To Change Home Page:
- **File:** `src/pages/Index.tsx`
- **Contains:** Product cards, banners, categories

### To Change Navigation:
- **File:** `src/components/Header.tsx` or `BottomNavigation.tsx`
- **Contains:** Menu items, icons, navigation

### To Change Product Cards:
- **File:** `src/pages/Index.tsx` or `src/pages/Search.tsx`
- **Look for:** Product card components

### To Change Cart:
- **File:** `src/pages/Cart.tsx`
- **Contains:** Cart items, checkout button

### To Change Colors Globally:
- **File:** `src/index.css` or `tailwind.config.ts`
- **Contains:** Color definitions, theme

---

## 🛠️ Quick Reference Commands

```powershell
# Development (see changes instantly)
npm run dev

# Build for production
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Build APK for testing
cd android
.\gradlew assembleDebug

# Build AAB for Play Store
# (In Android Studio: Build → Generate Signed Bundle)
```

---

## ✅ Complete Update Checklist

When updating UI:

1. ✅ **Make changes** in `src/` folder
2. ✅ **Test locally** with `npm run dev`
3. ✅ **Build production** with `npm run build`
4. ✅ **Sync Android** with `npx cap sync android`
5. ✅ **Rebuild APK/AAB** in Android Studio
6. ✅ **Test on device**
7. ✅ **Upload to Play Store** (if ready)

---

## 💡 Pro Tips

1. **Use `npm run dev`** to see changes instantly while developing
2. **Check browser console** for errors
3. **Test on multiple screen sizes** (phone, tablet)
4. **Keep assets optimized** (compress images)
5. **Commit changes to Git** regularly

---

## 🎯 Summary

**To update UI:**
1. Edit files in `src/pages/` or `src/components/`
2. Run `npm run dev` to test
3. Run `npm run build` when done
4. Run `npx cap sync android`
5. Rebuild in Android Studio

**That's it!** Your changes will appear in the mobile app! 🚀

