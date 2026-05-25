# 🏁 Forza Racing League - Race Tracking App

A web application for tracking Forza Horizon 6 races and managing a monthly league with leaderboards and scoring.

## Features

- **Race Tracking**: Record race results with winner, 2nd and 3rd place finishers
- **Player Management**: Add and manage players in the league
- **Monthly Leaderboard**: View current month standings and season points
- **All-Time Stats**: Track cumulative statistics across all months
- **Points System**: 
  - 1st place: 10 points
  - 2nd place: 5 points
  - 3rd place: 2 points
- **Responsive UI**: Mobile-friendly interface with modern design
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start both frontend and backend
docker-compose up --build

# Frontend will be available at: http://localhost:3000
# Backend API at: http://localhost:5000
```

### Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App runs on http://localhost:3000
```

## Project Structure

```
ForzaRacing/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server entry point
│   │   ├── database.ts           # Database initialization and helpers
│   │   ├── models.ts             # TypeScript interfaces
│   │   ├── routes/
│   │   │   ├── players.ts        # Player management API
│   │   │   ├── races.ts          # Race recording API
│   │   │   └── league.ts         # Leaderboard API
│   │   └── middleware/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Main app component
│   │   ├── components/
│   │   │   ├── Leaderboard.tsx   # Leaderboard display
│   │   │   ├── RaceRecorder.tsx  # Race recording form
│   │   │   └── PlayerManagement.tsx # Player management
│   │   ├── services/
│   │   │   └── api.ts            # API client
│   │   └── styles/
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Players
- `GET /api/players` - Get all active players
- `POST /api/players` - Create a new player
- `GET /api/players/:id` - Get player by ID
- `DELETE /api/players/:id` - Deactivate a player

### Races
- `POST /api/races` - Record a new race
- `GET /api/races` - Get recent races
- `GET /api/races/month/:month/:year` - Get races for a specific month
- `DELETE /api/races/:id` - Delete a race record

### League
- `GET /api/league/leaderboard` - Get current month leaderboard
- `GET /api/league/stats/alltime` - Get all-time statistics
- `GET /api/league/stats/player/:playerId` - Get player's season statistics

## How to Use

1. **Add Players**: Go to "Manage Players" tab and add all league participants
2. **Record Races**: After each race, go to "Record Race" and enter the results
3. **View Standings**: Check "Current Month" for this month's leaderboard
4. **Track Stats**: View "All-Time Stats" to see cumulative performance

## Technology Stack

### Backend
- Node.js + Express
- TypeScript
- SQLite3 (file-based database)
- CORS enabled for cross-origin requests

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- Axios (HTTP client)
- CSS3 (custom styling)

### Deployment
- Docker
- Docker Compose

## Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_PATH=./data/races.db
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

### players
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, UNIQUE)
- `createdAt` (DATETIME)
- `isActive` (BOOLEAN)

### races
- `id` (TEXT, PRIMARY KEY)
- `winnerId` (TEXT, FOREIGN KEY)
- `secondPlaceId` (TEXT, FOREIGN KEY)
- `thirdPlaceId` (TEXT, FOREIGN KEY)
- `month` (INTEGER)
- `year` (INTEGER)
- `trackName` (TEXT)
- `carClass` (TEXT)
- `raceDate` (DATETIME)

### league_standings
- `id` (TEXT, PRIMARY KEY)
- `playerId` (TEXT, FOREIGN KEY)
- `month` (INTEGER)
- `year` (INTEGER)
- `wins` (INTEGER)
- `secondPlace` (INTEGER)
- `thirdPlace` (INTEGER)
- `totalPoints` (INTEGER)
- `lastUpdated` (DATETIME)

## Development

### Build Backend
```bash
cd backend
npm run build
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Run Tests
```bash
# Add tests as needed
```

## Deployment

### Quick Deployment Guide
- **[SETUP.md](./SETUP.md)** - Docker Compose setup and configuration
- **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** - OAuth2/OIDC authentication with Authentik
- **[OAUTH_INTEGRATION.md](./OAUTH_INTEGRATION.md)** - Authentication integration details

### Raspberry Pi Deployment
Deploy the app to a Raspberry Pi using GitHub Container Registry:
- **[RASPBERRY_PI_QUICKSTART.md](./RASPBERRY_PI_QUICKSTART.md)** - 5-minute quick start
- **[RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md)** - Detailed setup and troubleshooting
- **[GITHUB_CONTAINER_REGISTRY.md](./GITHUB_CONTAINER_REGISTRY.md)** - Building and hosting images

**Quick Pi Setup:**
```bash
# SSH into your Raspberry Pi
ssh pi@YOUR_PI_IP

# Run automated setup
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/ForzaRacing/main/setup-pi.sh | bash

# Start the app
cd ~/forza-racing
docker-compose -f docker-compose.pi.yml up -d
```

### Docker Deployment
1. Ensure Docker and Docker Compose are installed
2. Navigate to project root
3. Run `docker-compose up -d` to start services in background
4. Access frontend at `http://your-host:3000`
5. API accessible at `http://your-host:5000/api`

### Persistent Data
- Race data is stored in the `./data` directory
- This directory is mounted as a volume in Docker Compose
- Back up the `races.db` file to preserve data
- On Raspberry Pi: Located at `~/forza-racing/data/races.db`

## Future Enhancements

- ✅ User authentication (OAuth2/OIDC with Authentik)
- ✅ Multi-platform Docker images (amd64, ARM64)
- ✅ Raspberry Pi deployment support
- Multi-league support
- Season management
- Race history with details
- Player statistics and analytics
- Export leaderboard to CSV/PDF
- Real-time notifications
- Mobile app version
- Race replay upload/sharing

## License

MIT

## Support

For issues or feature requests, please open an issue in the repository.
