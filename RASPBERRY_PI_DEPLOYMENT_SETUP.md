# Forza Racing League - GitHub & Raspberry Pi Deployment Complete

## 🎉 What's Been Set Up

Your app is now ready to be built, hosted on GitHub, and deployed to a Raspberry Pi!

## 📦 GitHub Container Registry (GHCR)

### Automated Build Pipeline
✅ **GitHub Actions Workflow** (`.github/workflows/build-and-push.yml`)
- Auto-builds when you push to main/master
- Creates multi-platform images: `linux/amd64` and `linux/arm64`
- Pushes to `ghcr.io/YOUR_USERNAME/forza-racing`
- No manual build steps needed!

### How It Works
```
Your Code (GitHub)
        ↓
    Push to main
        ↓
GitHub Actions Runs
        ↓
Build: Backend + Frontend
        ↓
Multi-arch: amd64 + arm64
        ↓
Push to GHCR
        ↓
Ready for Raspberry Pi!
```

## 🍓 Raspberry Pi Deployment

### Pre-Built Configuration Files

1. **`docker-compose.pi.yml`** - Preconfigured for Pi
   - Uses GHCR images
   - Volume mounts for data persistence
   - Health checks
   - Environment variable support

2. **`setup-pi.sh`** - Automated setup script
   - Installs Docker and Docker Compose
   - Creates project directory
   - Generates .env configuration
   - Pulls latest images

3. **`build-images.sh`** - Local multi-platform build
   - Build images for Pi without GitHub Actions
   - Test before pushing to GitHub

## 📋 Configuration Files

### GitHub Actions
- **Location**: `.github/workflows/build-and-push.yml`
- **Triggers**: Push to main/master, manual workflow dispatch
- **Platforms**: linux/amd64, linux/arm64
- **Output**: ghcr.io/YOUR_USERNAME/forza-racing:backend-* and frontend-*

### Docker Compose
- **`docker-compose.yml`** - Local/server development
- **`docker-compose.pi.yml`** - Raspberry Pi production
- **Both support**: OAuth2 environment variables

## 🚀 Quick Start Paths

### Path 1: Automatic (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "Add Docker and GitHub Actions"
git push origin main

# 2. GitHub Actions builds automatically
# (Check Actions tab for build status)

# 3. On Raspberry Pi
ssh pi@YOUR_PI_IP
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/setup-pi.sh | bash

# 4. Start the app
cd ~/forza-racing
docker-compose -f docker-compose.pi.yml up -d

# Done! Open: http://YOUR_PI_IP:3000
```

### Path 2: Manual Build and Push
```bash
# 1. Build locally
bash build-images.sh

# 2. Login to GHCR
docker login ghcr.io

# 3. Push to GHCR
docker buildx build --platform linux/amd64,linux/arm64 --push \
  -t ghcr.io/YOUR_USERNAME/forza-racing:backend-latest ./backend

docker buildx build --platform linux/amd64,linux/arm64 --push \
  -t ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest ./frontend

# 4. Pull on Pi
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## 📚 Documentation

### Setup & Deployment
| Document | Purpose |
|----------|---------|
| [SETUP.md](./SETUP.md) | Docker Compose local/server setup |
| [OAUTH_SETUP.md](./OAUTH_SETUP.md) | OAuth2/OIDC Authentik configuration |
| [OAUTH_INTEGRATION.md](./OAUTH_INTEGRATION.md) | Auth integration details |

### Raspberry Pi
| Document | Purpose |
|----------|---------|
| [RASPBERRY_PI_QUICKSTART.md](./RASPBERRY_PI_QUICKSTART.md) | 5-minute quick start |
| [RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md) | Detailed Pi deployment |
| [GITHUB_CONTAINER_REGISTRY.md](./GITHUB_CONTAINER_REGISTRY.md) | Image hosting & build |

## 🛠️ Helper Scripts

### For Raspberry Pi
**`setup-pi.sh`** - One-command setup
```bash
# Makes setup interactive and automated
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/setup-pi.sh | bash
```

### For Local Testing
**`build-images.sh`** - Multi-platform build
```bash
# Build for ARM64 and amd64 locally
bash build-images.sh
```

## 📝 What You Need to Do

### Step 1: GitHub Configuration (One-time)
```bash
cd ~/ForzaRacing

# Make sure you have:
✅ .github/workflows/build-and-push.yml created
✅ docker-compose.pi.yml created
✅ setup-pi.sh created
✅ build-images.sh created
```

### Step 2: Update Repository References
In these files, replace `YOUR_GITHUB_USERNAME`:
- `docker-compose.pi.yml` - Image references
- `RASPBERRY_PI_QUICKSTART.md` - Setup script URL
- GitHub Actions output (happens automatically)

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Add Raspberry Pi deployment and GitHub Actions"
git push origin main
```

### Step 4: Watch Build
```
GitHub repo → Actions tab → "Build and Push Docker Images" workflow
```

### Step 5: Deploy to Raspberry Pi
```bash
# SSH into Pi
ssh pi@YOUR_PI_IP

# Run setup (or manual steps in RASPBERRY_PI_QUICKSTART.md)
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/setup-pi.sh | bash

# Start app
cd ~/forza-racing
docker-compose -f docker-compose.pi.yml up -d

# Open browser: http://YOUR_PI_IP:3000
```

## 🔍 Verification Checklist

### Files Created
- ✅ `.github/workflows/build-and-push.yml` - GitHub Actions
- ✅ `docker-compose.pi.yml` - Pi configuration
- ✅ `setup-pi.sh` - Automated Pi setup
- ✅ `build-images.sh` - Local build script
- ✅ `RASPBERRY_PI_DEPLOYMENT.md` - Detailed guide
- ✅ `RASPBERRY_PI_QUICKSTART.md` - Quick guide
- ✅ `GITHUB_CONTAINER_REGISTRY.md` - GHCR guide

### Features Enabled
- ✅ Multi-platform Docker builds (amd64 + ARM64)
- ✅ GitHub Container Registry hosting
- ✅ Automated builds via GitHub Actions
- ✅ Raspberry Pi deployment ready
- ✅ Environment-based configuration
- ✅ OAuth2 support on Pi
- ✅ Persistent database volume
- ✅ Health checks
- ✅ Auto-restart on crash

## 🐳 Docker Architecture

### Images Built
```
ghcr.io/YOUR_USERNAME/forza-racing:backend-latest    (linux/amd64, linux/arm64)
ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest   (linux/amd64, linux/arm64)
```

### Base Images (ARM64 Compatible)
- **Backend**: `node:18-alpine` (small, fast)
- **Frontend**: `node:18-alpine` + `serve` (optimized)

### Build Time per Architecture
- AMD64: ~2-3 minutes
- ARM64: ~3-4 minutes
- Both in parallel: ~4-5 minutes total

## 🚀 Advanced Usage

### Manual Image Push
```bash
docker buildx build --platform linux/amd64,linux/arm64 --push \
  -t ghcr.io/YOUR_USERNAME/forza-racing:backend-v1.0.0 \
  ./backend
```

### Deploy with Tags
```bash
# On Pi, use specific version
docker pull ghcr.io/YOUR_USERNAME/forza-racing:backend-v1.0.0
```

### Update on Pi
```bash
cd ~/forza-racing
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## 🔒 Security Notes

1. **GHCR Token**
   - Use GitHub personal access token
   - Don't commit tokens to repo
   - Use GitHub Secrets for CI/CD

2. **Environment Variables**
   - Store OAuth secrets in `.env` (not in Git)
   - Update `.env` on Pi with real credentials
   - Use strong JWT_SECRET

3. **Image Privacy**
   - Default: Private (requires auth to pull)
   - Optional: Make public for open-source sharing

## 📊 Deployment Scenarios

### Scenario 1: Single Pi at Home
1. SSH into Pi
2. Run `setup-pi.sh`
3. Access from local network

### Scenario 2: Multiple Pis
1. Build images once (GitHub Actions)
2. Deploy to each Pi separately
3. All use same image versions

### Scenario 3: Update Process
1. Update code on your PC
2. Push to GitHub
3. Actions builds and pushes
4. Pi pulls latest: `docker-compose pull && docker-compose up -d`

## 💡 Tips

- **Automatic Updates**: Set cron job on Pi to `docker-compose pull` daily
- **Monitor Pi**: Use `docker stats` to watch resource usage
- **Backup Database**: Copy `~/forza-racing/data/races.db` regularly
- **Test Locally First**: Use `docker-compose up` before pushing
- **Check Logs**: `docker-compose -f docker-compose.pi.yml logs -f`

## 📞 Support

### GitHub Actions Issues
- Check `.github/workflows/build-and-push.yml`
- View logs in GitHub → Actions tab
- See [GITHUB_CONTAINER_REGISTRY.md](./GITHUB_CONTAINER_REGISTRY.md)

### Raspberry Pi Issues
- See [RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md) troubleshooting
- Check Docker logs: `docker-compose logs -f`
- Verify .env is configured correctly

### OAuth Issues
- See [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- Ensure redirect URI matches Pi's IP

## ✅ Next Steps

1. **Immediate**:
   - Update `YOUR_GITHUB_USERNAME` in config files
   - Commit changes and push to GitHub
   - Monitor GitHub Actions build

2. **Within 24 hours**:
   - Verify images built successfully in GHCR
   - Test pull on any Linux machine: `docker pull ghcr.io/...`

3. **Deploy to Pi**:
   - Follow RASPBERRY_PI_QUICKSTART.md
   - Or run `setup-pi.sh` automated script
   - Verify app at http://YOUR_PI_IP:3000

## 🎯 Summary

Your app now has:
- ✅ **Automated CI/CD** - GitHub Actions builds on every push
- ✅ **Multi-platform** - Runs on AMD64 and ARM64 (Raspberry Pi)
- ✅ **Image Hosting** - GitHub Container Registry (free storage)
- ✅ **Simple Deployment** - One command to start on Pi
- ✅ **Production Ready** - Health checks, auto-restart, persistent data
- ✅ **OAuth Support** - Authentication works on Pi too

Ready to deploy! 🚀
