# Complete Setup Checklist - Forza Racing League on Raspberry Pi

## ✅ Pre-Deployment Verification

Run through this checklist before pushing to GitHub and deploying to your Raspberry Pi.

### GitHub Repository Setup

- [ ] Repository is on GitHub (public or private)
- [ ] You have push access to the repository
- [ ] Main branch exists (or master, depending on your setup)
- [ ] `.github/workflows/build-and-push.yml` exists
- [ ] No personal secrets or credentials in code

### Files Verification

#### Core Application
- [ ] `backend/src/index.ts` - Main server file
- [ ] `backend/src/routes/auth.ts` - OAuth endpoints
- [ ] `frontend/src/App.tsx` - React app with auth
- [ ] `frontend/src/services/auth.tsx` - Auth context

#### Docker Configuration
- [ ] `backend/Dockerfile` - Uses node:18-alpine (ARM64 compatible)
- [ ] `frontend/Dockerfile` - Uses node:18-alpine (ARM64 compatible)
- [ ] `docker-compose.yml` - Local development config
- [ ] `docker-compose.pi.yml` - Raspberry Pi config

#### GitHub Actions
- [ ] `.github/workflows/build-and-push.yml` exists and is valid
- [ ] Workflow triggers on push to main/master
- [ ] Platforms include: `linux/amd64,linux/arm64`

#### Deployment Scripts
- [ ] `setup-pi.sh` - Automated Pi setup
- [ ] `build-images.sh` - Local multi-platform build
- [ ] Scripts are executable

#### Documentation
- [ ] `README.md` - Updated with deployment links
- [ ] `SETUP.md` - Updated with OAuth sections
- [ ] `OAUTH_SETUP.md` - OAuth2 configuration guide
- [ ] `OAUTH_INTEGRATION.md` - Auth integration details
- [ ] `RASPBERRY_PI_DEPLOYMENT.md` - Detailed Pi guide
- [ ] `RASPBERRY_PI_QUICKSTART.md` - Quick start
- [ ] `GITHUB_CONTAINER_REGISTRY.md` - GHCR guide
- [ ] `RASPBERRY_PI_DEPLOYMENT_SETUP.md` - Overview
- [ ] `DEPLOYMENT_QUICKREF.sh` - Quick reference

### Environment Files

- [ ] `.env.example` exists in frontend/
- [ ] `.env.example` exists in backend/
- [ ] `.env` files are in `.gitignore` (not tracked)
- [ ] `.gitignore` includes `data/` directory

### Dependencies

#### Backend
- [ ] `npm install` completed (node_modules exists)
- [ ] `package.json` includes: jsonwebtoken, axios
- [ ] `npm run build` succeeds without errors

#### Frontend
- [ ] `npm install` completed (node_modules exists)
- [ ] `npm run build` succeeds without errors
- [ ] No TypeScript compilation errors

### OAuth2 Configuration

- [ ] Authentik server is accessible
- [ ] OAuth2 application created in Authentik
- [ ] Client ID noted
- [ ] Client Secret noted
- [ ] Issuer URL noted (e.g., https://auth.example.com/application/o/)
- [ ] `OAUTH_REDIRECT_URI` planned (will update in Pi)

---

## 🚀 Deployment Steps

### Step 1: Prepare for GitHub Push

Before pushing, do a final check:

```bash
# 1. Verify builds work
npm run build  # in backend/
npm run build  # in frontend/

# 2. Check .gitignore is correct
cat .gitignore | grep -E "\.env|data|node_modules"

# 3. Verify no secrets in code
grep -r "OAUTH_CLIENT_SECRET" . --exclude-dir=node_modules  # Should only be in .env.example

# 4. Test with Docker Compose locally
docker-compose up -d
# Wait 30 seconds
docker-compose ps  # All should be running
docker-compose down

# 5. List files that will be committed
git status
```

### Step 2: Update Configuration Files

In `docker-compose.pi.yml`, update:
```yaml
services:
  backend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/forza-racing/backend-latest:latest
  frontend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/forza-racing/frontend-latest:latest
```

In `RASPBERRY_PI_QUICKSTART.md`, update:
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/ForzaRacing/main/setup-pi.sh
```

### Step 3: Push to GitHub

```bash
# Stage all changes
git add .

# Review what you're committing
git status

# Commit with descriptive message
git commit -m "Add GitHub Actions CI/CD and Raspberry Pi deployment"

# Push to main branch
git push origin main

# Verify push succeeded
git log --oneline -n 5
```

### Step 4: Monitor GitHub Actions Build

1. Go to: `https://github.com/YOUR_USERNAME/ForzaRacing/actions`
2. Click: "Build and Push Docker Images" workflow
3. Watch for:
   - ✅ Checkout repository
   - ✅ Set up Docker Buildx
   - ✅ Log in to Container Registry
   - ✅ Build and push backend image
   - ✅ Build and push frontend image
4. Check build times:
   - Multi-platform build typically takes 5-10 minutes
   - Both amd64 and arm64 built in parallel
5. Verify successful completion (green checkmark)

### Step 5: Verify Images in GitHub Packages

1. Go to: `https://github.com/YOUR_USERNAME/ForzaRacing/pkgs/container`
2. Should see:
   - `forza-racing/backend-latest`
   - `forza-racing/frontend-latest`
3. Click on each package:
   - Verify multiple platforms listed (amd64, arm64)
   - Check image size (~200MB for backend, ~200MB for frontend)
   - Note the full image name for docker-compose

### Step 6: Prepare Raspberry Pi

Before deploying, ensure:

- [ ] Raspberry Pi 4 or later (2GB+ RAM recommended)
- [ ] Raspberry Pi OS (latest) installed
- [ ] Internet connection (hardwired or WiFi)
- [ ] SSH access enabled: `sudo systemctl enable ssh`
- [ ] Know Pi's IP address: `hostname -I` (on Pi)
- [ ] Can SSH from your machine: `ssh pi@PI_IP_ADDRESS`

### Step 7: Deploy to Raspberry Pi

**Option A - Automated (5 minutes):**

```bash
# On your local machine
ssh pi@YOUR_PI_IP

# On the Raspberry Pi, run:
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/setup-pi.sh | bash
```

This will:
- Install Docker and Docker Compose
- Create ~/forza-racing directory
- Download docker-compose.pi.yml
- Prompt for OAuth configuration
- Pull latest images
- Display next steps

**Option B - Manual (10 minutes):**

```bash
# SSH into Pi
ssh pi@YOUR_PI_IP

# Create directory
mkdir -p ~/forza-racing && cd ~/forza-racing

# Download compose file
wget https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/docker-compose.pi.yml

# Create .env file with your OAuth credentials
cat > .env << 'EOF'
OAUTH_ISSUER_URL=https://auth.example.com/application/o/
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=http://YOUR_PI_IP:3000/auth/callback
VITE_OAUTH_ISSUER_URL=https://auth.example.com/application/o/
VITE_OAUTH_CLIENT_ID=your-client-id
VITE_OAUTH_REDIRECT_URI=http://YOUR_PI_IP:3000/auth/callback
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Create data directory
mkdir -p data

# Pull images (first run takes a few minutes)
docker-compose -f docker-compose.pi.yml pull

# Start the application
docker-compose -f docker-compose.pi.yml up -d

# Wait 30 seconds for services to start
sleep 30

# Verify services are running
docker-compose -f docker-compose.pi.yml ps
```

### Step 8: Verify App is Running

```bash
# Check container status
docker-compose -f docker-compose.pi.yml ps

# Should see:
# NAME              STATUS         PORTS
# forza-racing-backend-1    Up 2 minutes   5000/tcp
# forza-racing-frontend-1   Up 1 minute    3000/tcp

# Check logs
docker-compose -f docker-compose.pi.yml logs -f

# Look for:
# backend: listening on port 5000
# frontend: ready in X ms
```

### Step 9: Access the Application

1. Find your Pi's IP address (if you don't have it):
   ```bash
   ssh pi@YOUR_PI_IP
   hostname -I  # Output: 192.168.1.100 (or similar)
   ```

2. Open browser on any device on your network:
   ```
   http://192.168.1.100:3000
   ```

3. You should see:
   - Login page with "Login with Authentik" button
   - Click button
   - Redirected to your Authentik server
   - Login with your credentials
   - Redirected back to app
   - Dashboard with leaderboard displays
   - "Record Race" and "Manage Players" tabs available

### Step 10: Test Functionality

- [ ] Login works with Authentik
- [ ] User name displays in header
- [ ] Logout button works
- [ ] Leaderboard page loads
- [ ] Can add a player (requires login)
- [ ] Can record a race (requires login)
- [ ] Leaderboard updates after recording race
- [ ] Unauthenticated users still see leaderboard

---

## 🔍 Verification Checklist

### After First Deployment

- [ ] Container status shows "Up" for both services
- [ ] No errors in docker logs
- [ ] Frontend accessible at http://PI_IP:3000
- [ ] Backend API accessible at http://PI_IP:5000/api
- [ ] OAuth login redirects to Authentik
- [ ] After login, user name appears in header
- [ ] Protected routes require authentication
- [ ] Public leaderboard visible without login
- [ ] Database file created: ~/forza-racing/data/races.db

### Ongoing Monitoring

- [ ] Check Docker stats: `docker stats`
- [ ] Memory usage < 80% (upgrade Pi RAM if higher)
- [ ] CPU usage < 50% during normal use
- [ ] No errors in `docker-compose logs`
- [ ] Cron job set up for daily image pulls (optional)

---

## 📋 Troubleshooting Decision Tree

### Issue: "Can't reach app at http://PI_IP:3000"

```
├─ Check Pi is running:
│  └─ ssh pi@PI_IP  (Can you connect?)
│
├─ Check Docker containers:
│  └─ docker-compose -f docker-compose.pi.yml ps
│     └─ Do both services show "Up"?
│
├─ Check port 3000:
│  └─ docker-compose -f docker-compose.pi.yml logs frontend
│     └─ Look for "listening on port 3000"?
│
└─ Check firewall:
   └─ sudo ufw status
      └─ Port 3000 allowed?
```

### Issue: "OAuth login not working"

```
├─ Check .env file:
│  └─ cat .env
│     └─ All OAuth variables set?
│
├─ Check redirect URI:
│  └─ OAUTH_REDIRECT_URI=http://YOUR_PI_IP:3000/auth/callback
│     └─ Does your Authentik config match?
│
└─ Check backend logs:
   └─ docker-compose -f docker-compose.pi.yml logs backend
      └─ Any auth errors?
```

### Issue: "Out of memory"

```
├─ Check memory usage:
│  └─ docker stats
│     └─ Memory > 512MB?
│
├─ Solutions (in order):
│  1. Restart services: docker-compose restart
│  2. Add swap: sudo dphys-swapfile setup
│  3. Upgrade Raspberry Pi RAM
│
└─ Monitor with: watch docker stats
```

---

## 📞 Support Resources

### If Stuck

1. **GitHub Actions build fails**
   - Check: `.github/workflows/build-and-push.yml`
   - View: Actions tab in GitHub
   - See: GITHUB_CONTAINER_REGISTRY.md

2. **Raspberry Pi deployment fails**
   - Read: RASPBERRY_PI_DEPLOYMENT.md (troubleshooting section)
   - Check: Docker logs
   - Verify: .env configuration

3. **OAuth not working**
   - Read: OAUTH_SETUP.md (troubleshooting)
   - Verify: Authentik OAuth application configuration
   - Check: Redirect URI matches your Pi's IP

4. **Docker image won't pull**
   - Verify: Image exists in GitHub Packages
   - Check: GitHub Actions build completed
   - Try: `docker pull ghcr.io/YOUR_USERNAME/forza-racing:backend-latest`

---

## ✅ Final Sign-Off

Before you declare success:

- [ ] GitHub Actions workflow ran successfully
- [ ] Images built for both amd64 and arm64
- [ ] Images stored in GitHub Container Registry
- [ ] Raspberry Pi deployment completed
- [ ] App accessible at http://PI_IP:3000
- [ ] OAuth login works
- [ ] At least one race recorded successfully
- [ ] Database file persists across restarts

---

**Congratulations! 🎉 Your Forza Racing League is deployed on a Raspberry Pi!**

For updates: `docker-compose -f docker-compose.pi.yml pull && docker-compose -f docker-compose.pi.yml up -d`

For backups: `cp ~/forza-racing/data/races.db ~/races.db.backup`
