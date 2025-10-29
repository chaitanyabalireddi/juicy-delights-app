# Your MongoDB Connection String (Formatted for Render)

## ✅ Your Connection String (Ready for Render)

```
mongodb+srv://amgochaitanya_db_user:Vjd2uWhbWJTppGxG@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

## What Changed:

**Original:**
```
mongodb+srv://amgochaitanya_db_user:Vjd2uWhbWJTppGxG@cluster0.rekixpl.mongodb.net/?appName=Cluster0
```

**Updated:**
```
mongodb+srv://amgochaitanya_db_user:Vjd2uWhbWJTppGxG@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

**Changes:**
- ✅ Added database name: `/juicy-delights` after `.net/`
- ✅ Changed query params: `?appName=Cluster0` → `?retryWrites=true&w=majority`

## For Render Environment Variables

When deploying to Render, add:

**Variable Name:** `MONGODB_URI`

**Variable Value:**
```
mongodb+srv://amgochaitanya_db_user:Vjd2uWhbWJTppGxG@cluster0.rekixpl.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

## ⚠️ Security Recommendation

Since your password was shared, consider changing it:
1. Go to MongoDB Atlas → Database Access
2. Edit your user (`amgochaitanya_db_user`)
3. Change password
4. Update the connection string in Render

But for now, this connection string will work!

## Ready to Deploy!

Copy this connection string and use it when setting up Render environment variables.

