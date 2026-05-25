# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.node.json vite.config.ts ./
COPY src ./src
COPY index.html ./

RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install simple HTTP server to serve the static files
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
