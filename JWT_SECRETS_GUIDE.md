# 🔐 JWT Secrets Guide - What You Need to Know

JWT (JSON Web Token) secrets are used to **sign and verify** authentication tokens in your app. You need **two secrets**:

---

## 🔑 What Are JWT Secrets?

### 1. **JWT_SECRET**
- Used to sign **access tokens** (short-lived, 7 days)
- Used when users login
- Used to verify API requests

### 2. **JWT_REFRESH_SECRET**
- Used to sign **refresh tokens** (long-lived, 30 days)
- Used to get new access tokens
- More secure, separate from access tokens

**Why Two Secrets?**
- **Security**: If one is compromised, the other is still safe
- **Best Practice**: Separate secrets for different token types

---

## 🎯 How to Generate Secure JWT Secrets

### Option 1: Online Generator (Easiest)

**Use https://randomkeygen.com/**
1. Go to https://randomkeygen.com/
2. Copy a **CodeIgniter Encryption Keys** (256-bit)
3. Use it for `JWT_SECRET`
4. Generate another one for `JWT_REFRESH_SECRET`

**Example:**
```
JWT_SECRET: aB3xK9mP2qR7vN5wY8zT1uI4oA6sD0fG
JWT_REFRESH_SECRET: mN8bV2cX5zA9qW3eR6tY1uI4oP7sD0fG
```

---

### Option 2: Node.js Command (If You Have Node.js)

**Generate in Terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run it twice to get two different secrets:
```bash
# First secret (for JWT_SECRET)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Second secret (for JWT_REFRESH_SECRET)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Option 3: PowerShell (Windows)

**Generate in PowerShell:**
```powershell
# Generate JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})

# Generate JWT_REFRESH_SECRET (run again)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

---

### Option 4: Online Tools

**Other options:**
- https://www.random.org/strings/ (generate random strings)
- https://1password.com/password-generator/ (if you use 1Password)
- Any password generator (use 64+ characters)

---

## ✅ What Makes a Good JWT Secret?

**Good Secret:**
- ✅ **Long**: At least 32 characters (64+ recommended)
- ✅ **Random**: Mix of letters, numbers, symbols
- ✅ **Unique**: Different from other secrets
- ✅ **Secure**: Don't use common words or patterns

**Bad Secret:**
- ❌ `password123` (too simple)
- ❌ `secret` (too short)
- ❌ `jwt-secret-key` (predictable)
- ❌ Same as refresh secret (security risk)

---

## 📋 Example JWT Secrets (Don't Use These - Generate Your Own!)

**Example Format:**
```
JWT_SECRET=aB3xK9mP2qR7vN5wY8zT1uI4oA6sD0fG9hJ2kL5mN8pQ1rS4tU7vW0xY3zA6bC
JWT_REFRESH_SECRET=mN8bV2cX5zA9qW3eR6tY1uI4oP7sD0fG2hJ5kL8mN1pQ4rS7tU0vW3xY
```

**Important:** Generate your own unique secrets! Never use examples.

---

## 🚀 Where to Set JWT Secrets

### For Render.com:

1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab
3. Add variables:
   ```
   JWT_SECRET = your-generated-secret-here
   JWT_REFRESH_SECRET = your-generated-refresh-secret-here
   JWT_EXPIRE = 7d
   JWT_REFRESH_EXPIRE = 30d
   ```

### For Fly.io:

```bash
fly secrets set JWT_SECRET="your-generated-secret-here"
fly secrets set JWT_REFRESH_SECRET="your-generated-refresh-secret-here"
fly secrets set JWT_EXPIRE="7d"
fly secrets set JWT_REFRESH_EXPIRE="30d"
```

### For Railway:

1. Railway Dashboard → Service → Variables
2. Add:
   ```
   JWT_SECRET = your-generated-secret-here
   JWT_REFRESH_SECRET = your-generated-refresh-secret-here
   JWT_EXPIRE = 7d
   JWT_REFRESH_EXPIRE = 30d
   ```

---

## 🔒 Security Best Practices

1. ✅ **Never commit secrets to Git**
   - Use `.env` files (add to `.gitignore`)
   - Use platform environment variables

2. ✅ **Use different secrets for production**
   - Don't reuse development secrets
   - Generate new ones for production

3. ✅ **Keep secrets long and random**
   - Minimum 32 characters
   - Recommended 64+ characters

4. ✅ **Don't share secrets**
   - Keep them private
   - Don't put in code or documentation

5. ✅ **Rotate secrets periodically**
   - Change every 6-12 months
   - Or if compromised

---

## 📝 Quick Checklist

- [ ] Generate `JWT_SECRET` (64+ characters, random)
- [ ] Generate `JWT_REFRESH_SECRET` (different from JWT_SECRET)
- [ ] Set `JWT_EXPIRE=7d` (access token expires in 7 days)
- [ ] Set `JWT_REFRESH_EXPIRE=30d` (refresh token expires in 30 days)
- [ ] Add secrets to your hosting platform (Render/Fly.io/Railway)
- [ ] Never commit secrets to Git
- [ ] Keep secrets secure and private

---

## 🎯 Quick Action: Generate Secrets Now

### Step 1: Generate Secrets

**Option A: Use Online Tool**
1. Go to https://randomkeygen.com/
2. Copy a **CodeIgniter Encryption Keys** (256-bit)
3. Use for `JWT_SECRET`
4. Generate another for `JWT_REFRESH_SECRET`

**Option B: Use Node.js**
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 2: Save Your Secrets

**Save them securely:**
- Password manager (1Password, LastPass, etc.)
- Secure note
- Don't save in code or Git!

### Step 3: Add to Your Platform

**For Render:**
- Dashboard → Service → Environment → Add variables

**For Fly.io:**
- Use `fly secrets set` commands

**For Railway:**
- Dashboard → Service → Variables → Add

---

## 🆘 Troubleshooting

### "Invalid token" Error?

**Check:**
- ✅ JWT_SECRET is set correctly
- ✅ Same secret used for signing and verifying
- ✅ No extra spaces in secret
- ✅ Secret is long enough (32+ characters)

### "Token expired" Error?

**Check:**
- ✅ JWT_EXPIRE is set correctly (default: 7d)
- ✅ Token hasn't actually expired
- ✅ System clock is correct

### Can't Login?

**Check:**
- ✅ JWT_SECRET is set in environment variables
- ✅ Backend restarted after setting secrets
- ✅ Secrets are correct (no typos)

---

## 📚 Additional Info

### What JWT Tokens Do:

1. **Access Token** (`JWT_SECRET`):
   - Short-lived (7 days)
   - Used for API authentication
   - Sent with every request

2. **Refresh Token** (`JWT_REFRESH_SECRET`):
   - Long-lived (30 days)
   - Used to get new access tokens
   - More secure

### Token Flow:

1. User logs in → Gets access token + refresh token
2. User makes API request → Sends access token
3. Access token expires → Use refresh token to get new access token
4. Refresh token expires → User must login again

---

## ✅ Summary

**You Need:**
- `JWT_SECRET` - Random 64+ character string
- `JWT_REFRESH_SECRET` - Different random 64+ character string
- `JWT_EXPIRE=7d` - Access token expiration
- `JWT_REFRESH_EXPIRE=30d` - Refresh token expiration

**Generate at:** https://randomkeygen.com/

**Add to:** Your hosting platform's environment variables

**Keep:** Secure and private, never commit to Git

---

**Ready to generate your secrets? Use https://randomkeygen.com/ and you'll be done in 2 minutes!** 🔐

