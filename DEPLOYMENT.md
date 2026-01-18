# Eyeluxe Deployment Guide

## 📋 Table of Contents
1. [Initial Deployment Overview](#initial-deployment-overview)
2. [Deployment Architecture](#deployment-architecture)
3. [Deploying Code Changes](#deploying-code-changes)
4. [Troubleshooting](#troubleshooting)

---

## 🎯 Initial Deployment Overview

### What Was Deployed:

**Frontend (React App)**
- **Platform**: GitHub Pages
- **URL**: https://eyeluxefancy.github.io/eyeluxe/
- **Deployment Method**: GitHub Actions (Automated)
- **Build Tool**: Vite

**Backend (Node.js/Express API)**
- **Platform**: Render.com
- **URL**: https://eyeluxe.onrender.com
- **Deployment Method**: Automatic from GitHub
- **Database**: Firebase Firestore

---

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              USER'S BROWSER                         │
│  https://eyeluxefancy.github.io/eyeluxe/           │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ API Requests
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│         BACKEND API (Render.com)                    │
│     https://eyeluxe.onrender.com/api                │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ Data Operations
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│         FIREBASE FIRESTORE                          │
│         (Cloud Database)                            │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Deploying Code Changes

### Option 1: Quick Deploy (All Changes)

Use this when you've made changes to **BOTH** frontend and backend:

```bash
# Navigate to project root
cd d:\Deeptha\Eyeluxe

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Your descriptive message here"

# Push to GitHub
git push origin main
```

**What Happens:**
- ✅ GitHub Actions automatically rebuilds and deploys frontend (2-3 min)
- ✅ Render automatically rebuilds and deploys backend (5-10 min)

---

### Option 2: Frontend Only Changes

Use this when you only modified frontend code (React components, styles, etc.):

```bash
# Navigate to project root
cd d:\Deeptha\Eyeluxe

# Stage frontend changes
git add client/

# Commit changes
git commit -m "Update: [describe frontend changes]"

# Push to GitHub
git push origin main
```

**Deployment Time:** 2-3 minutes  
**Monitor:** https://github.com/eyeluxefancy/eyeluxe/actions

---

### Option 3: Backend Only Changes

Use this when you only modified backend code (API routes, database logic, etc.):

```bash
# Navigate to project root
cd d:\Deeptha\Eyeluxe

# Stage backend changes
git add server/

# Commit changes
git commit -m "Fix: [describe backend changes]"

# Push to GitHub
git push origin main
```

**Deployment Time:** 5-10 minutes  
**Monitor:** https://dashboard.render.com

---

## 📝 Detailed Step-by-Step Guide

### Making a Code Change and Deploying

#### Step 1: Make Your Changes
Edit your code in VS Code or any editor.

#### Step 2: Test Locally
```bash
# Test Frontend (Terminal 1)
cd d:\Deeptha\Eyeluxe\client
npm run dev
# Opens at http://localhost:5173

# Test Backend (Terminal 2)
cd d:\Deeptha\Eyeluxe\server
npm run dev
# Runs on http://localhost:5000
```

#### Step 3: Stage Changes
```bash
cd d:\Deeptha\Eyeluxe

# Check what files changed
git status

# Add specific files
git add client/src/pages/Dashboard.jsx
git add server/routes/products.js

# OR add all changes
git add .
```

#### Step 4: Commit Changes
```bash
# Use descriptive commit message
git commit -m "Add new feature: rental duration calculator"
```

**Good Commit Message Examples:**
- `"Fix: Inventory table pagination bug"`
- `"Feature: Add export to PDF for invoices"`
- `"Update: Improve dashboard analytics charts"`
- `"Style: Make sidebar responsive on mobile"`

#### Step 5: Push to GitHub
```bash
git push origin main
```

#### Step 6: Monitor Deployment

**For Frontend:**
1. Visit: https://github.com/eyeluxefancy/eyeluxe/actions
2. Wait for green checkmark (✅)
3. Test: https://eyeluxefancy.github.io/eyeluxe/

**For Backend:**
1. Visit: https://dashboard.render.com
2. Click on "eyeluxe" service
3. Watch deployment logs
4. Test: https://eyeluxe.onrender.com/api/health

---

## 🔧 Common Scenarios

### Scenario 1: Fixed a Bug in Frontend

```bash
cd d:\Deeptha\Eyeluxe
git add client/src/pages/Billing.jsx
git commit -m "Fix: Billing calculation rounding error"
git push origin main
```

Wait 2-3 minutes → Changes live!

---

### Scenario 2: Added New API Endpoint

```bash
cd d:\Deeptha\Eyeluxe
git add server/routes/customers.js
git add server/index.js
git commit -m "Feature: Add customer management API"
git push origin main
```

Wait 5-10 minutes → Backend updated!

---

### Scenario 3: Updated Environment Variables

**Frontend (GitHub Pages):**
Not needed - variables are baked into build

**Backend (Render):**
1. Go to https://dashboard.render.com
2. Click on "eyeluxe" service
3. Go to "Environment" tab
4. Add/modify variables
5. Click "Save Changes"
6. Render will auto-redeploy

---

### Scenario 4: Changed Firebase Credentials

```bash
# Update server/serviceAccountKey.json locally
# DO NOT commit this file (it's in .gitignore)

# Instead, update on Render:
```

1. Go to https://dashboard.render.com
2. Click "eyeluxe" service
3. Go to "Environment" → "Secret Files"
4. Update `serviceAccountKey.json`
5. Save → Auto-redeploys

---

## 🎨 Frontend-Specific Changes

### What Triggers Frontend Rebuild:

Changes to any file in `client/`:
- ✅ React components (`*.jsx`)
- ✅ Styles (`*.css`)
- ✅ Configuration (`vite.config.js`, `package.json`)
- ✅ Environment files (`.env.production`)
- ✅ Assets (images, icons)

### Build Process:
1. GitHub Actions runs `npm install`
2. Runs `npm run build`
3. Deploys `dist/` folder to GitHub Pages
4. Site updates at: https://eyeluxefancy.github.io/eyeluxe/

---

## 🖥️ Backend-Specific Changes

### What Triggers Backend Rebuild:

Changes to any file in `server/`:
- ✅ API routes (`routes/*.js`)
- ✅ Main server (`index.js`)
- ✅ Database config (`firebase.js`)
- ✅ Dependencies (`package.json`)
- ⚠️ `.env` files (DON'T commit - use Render dashboard)
- ⚠️ `serviceAccountKey.json` (DON'T commit - use Render secret files)

### Build Process:
1. Render detects push to `main` branch
2. Runs `npm install` in `server/` directory
3. Starts with `npm start`
4. Service available at: https://eyeluxe.onrender.com

---

## ⚡ Quick Reference Commands

### Development (Local)
```bash
# Start frontend dev server
cd d:\Deeptha\Eyeluxe\client
npm run dev

# Start backend dev server
cd d:\Deeptha\Eyeluxe\server
npm run dev
```

### Build & Test Locally
```bash
# Build frontend (test production build)
cd d:\Deeptha\Eyeluxe\client
npm run build
npm run preview

# Test backend
cd d:\Deeptha\Eyeluxe\server
npm start
```

### Deploy to Production
```bash
# From project root
cd d:\Deeptha\Eyeluxe

# Standard workflow
git add .
git commit -m "Your message"
git push origin main
```

### Check Deployment Status
```bash
# View recent commits
git log --oneline -5

# Check current branch
git branch

# View remote URL
git remote -v
```

---

## 🐛 Troubleshooting

### Frontend Not Updating

**Problem:** Changes not showing on https://eyeluxefancy.github.io/eyeluxe/

**Solutions:**
1. **Clear browser cache:** Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
2. **Check GitHub Actions:**
   - Visit: https://github.com/eyeluxefancy/eyeluxe/actions
   - Ensure latest workflow has green checkmark
   - If red X, click to view error logs
3. **Verify changes were pushed:**
   ```bash
   git log --oneline -3
   ```
4. **Wait 2-3 minutes** after green checkmark

---

### Backend Not Updating

**Problem:** API still returning old data or errors

**Solutions:**
1. **Check Render deployment:**
   - Visit: https://dashboard.render.com
   - Click "eyeluxe" service
   - View "Events" tab for deployment status
2. **Check logs:**
   - Click "Logs" tab in Render
   - Look for errors
3. **Manual redeploy:**
   - Click "Manual Deploy" → "Deploy latest commit"
4. **Verify endpoint:**
   ```bash
   curl https://eyeluxe.onrender.com/api/health
   ```

---

### Build Failures

**GitHub Actions Failed:**

1. Click on the failed workflow
2. Expand the failed step
3. Read error message
4. Common issues:
   - **Missing dependency:** Add to `package.json`
   - **Import error:** Check file paths
   - **Syntax error:** Run `npm run build` locally first

**Render Build Failed:**

1. Check Render logs
2. Common issues:
   - **Missing environment variable:** Add in Render dashboard
   - **Port binding:** Ensure `process.env.PORT` is used
   - **Dependencies:** Check `package.json`

---

### Database Connection Issues

**Error:** "Firebase admin not initialized"

**Solution:**
1. Verify `serviceAccountKey.json` is correct in Render
2. Check `FIREBASE_PROJECT_ID` environment variable
3. View Render logs for specific error

---

## 📊 Monitoring Your Deployed App

### Frontend Monitoring
- **URL:** https://eyeluxefancy.github.io/eyeluxe/
- **Status:** https://github.com/eyeluxefancy/eyeluxe/actions
- **Analytics:** Browser DevTools → Network tab

### Backend Monitoring
- **URL:** https://eyeluxe.onrender.com
- **Health Check:** https://eyeluxe.onrender.com/api/health
- **Logs:** https://dashboard.render.com → eyeluxe → Logs
- **Metrics:** Render dashboard shows CPU, Memory, Response times

### Expected Response Times
- **GitHub Pages (Frontend):** < 500ms
- **Render (Backend):** 
  - First request (cold start): 30-60 seconds ⚠️
  - Subsequent requests: < 2 seconds

**Note:** Render free tier "spins down" after 15 minutes of inactivity. First request will be slow.

---

## 🔐 Security Best Practices

### Never Commit These Files:
- ❌ `.env`
- ❌ `server/serviceAccountKey.json`
- ❌ `node_modules/`
- ❌ Any file with API keys or secrets

### Already Protected (in .gitignore):
```
node_modules/
.env
.env.local
**/serviceAccountKey.json
```

### If You Accidentally Commit Secrets:

1. **Rotate credentials immediately:**
   - Firebase: Generate new service account
   - Environment variables: Update in Render dashboard

2. **Remove from git history:**
   ```bash
   # This is advanced - be careful!
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch server/serviceAccountKey.json" \
   --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

---

## 📌 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Live Frontend** | https://eyeluxefancy.github.io/eyeluxe/ | Your deployed app |
| **Live Backend** | https://eyeluxe.onrender.com | API server |
| **API Health Check** | https://eyeluxe.onrender.com/api/health | Check if backend is running |
| **GitHub Repo** | https://github.com/eyeluxefancy/eyeluxe | Source code |
| **GitHub Actions** | https://github.com/eyeluxefancy/eyeluxe/actions | Frontend deployment status |
| **Render Dashboard** | https://dashboard.render.com | Backend deployment & logs |
| **Firebase Console** | https://console.firebase.google.com | Database management |

---

## 🎓 Deployment Workflow Summary

```
┌─────────────────────────────────────────────────┐
│  1. Make code changes locally                   │
│     (Edit files in VS Code)                     │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  2. Test locally                                │
│     npm run dev (both frontend & backend)       │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  3. Stage & commit                              │
│     git add .                                   │
│     git commit -m "message"                     │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  4. Push to GitHub                              │
│     git push origin main                        │
└───────────────────┬─────────────────────────────┘
                    │
                    ├─────────────────┬─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │ GitHub Actions   │ │ Render.com   │ │ Your Local   │
        │ (Frontend)       │ │ (Backend)    │ │ Git History  │
        │ 2-3 min          │ │ 5-10 min     │ │ Updated      │
        └────────┬─────────┘ └──────┬───────┘ └──────────────┘
                 │                  │
                 ▼                  ▼
        ┌──────────────────┐ ┌──────────────┐
        │ GitHub Pages     │ │ Live Backend │
        │ UPDATED ✅       │ │ UPDATED ✅   │
        └──────────────────┘ └──────────────┘
```

---

## 💡 Pro Tips

1. **Always test locally first** before pushing
2. **Use descriptive commit messages** for easier troubleshooting
3. **Monitor deployments** - don't assume they worked
4. **Keep dependencies updated** regularly
5. **Check Render logs** if backend behaves unexpectedly
6. **Clear browser cache** when frontend doesn't update

---

## 🆘 Need Help?

1. **Check deployment logs** (GitHub Actions or Render)
2. **Review this guide** for common solutions
3. **Test API health:** https://eyeluxe.onrender.com/api/health
4. **Check browser console** for frontend errors (F12)

---

**Last Updated:** January 18, 2026  
**Version:** 1.0
