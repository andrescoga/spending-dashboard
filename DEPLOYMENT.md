# Deployment Guide

This guide explains how to deploy the spending dashboard to GitHub Pages (frontend) and Vercel (backend serverless function).

## Architecture

```
User's Device
    ↓
GitHub Pages (Frontend)
https://username.github.io/spending-dashboard/
    ↓
Vercel Serverless Function (Backend)
https://username.vercel.app/api/spending-data-a8k3h9x2
    ↓
Google Sheets (Data Source)
```

## Prerequisites

1. **GitHub Account** - For GitHub Pages hosting
2. **Vercel Account** - For serverless function hosting (sign up at vercel.com)
3. **Google Service Account** - For Google Sheets API access
4. **Google Sheet** - Your spending data

## Step 1: Deploy Backend to Vercel

### 1.1 Sign in to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub

### 1.2 Create New Project

1. Click "New Project" → "Import Repository"
2. Select your `spending-dashboard` repository
3. Configure settings:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

### 1.3 Add Environment Variables

Click "Environment Variables" and add:

- **`SHEET_ID`**: Your Google Sheets ID (from the URL)
  - Example: `1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA`
- **`GOOGLE_CREDENTIALS`**: Your service account JSON (entire object as one line)
  - Example: `{"type":"service_account","project_id":"...","private_key":"...",...}`

### 1.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your Vercel URL (e.g., `https://spending-dashboard-abc123.vercel.app`)

### 1.5 Test the API

Open in browser:
```
https://your-vercel-url.vercel.app/api/spending-data-a8k3h9x2
```

Should return JSON with your spending data.

## Step 2: Update Frontend Configuration

### 2.1 Update src/config.js

Replace `'https://your-username.vercel.app'` with your actual Vercel URL from Step 1.4.

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://spending-dashboard-abc123.vercel.app'  // ← Your Vercel URL
    : 'http://localhost:3001');
```

### 2.2 Update GitHub Actions (if using automatic deployment)

Edit `.github/workflows/deploy.yml` line 27:

```yaml
env:
  VITE_API_URL: https://spending-dashboard-abc123.vercel.app  # ← Your Vercel URL
```

### 2.3 Update vite.config.js

Change `base` to match your GitHub repository name:

```javascript
base: '/spending-dashboard/',  // ← Your repo name
```

### 2.4 Commit Changes

```bash
git add src/config.js .github/workflows/deploy.yml vite.config.js
git commit -m "Configure Vercel API URL and GitHub Pages base"
git push origin mobile
```

## Step 3: Deploy Frontend to GitHub Pages

### Option A: Manual Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build and deploy:**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` → `/ (root)`
   - Save

4. **Access your site:**
   - URL: `https://your-username.github.io/repository-name/`
   - Example: `https://johndoe.github.io/spending-dashboard/`

### Option B: Automatic Deployment (Recommended)

1. **Enable GitHub Actions:**
   - Go to repository Settings → Actions → General
   - Enable "Read and write permissions" for workflows
   - Save

2. **Merge to main branch:**
   ```bash
   git checkout main
   git merge mobile
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to Actions tab in GitHub
   - Watch "Deploy to GitHub Pages" workflow
   - Takes ~2-3 minutes

4. **Enable GitHub Pages** (first time only):
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` → `/ (root)`
   - Save

5. **Future updates:**
   - Just push to `main` branch
   - GitHub Actions auto-rebuilds and deploys

## Step 4: Test Everything

1. **Open your GitHub Pages URL**
2. **Verify data loads** (check browser DevTools → Network tab)
3. **Test all features:**
   - [ ] All tabs load
   - [ ] Charts display data
   - [ ] Controls work
   - [ ] No console errors

4. **Test on mobile:**
   - Open on iPhone Safari
   - Verify layout (should stack vertically if responsive design is enabled)
   - Test touch interactions

## Troubleshooting

### "Failed to fetch" error

- **Check CORS:** Verify Vercel function has CORS headers
- **Check API URL:** Verify `src/config.js` has correct Vercel URL
- **Check Vercel logs:** Go to Vercel dashboard → Functions → Logs

### Blank page on GitHub Pages

- **Check base:** Ensure `vite.config.js` base matches repo name
- **Check console:** Look for 404 errors in browser console
- **Check GitHub Pages:** Verify it's enabled and using `gh-pages` branch

### Google Sheets data not loading

- **Check credentials:** Verify `GOOGLE_CREDENTIALS` in Vercel env vars
- **Check Sheet ID:** Verify `SHEET_ID` in Vercel env vars
- **Check permissions:** Ensure service account has access to the sheet
- **Check Vercel logs:** Look for errors in Vercel dashboard

## Security Notes

- **Endpoint obscurity:** `/api/spending-data-a8k3h9x2` is hard to guess
- **Google credentials:** Encrypted in Vercel environment variables
- **Data access:** Anyone with the GitHub Pages URL can view the dashboard
- **Future:** Can add simple API key authentication if needed

## Cost

- **GitHub Pages:** Free
- **Vercel Serverless:** Free tier (100GB-hours/month, sufficient for personal use)
- **Google Sheets API:** Free (100 requests per 100 seconds)
- **Total:** $0/month

## Updating Data

1. Edit your Google Sheet
2. Refresh the dashboard page
3. Data automatically fetches latest from Google Sheets (no cache in serverless function)

## Local Development

```bash
# Start local development servers
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## Support

- **GitHub Pages:** https://docs.github.com/en/pages
- **Vercel:** https://vercel.com/docs
- **Google Sheets API:** https://developers.google.com/sheets/api
