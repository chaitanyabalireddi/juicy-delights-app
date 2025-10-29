# MongoDB Connection String Format

## Your Connection String Template

After clicking "Drivers" and selecting Node.js, you'll get:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## How to Fill It In

### Step 1: Replace `<username>`
- Replace with your database username (e.g., `juicy-delights-user`)

### Step 2: Replace `<password>`
- Replace with your database password
- **If password has special characters**, URL encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`

### Step 3: Add Database Name
- Add your database name after `.net/`
- Format: `mongodb+srv://...@cluster0.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority`
- Use: `juicy-delights` as database name

## Example

**Before:**
```
mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**After (if username is `juicy-user` and password is `MyPass@123`):**
```
mongodb+srv://juicy-user:MyPass%40123@cluster0.abc123.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

Notice:
- `<username>` → `juicy-user`
- `<password>` → `MyPass@123` (but `@` becomes `%40`)
- Added `/juicy-delights` after `.net/` (database name)

## Quick URL Encoding Tool

If you need to encode your password, use:
- https://www.urlencoder.org/
- Or just replace special characters manually as shown above

## For Render Deployment

Save this connection string - you'll use it as:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/juicy-delights?retryWrites=true&w=majority
```

In Render's environment variables!

