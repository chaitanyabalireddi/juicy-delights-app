# Your MongoDB Connection String for Render

## Your Connection String Template

**From MongoDB Atlas:**
```
mongodb+srv://amgochaitanya_db_user:<db_password>@cluster0.rekixpl.mongodb.net/?appName=Cluster0
```

## Format for Render

**Replace `<db_password>` with your actual password and add database name:**

```
mongodb+srv://amgochaitanya_db_user:YOUR_PASSWORD@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

## Step-by-Step:

1. **Replace `<db_password>`** with your actual database password
   - If password has special characters, URL encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`

2. **Add database name** after `.net/`:
   - Change: `.net/?appName=Cluster0`
   - To: `.net/juicy-delights?retryWrites=true&w=majority`

## Examples:

### If password is `MyPassword123`:
```
mongodb+srv://amgochaitanya_db_user:MyPassword123@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

### If password is `MyPass@123` (with @ symbol):
```
mongodb+srv://amgochaitanya_db_user:MyPass%40123@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

## For Render Environment Variables

When deploying to Render, add this environment variable:

**Variable Name:** `MONGODB_URI`

**Variable Value:** Your formatted connection string (see examples above)

## Quick Test

Before deploying to Render, test your connection string locally:

```powershell
cd backend
node test-mongodb-connection.js
```

(Remember to replace `<db_password>` with your actual password in the test file)

## ✅ Ready for Render!

Once you have your formatted connection string:
1. Deploy to Render
2. Add `MONGODB_URI` environment variable
3. Paste your formatted connection string
4. Deploy!

**Your connection string format:**
```
mongodb+srv://amgochaitanya_db_user:YOUR_PASSWORD@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

Just replace `YOUR_PASSWORD` with your actual password (URL encoded if needed)!

