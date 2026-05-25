#!/bin/bash

# Build multi-platform Docker images locally for testing
# This script requires docker buildx to be set up

set -e

echo "🐳 Building Forza Racing League Docker Images"
echo "=============================================="
echo ""

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker buildx is not installed or not available"
    echo ""
    echo "Install Docker buildx:"
    echo "  - If using Docker Desktop: Already included"
    echo "  - On Linux: docker run --privileged --rm tonistiigi/binfmt --install all"
    echo "  - See: https://docs.docker.com/build/architecture/"
    exit 1
fi

# Create buildx builder if needed
BUILDER_NAME="forza-racing-builder"
if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
    echo "Creating buildx builder: $BUILDER_NAME..."
    docker buildx create --name "$BUILDER_NAME" --use
    echo "✅ Builder created and set as default"
else
    echo "✅ Using existing builder: $BUILDER_NAME"
    docker buildx use "$BUILDER_NAME"
fi

# Get platforms to build
PLATFORMS="${1:-linux/amd64,linux/arm64}"
echo "Building for platforms: $PLATFORMS"
echo ""

# Build backend
echo "🔨 Building backend image..."
docker buildx build \
    --platform "$PLATFORMS" \
    --tag "forza-racing:backend-latest" \
    --tag "forza-racing:backend-$(date +%Y%m%d)" \
    ./backend \
    --progress=plain

echo "✅ Backend image built"
echo ""

# Build frontend
echo "🔨 Building frontend image..."
docker buildx build \
    --platform "$PLATFORMS" \
    --tag "forza-racing:frontend-latest" \
    --tag "forza-racing:frontend-$(date +%Y%m%d)" \
    ./frontend \
    --progress=plain

echo "✅ Frontend image built"
echo ""

echo "✅ All images built successfully!"
echo ""
echo "💡 Next steps:"
echo "   1. Test locally: docker-compose up"
echo "   2. Push to GitHub Container Registry:"
echo "      - docker buildx build --platform linux/amd64,linux/arm64 --push -t ghcr.io/YOUR_USERNAME/forza-racing:backend-latest ./backend"
echo "      - docker buildx build --platform linux/amd64,linux/arm64 --push -t ghcr.io/YOUR_USERNAME/forza-racing:frontend-latest ./frontend"
echo ""
echo "   Or use GitHub Actions: git push (auto-builds and pushes)"
echo ""
