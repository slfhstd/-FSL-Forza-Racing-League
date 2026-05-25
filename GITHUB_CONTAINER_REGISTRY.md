# Docker Image Hosting on GitHub Container Registry (GHCR)

Complete guide to building, hosting, and deploying Docker images on GitHub Container Registry for your Forza Racing League app.

## Overview

**GitHub Container Registry (GHCR)** allows you to:
- ✅ Store Docker images for free in a GitHub repository
- ✅ Auto-build images for multiple architectures (amd64, arm64)
- ✅ Deploy to Raspberry Pi with one command
- ✅ Version and tag images automatically
- ✅ Use GitHub Actions for continuous deployment

**Supported Architectures:**
- Linux x86_64 (amd64) - Most PCs, Macs, cloud servers
- Linux ARM64 - Raspberry Pi 4/5

## Quick Start (Automated)

### Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Add Docker and GitHub Actions"
git push origin main
```

### Step 2: GitHub Actions Builds Automatically

When you push to main:
1. GitHub Actions runs the workflow
2. Images build for both amd64 and arm64
3. Images pushed to `ghcr.io/YOUR_USERNAME/forza-racing`
4. Tags created: `backend-latest`, `frontend-latest`

**Check Build Status:**
- Go to GitHub repo → Actions tab
- See "Build and Push Docker Images" workflow
- Watch real-time build logs

### Step 3: Pull and Run on Raspberry Pi

```bash
# SSH into your Pi
ssh pi@YOUR_PI_IP

# Run setup script
cd ~
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/setup-pi.sh | bash
```

Done! App is running at `http://YOUR_PI_IP:3000`

## Manual Setup (Step by Step)

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Select scopes:
   - ✅ `write:packages` - Push images
   - ✅ `read:packages` - Pull images
   - ✅ `delete:packages` - Delete images (optional)
5. Copy the token (save it somewhere safe!)

### Step 2: Set Repository Secrets

For automated builds, GitHub needs to know your container registry credentials:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secret: `GITHUB_TOKEN` = your personal access token
   - **Note:** GitHub automatically provides `GITHUB_TOKEN` in Actions, so this is optional
   - Only needed if you want to use a different token

### Step 3: Verify GitHub Actions Workflow

The workflow file at `.github/workflows/build-and-push.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main
      - master

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - name: backend
            context: ./backend
          - name: frontend
            context: ./frontend
```

**What it does:**
- Triggers on every push to main
- Builds both backend and frontend
- Supports linux/amd64 and linux/arm64 architectures
- Pushes to GHCR with automatic tagging

### Step 4: Make First Commit to Trigger Build

```bash
cd ~/ForzaRacing
git add .
git commit -m "Add GitHub Actions Docker build workflow"
git push origin main
```

Watch the build in GitHub Actions tab.

## Image Tagging and Versioning

### Automatic Tags Generated

Each image gets multiple tags:

```
ghcr.io/YOUR_USERNAME/forza-racing:backend-latest      # Latest backend
ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest     # Latest frontend
ghcr.io/YOUR_USERNAME/forza-racing:backend-abc1234    # Commit SHA
ghcr.io/YOUR_USERNAME/forza-racing:main               # Branch name
```

### Semantic Versioning (Optional)

For tagged releases, add to `.github/workflows/build-and-push.yml`:

```yaml
tags: |
  type=ref,event=branch
  type=semver,pattern={{version}}
  type=semver,pattern={{major}}.{{minor}}
```

Then create git tags:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Building Locally

### Option 1: Docker Desktop

```bash
# Build for current platform
docker build -t forza-racing:backend-latest ./backend
docker build -t forza-racing:frontend-latest ./frontend

# Test
docker-compose up -d
```

### Option 2: Multi-Platform Build (Linux)

Requires: `docker buildx`

```bash
# Build for ARM64 and AMD64
bash build-images.sh

# Or manually
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag forza-racing:backend-latest \
  ./backend

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag forza-racing:frontend-latest \
  ./frontend
```

## Pushing Custom Images to GHCR

### Login to GHCR

```bash
docker login ghcr.io
# Username: YOUR_GITHUB_USERNAME
# Password: YOUR_PERSONAL_ACCESS_TOKEN
```

### Tag and Push

```bash
# Tag images
docker tag forza-racing:backend-latest ghcr.io/YOUR_USERNAME/forza-racing:backend-latest
docker tag forza-racing:frontend-latest ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest

# Push
docker push ghcr.io/YOUR_USERNAME/forza-racing:backend-latest
docker push ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest
```

### Or use buildx to build and push in one step

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --push \
  -t ghcr.io/YOUR_USERNAME/forza-racing:backend-latest \
  ./backend
```

## Pulling Images on Raspberry Pi

### From Public Repository

```bash
docker pull ghcr.io/YOUR_USERNAME/forza-racing:backend-latest
docker pull ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest
```

### From Private Repository

```bash
# Login first
docker login ghcr.io
# Username: YOUR_GITHUB_USERNAME
# Password: YOUR_PERSONAL_ACCESS_TOKEN

# Pull
docker pull ghcr.io/YOUR_USERNAME/forza-racing:backend-latest
```

## Docker Compose with GHCR Images

Update `docker-compose.pi.yml`:

```yaml
services:
  backend:
    image: ghcr.io/YOUR_USERNAME/forza-racing:backend-latest
    # ...

  frontend:
    image: ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest
    # ...
```

Then run:

```bash
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## Troubleshooting

### GitHub Actions Build Failed

Check the workflow logs:
1. Go to GitHub → Actions tab
2. Select failed workflow run
3. Click on job and review error output

**Common issues:**
- Missing files referenced in build
- Invalid Dockerfile syntax
- Build dependencies not installed

### Can't Pull Image from Pi

```bash
# Error: image not found
# Solution 1: Check image name is correct
docker pull ghcr.io/YOUR_USERNAME/forza-racing:backend-latest

# Solution 2: Login to GHCR
docker login ghcr.io

# Solution 3: Set image as public
# Go to GitHub repo → Packages → Select image → Change privacy to Public
```

### Multi-Platform Build Not Working

```bash
# Check if buildx is available
docker buildx version

# If missing:
docker run --privileged --rm tonistiigi/binfmt --install all

# Create builder
docker buildx create --use
```

### Dockerfile Build Error on ARM64

**Common fixes:**
- Use multi-stage builds (we do this)
- Use Alpine base images (we use `node:18-alpine`)
- Avoid binaries compiled only for x86

Our Dockerfiles are ARM64-compatible!

## Image Organization

### Public vs Private

**Public (recommended for sharing):**
1. Go to GitHub repo → Package settings
2. Select image package
3. Under Danger Zone: Change to Public
4. Anyone can pull: `docker pull ghcr.io/YOUR_USERNAME/forza-racing:...`

**Private:**
- Only accessible with authentication token
- Requires `docker login ghcr.io`

### Image Cleanup

Delete old images to save space:

```bash
# List images
docker image ls | grep forza-racing

# Delete image
docker rmi ghcr.io/YOUR_USERNAME/forza-racing:backend-old

# Or via GitHub UI: Packages → Select image → Delete
```

## Performance Tips

### Smaller Images
- Keep Dockerfiles simple
- Use multi-stage builds (we do)
- Use Alpine Linux (we do)
- Remove build artifacts

### Faster Builds
- GitHub Actions uses cache
- Commit changes frequently
- Avoid large files

### Faster Pulls on Pi
- Use `.dockerignore` to exclude unnecessary files
- Keep base images current
- Network connection affects pull speed

## Deployment Workflow

```
Developer makes changes
         ↓
   git push origin main
         ↓
GitHub Actions triggered
         ↓
Build images (amd64 + arm64)
         ↓
Push to GHCR
         ↓
Raspberry Pi pulls latest
         ↓
docker-compose restart
         ↓
App updated!
```

## Next Steps

1. ✅ Verify workflow in `.github/workflows/build-and-push.yml`
2. ✅ Make first commit to trigger build
3. ✅ Check GitHub Actions tab for build status
4. ✅ Once built, pull on Pi with `docker-compose pull`
5. ✅ Start app with `docker-compose -f docker-compose.pi.yml up -d`

## References

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Multi-Platform Builds](https://docs.docker.com/build/building/multi-platform/)
- [GitHub Actions Docker Build](https://github.com/docker/build-push-action)
- [Raspberry Pi Docker Guide](https://docs.docker.com/engine/install/raspberry-pi-os/)
