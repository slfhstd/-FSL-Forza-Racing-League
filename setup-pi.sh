#!/bin/bash

# Forza Racing League - Raspberry Pi Setup Script
# This script automates the setup process on a Raspberry Pi

set -e

echo "🏁 Forza Racing League - Raspberry Pi Setup"
echo "==========================================="
echo ""

# Check if running on Pi
if ! grep -q "Raspberry" /proc/cpuinfo 2>/dev/null; then
    read -p "This doesn't appear to be a Raspberry Pi. Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed"
    echo "⚠️  You may need to log out and back in for group changes to take effect"
else
    echo "✅ Docker already installed: $(docker --version)"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed: $(docker-compose --version)"
else
    echo "✅ Docker Compose already installed: $(docker-compose --version)"
fi

# Create project directory
PROJECT_DIR="$HOME/forza-racing"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📁 Creating project directory: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
else
    echo "📁 Project directory already exists: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Download docker-compose.pi.yml
echo "📥 Downloading docker-compose.pi.yml..."
GITHUB_USERNAME=${1:-"YOUR_GITHUB_USERNAME"}
REPO_URL="https://raw.githubusercontent.com/${GITHUB_USERNAME}/ForzaRacing/main"

if curl -sf "$REPO_URL/docker-compose.pi.yml" > docker-compose.pi.yml; then
    echo "✅ docker-compose.pi.yml downloaded"
else
    echo "❌ Failed to download docker-compose.pi.yml"
    echo "   Make sure to replace YOUR_GITHUB_USERNAME in the URL"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "🔐 Creating .env configuration file"
    echo "===================================="
    echo ""
    
    # Get Pi IP
    PI_IP=$(hostname -I | awk '{print $1}')
    echo "Detected Pi IP: $PI_IP"
    echo ""
    
    # Get OAuth details
    read -p "Enter your Authentik OAUTH_ISSUER_URL (e.g., https://auth.example.com/application/o/): " OAUTH_ISSUER_URL
    read -p "Enter your OAUTH_CLIENT_ID: " OAUTH_CLIENT_ID
    read -sp "Enter your OAUTH_CLIENT_SECRET: " OAUTH_CLIENT_SECRET
    echo ""
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Create .env file
    cat > .env << EOF
# OAuth2/OIDC Configuration
OAUTH_ISSUER_URL=$OAUTH_ISSUER_URL
OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID
OAUTH_CLIENT_SECRET=$OAUTH_CLIENT_SECRET
OAUTH_REDIRECT_URI=http://$PI_IP:3000/auth/callback

# Frontend OAuth Variables
VITE_OAUTH_ISSUER_URL=$OAUTH_ISSUER_URL
VITE_OAUTH_CLIENT_ID=$OAUTH_CLIENT_ID
VITE_OAUTH_REDIRECT_URI=http://$PI_IP:3000/auth/callback

# JWT Secret
JWT_SECRET=$JWT_SECRET
EOF
    
    echo "✅ .env file created with configuration"
    echo ""
else
    echo "⚠️  .env file already exists, skipping creation"
fi

# Create data directory
if [ ! -d "data" ]; then
    echo "📁 Creating data directory for database..."
    mkdir -p data
    echo "✅ Data directory created"
else
    echo "✅ Data directory already exists"
fi

# Login to GitHub Container Registry (optional)
echo ""
read -p "Do you want to login to GitHub Container Registry? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker login ghcr.io
    echo "✅ GitHub Container Registry login successful"
fi

# Pull images
echo ""
echo "📥 Pulling Docker images (this may take several minutes)..."
docker-compose -f docker-compose.pi.yml pull

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file if needed: nano $PROJECT_DIR/.env"
echo "   2. Start the app: cd $PROJECT_DIR && docker-compose -f docker-compose.pi.yml up -d"
echo "   3. Wait 30 seconds for services to start"
echo "   4. Open browser: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "💡 Useful commands:"
echo "   docker-compose -f docker-compose.pi.yml logs -f          # View logs"
echo "   docker-compose -f docker-compose.pi.yml ps               # Check status"
echo "   docker-compose -f docker-compose.pi.yml down             # Stop app"
echo "   docker-compose -f docker-compose.pi.yml restart          # Restart"
echo ""
echo "For more info, see: RASPBERRY_PI_DEPLOYMENT.md"
echo ""
