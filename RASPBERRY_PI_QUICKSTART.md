# Forza Racing League - Raspberry Pi Quick Start

Fastest way to get the app running on your Raspberry Pi:

## 1. One-Time Setup (5 minutes)

```bash
# SSH into your Pi
ssh pi@YOUR_PI_IP

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker pi

# Create project folder
mkdir -p ~/forza-racing && cd ~/forza-racing

# Download compose file
wget https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/ForzaRacing/main/docker-compose.pi.yml

# Create .env file
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
```

## 2. Start the App

```bash
cd ~/forza-racing
docker-compose -f docker-compose.pi.yml up -d

# Wait 30 seconds, then check status
sleep 30
docker-compose -f docker-compose.pi.yml ps
```

## 3. Access the App

Open browser: `http://YOUR_PI_IP:3000`

Login with your Authentik account and start recording races! 🏎️

## Common Commands

```bash
# See logs
docker-compose -f docker-compose.pi.yml logs -f

# Stop app
docker-compose -f docker-compose.pi.yml down

# Restart app
docker-compose -f docker-compose.pi.yml restart

# Update to latest version
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## Get Your Pi's IP Address

```bash
# Option 1: From Pi itself
hostname -I

# Option 2: From your laptop (if using SSH)
ping raspberrypi.local
```

## Need Help?

See [RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md) for detailed instructions.
