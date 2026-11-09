# 🚀 ACHARYA Deployment Guide

This guide will walk you through deploying the ACHARYA Career Forging Platform to various cloud platforms.

## 📋 Prerequisites

Before deployment, ensure you have:

- [ ] Google Gemini AI API key
- [ ] MongoDB database (local or cloud)
- [ ] Git repository with your code
- [ ] Environment variables ready

## 🎯 Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is the easiest platform for deploying FastAPI applications with automatic detection and deployment.

#### Step 1: Prepare Your Repository
```bash
# Ensure your repository is on GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Railway
1. **Visit [railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your ACHARYA repository**
5. **Railway will automatically detect FastAPI and deploy**

#### Step 3: Configure Environment Variables
In your Railway project dashboard:
1. Go to "Variables" tab
2. Add the following environment variables:

```env
MONGODB_URL=<your-mongodb-uri>
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=your_super_secret_jwt_key_here
```

#### Step 4: Get Your Live URL
- Railway will provide a live URL (e.g., `https://acharya-production.up.railway.app`)
- Your app is now live! 🎉

### Option 2: Render (Free Tier Available)

#### Step 1: Prepare for Render
Create a `render.yaml` file in your project root:

```yaml
services:
  - type: web
    name: acharya-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: MONGODB_URL
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: JWT_SECRET_KEY
        sync: false
```

#### Step 2: Deploy to Render
1. **Visit [render.com](https://render.com)**
2. **Sign up/Login with GitHub**
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure settings:**
   - **Name:** acharya-backend
   - **Environment:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Add environment variables**
7. **Deploy**

### Option 3: Heroku

#### Step 1: Install Heroku CLI
```bash
# Windows
winget install --id=Heroku.HerokuCLI

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Login and Create App
```bash
heroku login
heroku create your-acharya-app
```

#### Step 3: Add MongoDB Addon
```bash
heroku addons:create mongolab:sandbox
```

#### Step 4: Set Environment Variables
```bash
heroku config:set GEMINI_API_KEY=your_gemini_api_key_here
heroku config:set JWT_SECRET_KEY=your_super_secret_jwt_key_here
```

#### Step 5: Deploy
```bash
git push heroku main
```

### Option 4: DigitalOcean App Platform

#### Step 1: Prepare for DigitalOcean
1. **Ensure your code is on GitHub**
2. **Create a DigitalOcean account**

#### Step 2: Deploy
1. **Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)**
2. **Click "Apps" → "Create App"**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Source:** Your GitHub repo
   - **Branch:** main
   - **Build Command:** `pip install -r requirements.txt`
   - **Run Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add environment variables**
6. **Deploy**

## 🔧 Environment Variables Setup

### Required Variables
```env
# Database
MONGODB_URL=<your-mongodb-uri>

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here

# Security
JWT_SECRET_KEY=your_super_secret_jwt_key_here

# Server (optional)
HOST=0.0.0.0
PORT=8000
```

### How to Get These Values

#### 1. MongoDB URL
**Option A: MongoDB Atlas (Recommended)**
1. Go to [mongodb.com](https://mongodb.com)
2. Create free account
3. Create new cluster
4. Get connection string

**Option B: Local MongoDB**
```env
MONGODB_URL=mongodb://localhost:27017/acharya
```

#### 2. Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key

#### 3. JWT Secret Key
Generate a secure random string:
```bash
# On Linux/macOS
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Visit [mongodb.com](https://mongodb.com)
   - Sign up for free account

2. **Create Cluster**
   - Choose "Free" tier
   - Select cloud provider and region
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access"
   - Create new user with read/write permissions
   - Remember username and password

4. **Set Up Network Access**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (allows all IPs)

5. **Get Connection String**
   - Go to "Database"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### Local MongoDB

```bash
# Install MongoDB
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB
mongod

# Create database
mongosh
use acharya
```

## 🚀 Frontend Deployment

### Option 1: Same Platform (Railway/Render)
- FastAPI serves static files automatically
- No additional deployment needed

### Option 2: Vercel (Recommended for Frontend)

1. **Create Vercel Account**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset:** Other
     - **Build Command:** `echo "Static files"`
     - **Output Directory:** `.`
   - Deploy

3. **Configure Environment**
   - Add environment variable for API URL:
     - `VITE_API_URL=https://your-backend-url.com`

### Option 3: Netlify

1. **Create Netlify Account**
   - Visit [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy**
   - Click "New site from Git"
   - Connect your repository
   - Configure build settings
   - Deploy

## 🔍 Post-Deployment Checklist

### ✅ Backend Verification
- [ ] API endpoints respond correctly
- [ ] Database connection works
- [ ] Authentication functions
- [ ] AI features work
- [ ] File uploads work

### ✅ Frontend Verification
- [ ] Pages load correctly
- [ ] Navigation works
- [ ] Forms submit properly
- [ ] Responsive design works
- [ ] Loading animations work

### ✅ Security Verification
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] CORS is configured properly
- [ ] JWT tokens work correctly

### ✅ Performance Verification
- [ ] Pages load quickly
- [ ] API responses are fast
- [ ] Database queries are optimized
- [ ] Static files are cached

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check if all dependencies are in requirements.txt
pip freeze > requirements.txt

# Ensure Python version compatibility
python --version  # Should be 3.8+
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
python -c "
import motor.motor_asyncio
client = motor.motor_asyncio.AsyncIOMotorClient('your_mongodb_url')
print('Connection successful')
"
```

#### 3. Environment Variables
```bash
# Check if variables are set
echo $MONGODB_URL
echo $GEMINI_API_KEY
echo $JWT_SECRET_KEY
```

#### 4. Port Issues
```bash
# Check if port is available
netstat -an | grep :8000
```

### Debug Commands

#### Test API Locally
```bash
# Start server
python main.py

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

#### Test Database
```bash
# Connect to MongoDB
mongosh your_mongodb_url

# Check collections
show collections
db.users.find()
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Add to your deployment
curl https://your-app-url.com/health
```

### Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Render
# Check dashboard logs
```

### Performance Monitoring
- Set up monitoring with your platform's tools
- Monitor API response times
- Track database performance
- Set up alerts for errors

## 🔄 Updates & Maintenance

### Updating Your App
```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main

# Platform will auto-deploy
```

### Database Backups
```bash
# MongoDB Atlas provides automatic backups
# For local MongoDB:
mongodump --db acharya --out backup/
```

### Environment Variable Updates
- Update through your platform's dashboard
- Restart the application after changes

## 🎯 Production Best Practices

### Security
- [ ] Use HTTPS everywhere
- [ ] Secure environment variables
- [ ] Implement rate limiting
- [ ] Regular security updates

### Performance
- [ ] Enable caching
- [ ] Optimize database queries
- [ ] Use CDN for static files
- [ ] Monitor resource usage

### Reliability
- [ ] Set up monitoring
- [ ] Configure auto-scaling
- [ ] Implement health checks
- [ ] Regular backups

---

**Your ACHARYA platform is now ready to empower careers worldwide!** 🚀

For additional support, check the main README.md or create an issue in your repository.
