# Deployment Guide

Your Instagram Caption Copier app is ready to deploy! Choose one of these free hosting options:

## Option 1: Render (Recommended - Easiest)

1. **Go to [Render.com](https://render.com)** and sign up/log in with your GitHub account

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**: `Adityasingh-8858/insta-captioners`

4. **Configure the service**:
   - Name: `insta-captioners`
   - Branch: `copilot/build-caption-copy-webapp` (or merge to main first)
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Click "Create Web Service"**

6. Wait 2-3 minutes for deployment. Your app will be live at: `https://insta-captioners.onrender.com`

**Note**: Free tier may sleep after inactivity. First request might be slow.

---

## Option 2: Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up/log in with GitHub

2. **Click "Add New" → "Project"**

3. **Import your repository**: `Adityasingh-8858/insta-captioners`

4. **Configure**:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave default)
   - Output Directory: (leave default)

5. **Click "Deploy"**

6. Your app will be live at: `https://insta-captioners.vercel.app`

---

## Option 3: Railway

1. **Go to [Railway.app](https://railway.app)** and sign up with GitHub

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select**: `Adityasingh-8858/insta-captioners`

4. **Railway auto-detects** Node.js and deploys automatically

5. **Add a public domain** in settings

6. Your app will be live at the generated Railway URL

---

## Option 4: Merge to Main & Deploy

If you want to merge your changes to the main branch first:

```bash
# Switch to main branch
git checkout main

# Merge your feature branch
git merge copilot/build-caption-copy-webapp

# Push to main
git push origin main
```

Then deploy using any of the options above, selecting `main` as the branch.

---

## Testing Your Deployed App

1. Visit your deployed URL
2. Paste an Instagram reel URL (e.g., `https://www.instagram.com/reel/ABC123/`)
3. Click "Get Caption"
4. Copy the caption!

---

## Important Notes

⚠️ **Instagram Limitations**:
- This app scrapes public Instagram pages
- Private posts won't work
- Instagram may block requests if used excessively
- For production, consider using Instagram's official Graph API

💡 **Recommended**: Deploy on Render for the easiest setup with Node.js backends.
