# How to Push to GitHub - Step by Step

## The Problem
You're getting authentication errors when trying to push to GitHub.

## Solution: Use GitHub Personal Access Token (PAT)

### Step 1: Create a Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: `juicy-delights-push`
4. Select expiration: **90 days** (or longer)
5. Check the **repo** scope (gives full repository access)
6. Click "Generate token"
7. **COPY THE TOKEN IMMEDIATELY** - you won't see it again!

### Step 2: Use the Token to Push

#### Option A: Using Command Line with Token
Run this command (replace `YOUR_TOKEN` with your actual token):

```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/Chaitanyaamgo/juicy-delights-app-2.git
git push -u origin main
```

#### Option B: Using GitHub Desktop (Easier)
1. Download GitHub Desktop: https://desktop.github.com/
2. Install it
3. Sign in with your GitHub account
4. Click "File" → "Add Local Repository"
5. Browse to: `C:\Users\chaithanay\Downloads\juicy-delights-app-main (1)\juicy-delights-app-main`
6. Click "Publish repository"
7. Select `Chaitanyaamgo/juicy-delights-app-2`
8. Click "Publish repository"

### Step 3: Verify
After pushing, go to: https://github.com/Chaitanyaamgo/juicy-delights-app-2
Your files should be there!

## Alternative: Use SSH (More Secure)

### Setup SSH:
1. Open PowerShell
2. Run: `ssh-keygen -t ed25519 -C "your_email@example.com"`
3. Press Enter for default location
4. Press Enter twice (no passphrase, or set one if you prefer)
5. Run: `cat ~/.ssh/id_ed25519.pub`
6. Copy the output
7. Go to https://github.com/settings/keys
8. Click "New SSH key"
9. Paste your key and save

### Change remote to SSH:
```powershell
git remote set-url origin git@github.com:Chaitanyaamgo/juicy-delights-app-2.git
git push -u origin main
```

