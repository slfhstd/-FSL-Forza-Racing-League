# Forza Racing League - Copilot Instructions

This is a full-stack web application for tracking Forza Horizon 6 races with a monthly league system.

## Project Structure

- `/backend` - Node.js/Express server with TypeScript
- `/frontend` - React app with Vite and TypeScript
- `/docker-compose.yml` - Docker Compose configuration for local development
- `Dockerfile` files in backend and frontend directories for containerization

## Setup Instructions

### Docker (Recommended)
```bash
docker-compose up --build
```

### Local Development
1. Backend: `cd backend && npm install && npm run dev`
2. Frontend: `cd frontend && npm install && npm run dev`

## Key Technologies
- Backend: Express, TypeScript, SQLite3
- Frontend: React, Vite, TypeScript, Axios
- Database: SQLite with file-based storage

## Features
- Record race results (1st, 2nd, 3rd place)
- Manage players
- Monthly leaderboards with points system
- All-time statistics
- Responsive UI with modern styling

## Database
Automatically initialized on first run. SQLite database stored in `./data/races.db`

## Points System
- 1st place: 10 points
- 2nd place: 5 points  
- 3rd place: 2 points
