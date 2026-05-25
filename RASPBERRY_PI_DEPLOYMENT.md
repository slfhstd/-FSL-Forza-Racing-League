# Raspberry Pi Deployment Guide

## Overview

This guide explains how to deploy the Forza Racing League app to a Raspberry Pi using pre-built Docker images from GitHub Container Registry (GHCR).

## Prerequisites

- Raspberry Pi 4 or later (with 2GB+ RAM recommended)
- Raspberry Pi OS (Lite or Desktop) - latest version
- Internet connection for downloading images
- Docker and Docker Compose installed on Pi
- GitHub personal access token (for private images)

## Step 1: Prepare Your Raspberry Pi

### Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### Install Docker Compose
```bash
sudo apt-get install -y docker-compose
# Or for newer versions:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Verify Installation
```bash
docker --version
docker-compose --version
```

## Step 2: Set Up Project Directory

```bash
# Create project directory
mkdir ~/forza-racing
cd ~/forza-racing

# Download docker-compose.pi.yml
wget https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/ForzaRacing/main/docker-compose.pi.yml

# Create data directory for database persistence
mkdir -p data

# Create .env file (see Step 3)
touch .env
```

## Step 3: Configure Environment Variables

Create `.env` file in `~/forza-racing/`:

```env
# OAuth2/OIDC Configuration
OAUTH_ISSUER_URL=https://auth.example.com/application/o/
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=http://YOUR_PI_IP:3000/auth/callback

# Frontend OAuth Variables
VITE_OAUTH_ISSUER_URL=https://auth.example.com/application/o/
VITE_OAUTH_CLIENT_ID=your-client-id
VITE_OAUTH_REDIRECT_URI=http://YOUR_PI_IP:3000/auth/callback

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secure-random-secret

# Docker Registry (optional - only if using private images)
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=your-personal-access-token
```

### Get Your Pi's IP Address
```bash
hostname -I
```

Update `OAUTH_REDIRECT_URI` and `VITE_OAUTH_REDIRECT_URI` with your Pi's IP address.

## Step 4: Configure docker-compose.pi.yml

Edit `docker-compose.pi.yml` and replace:
- `YOUR_GITHUB_USERNAME` with your actual GitHub username
- Update image tags if necessary

Example:
```yaml
services:
  backend:
    image: ghcr.io/slfhstd/forza-racing/backend-latest:latest
  frontend:
    image: ghcr.io/slfhstd/forza-racing/frontend-latest:latest
```

## Step 5: Pull and Run Docker Images

### Login to GitHub Container Registry (if private images)
```bash
docker login ghcr.io
# Username: your-github-username
# Password: your-personal-access-token
```

### Pull Latest Images
```bash
docker-compose -f docker-compose.pi.yml pull
```

### Start Services
```bash
# Start in foreground to see logs
docker-compose -f docker-compose.pi.yml up

# Or start in background
docker-compose -f docker-compose.pi.yml up -d
```

### Verify Services
```bash
docker-compose -f docker-compose.pi.yml ps

# Check logs
docker-compose -f docker-compose.pi.yml logs -f frontend
docker-compose -f docker-compose.pi.yml logs -f backend
```

## Step 6: Access Your App

Open a browser and navigate to:
```
http://YOUR_PI_IP:3000
```

You should see the login page. Click "Login with Authentik" to authenticate.

## Step 7: Enable Auto-Start (Optional)

Make Docker services start automatically after reboot:

```bash
# Add to crontab
sudo crontab -e

# Add this line at the end:
@reboot sleep 30 && cd /home/pi/forza-racing && docker-compose -f docker-compose.pi.yml up -d
```

## Updating Images on Your Pi

When new versions are pushed to GitHub:

```bash
cd ~/forza-racing

# Pull latest images
docker-compose -f docker-compose.pi.yml pull

# Restart services
docker-compose -f docker-compose.pi.yml up -d

# Check status
docker-compose -f docker-compose.pi.yml ps
```

## Performance Optimization for Raspberry Pi

### Limit Memory/CPU Usage
Edit `docker-compose.pi.yml` to add resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.75'

  frontend:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
```

### Enable Swap (for Pi with low RAM)
```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Change: CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.pi.yml logs backend
docker-compose -f docker-compose.pi.yml logs frontend

# Restart services
docker-compose -f docker-compose.pi.yml restart
```

### Out of memory errors
- Reduce services or add swap space
- Upgrade to Pi with more RAM
- Check resource usage: `docker stats`

### Database file permissions error
```bash
# Fix permissions
sudo chown -R pi:pi ~/forza-racing/data
sudo chmod -R 755 ~/forza-racing/data
```

### Can't reach app from other devices
- Check Pi firewall: `sudo ufw status`
- Allow port 3000: `sudo ufw allow 3000`
- Verify network connectivity: `ping YOUR_PI_IP`

### OAuth redirect not working
- Verify Pi's IP address: `hostname -I`
- Update `.env` with correct IP
- Ensure Authentik can reach your Pi's IP from client device
- For external access, use ngrok or VPN

## Network Access

### Local Network Only
```
http://RASPBERRY_PI_IP:3000
```

### External Access (VPN/Tunnel)
For accessing outside your home network:

```bash
# Option 1: SSH Tunnel
ssh -L 3000:localhost:3000 pi@YOUR_PI_IP
# Access at http://localhost:3000

# Option 2: ngrok (temporary public URL)
sudo npm install -g ngrok
ngrok http 3000
```

## Database Backup

Database is stored in `~/forza-racing/data/races.db`:

```bash
# Backup
cp ~/forza-racing/data/races.db ~/races.db.backup

# Restore
cp ~/races.db.backup ~/forza-racing/data/races.db
docker-compose -f docker-compose.pi.yml restart backend
```

## System Monitoring

Monitor your Pi's performance:

```bash
# CPU/Memory usage
docker stats

# Disk usage
df -h

# Container stats over time
watch docker stats

# System temperature
vcgencmd measure_temp
```

## GitHub Actions Build Process

The app automatically builds and pushes images to GHCR when you push to main/master:

1. **Trigger**: Push code to GitHub
2. **Build**: GitHub Actions builds for ARM64 and amd64
3. **Push**: Images pushed to `ghcr.io/YOUR_USERNAME/forza-racing`
4. **Pull**: Your Pi pulls the latest images

### Rebuild Manually
- Go to GitHub repo → Actions tab
- Select "Build and Push Docker Images"
- Click "Run workflow"

## Supported Platforms

Built images support:
- ✅ Raspberry Pi 4 (ARM64)
- ✅ Raspberry Pi 5 (ARM64)
- ✅ Linux PCs (amd64)
- ✅ Macs with Docker (amd64/arm64)
- ✅ Cloud servers (amd64)

## Next Steps

1. ✅ Prepare Raspberry Pi with Docker
2. ✅ Configure environment variables
3. ✅ Pull and run images
4. ✅ Test login and race recording
5. ✅ Set up auto-start (optional)
6. ✅ Monitor performance

For questions about GitHub Container Registry:
- [GHCR Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

For Raspberry Pi Docker questions:
- [Official Docker Installation for Pi](https://docs.docker.com/engine/install/raspberry-pi-os/)
