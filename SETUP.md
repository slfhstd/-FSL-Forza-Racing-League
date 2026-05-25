# Forza Racing League - Complete Setup Guide

## 🚀 Quick Start with Docker (Recommended)

The easiest way to get started is with Docker Compose, which sets up both the backend and frontend automatically.

### With Authentication (OAuth2)

To enable login with Authentik:

1. **Configure OAuth**: See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed instructions
2. **Set Environment Variables**: Add OAuth credentials to `docker-compose.yml` or `.env` files
3. **Start Services**:

```bash
cd d:\Git\ Repos\Slfhstd\ForzaRacing
docker-compose up --build
```

### Without Authentication (Development Only)

For quick testing without OAuth setup, the API will still require authentication headers, but you can bypass by:
- Commenting out the `verifyToken` middleware in `backend/src/index.ts` (development only)
- Using curl or Postman with manual token headers

After the services start:
- **Frontend**: Open http://localhost:3000 in your browser
- **Backend API**: http://localhost:5000/api
- **Login**: Click "Login with Authentik" button to authenticate

To stop the services:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ (for local development)
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment** (already done, check `.env` file)
```bash
# .env should contain:
PORT=5000
DATABASE_PATH=./data/races.db
NODE_ENV=development
```

4. **Start development server**
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

5. **Build for production**
```bash
npm run build
```

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The frontend app will start on `http://localhost:3000` and automatically proxy API calls to `http://localhost:5000`

4. **Build for production**
```bash
npm run build
```

## 📁 Project Structure

```
ForzaRacing/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── database.ts           # SQLite setup and helpers
│   │   ├── models.ts             # TypeScript type definitions
│   │   ├── routes/
│   │   │   ├── players.ts        # Player CRUD endpoints
│   │   │   ├── races.ts          # Race recording and deletion
│   │   │   └── league.ts         # Leaderboard endpoints
│   │   └── middleware/           # Express middleware
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Main component with navigation
│   │   ├── components/
│   │   │   ├── Leaderboard.tsx   # Leaderboard display component
│   │   │   ├── RaceRecorder.tsx  # Race form component
│   │   │   └── PlayerManagement.tsx # Player management component
│   │   ├── services/
│   │   │   └── api.ts            # Axios API client
│   │   ├── index.css             # Global styles
│   │   └── *.css                 # Component-specific styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── tsconfig.json
├── docker-compose.yml            # Multi-container orchestration
├── .gitignore
├── README.md
└── SETUP.md                      # This file
```

## 🗄️ Database

The application uses SQLite for data persistence. The database is automatically initialized on first run.

### Database File Location
- **Docker**: `/app/data/races.db` (persisted via volume mount)
- **Local**: `./data/races.db`

### Database Schema

**Players Table**
```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT 1
)
```

**Races Table**
```sql
CREATE TABLE races (
  id TEXT PRIMARY KEY,
  winnerId TEXT NOT NULL,
  secondPlaceId TEXT,
  thirdPlaceId TEXT,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  trackName TEXT NOT NULL,
  carClass TEXT,
  raceDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(winnerId) REFERENCES players(id),
  FOREIGN KEY(secondPlaceId) REFERENCES players(id),
  FOREIGN KEY(thirdPlaceId) REFERENCES players(id)
)
```

**League Standings Table**
```sql
CREATE TABLE league_standings (
  id TEXT PRIMARY KEY,
  playerId TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  wins INTEGER DEFAULT 0,
  secondPlace INTEGER DEFAULT 0,
  thirdPlace INTEGER DEFAULT 0,
  totalPoints INTEGER DEFAULT 0,
  lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(playerId) REFERENCES players(id),
  UNIQUE(playerId, month, year)
)
```

## 🔌 API Endpoints

### Players API (`/api/players`)
- `GET /` - Get all active players
- `POST /` - Create new player (`{ name: string }`)
- `GET /:id` - Get player by ID
- `DELETE /:id` - Deactivate player

### Races API (`/api/races`)
- `POST /` - Record new race
  ```json
  {
    "winnerId": "uuid",
    "secondPlaceId": "uuid (optional)",
    "thirdPlaceId": "uuid (optional)",
    "trackName": "string",
    "carClass": "S2|S1|A|B|C|D (optional)"
  }
  ```
- `GET /` - Get recent races (last 50)
- `GET /month/:month/:year` - Get races for specific month
- `DELETE /:id` - Delete race record

### League API (`/api/league`)
- `GET /leaderboard` - Get current month leaderboard
  - Query params: `month` (optional), `year` (optional)
- `GET /stats/alltime` - Get all-time statistics
- `GET /stats/player/:playerId` - Get player's season statistics

## 🏆 Points System

The league uses a simple points system:
- 🥇 1st place: **10 points**
- 🥈 2nd place: **5 points**
- 🥉 3rd place: **2 points**

## 🐳 Docker Deployment

### Building Docker Images

Build backend:
```bash
docker build -t forza-racing-backend ./backend
```

Build frontend:
```bash
docker build -t forza-racing-frontend ./frontend
```

### Running with Docker Compose

The `docker-compose.yml` file handles both services:

```yaml
services:
  backend:
    build: ./backend
    ports: ["5000:5000"]
    volumes: ["./data:/app/data"]
    
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
```

Start everything:
```bash
docker-compose up --build
```

Start in background:
```bash
docker-compose up -d --build
```

View logs:
```bash
docker-compose logs -f
```

Stop services:
```bash
docker-compose stop
```

Remove stopped containers:
```bash
docker-compose rm
```

## 📊 Usage Workflow

### 1. Add Players
- Go to "Manage Players" tab
- Enter player names and click "Add Player"
- Players appear in the list

### 2. Record Races
- Go to "Record Race" tab
- Select winner, 2nd place, 3rd place (optional)
- Enter track name and car class (optional)
- Click "Record Race"

### 3. View Leaderboard
- Go to "Current Month" tab
- View this month's standings
- Navigate between months with Previous/Next buttons

### 4. Check All-Time Stats
- Go to "All-Time Stats" tab
- View cumulative performance across all months

## 🔄 Environment Variables

### Backend
Create or modify `backend/.env`:
```env
PORT=5000                          # Server port
DATABASE_PATH=./data/races.db     # SQLite database path
NODE_ENV=development|production   # Environment mode
```

### Frontend
Vite automatically reads environment variables. For API URL configuration, the app proxies requests through the dev server.

## 🧪 Development Tips

### Hot Reload
- **Backend**: Uses `ts-node` for TypeScript hot reload in dev mode
- **Frontend**: Vite provides instant hot module reload (HMR)

### Testing the API
Use any REST client (Postman, cURL, VS Code REST Client extension):

```bash
# Create a player
curl -X POST http://localhost:5000/api/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Player Name"}'

# Get all players
curl http://localhost:5000/api/players

# Record a race
curl -X POST http://localhost:5000/api/races \
  -H "Content-Type: application/json" \
  -d '{
    "winnerId": "player-uuid",
    "trackName": "Edinburgh Circuit",
    "carClass": "S2"
  }'

# Get leaderboard
curl http://localhost:5000/api/league/leaderboard
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :5000
kill -9 <PID>
```

Or change ports in `.env` and `vite.config.ts`

### Database Issues
If you encounter database errors:
```bash
# Remove old database
rm -rf data/

# Restart application (it will recreate the database)
```

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

## 📝 Building for Production

### Backend
```bash
cd backend
npm run build
npm start  # runs dist/index.js
```

### Frontend
```bash
cd frontend
npm run build
# dist/ folder contains static files ready to serve
```

### Docker Production Build
```bash
docker-compose -f docker-compose.yml up -d
```

The containerized versions already include production optimizations.

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

Feel free to modify and extend the application:
- Add authentication
- Implement multi-league support
- Add player statistics views
- Create export functionality
- Build mobile app companion

## 📄 License

MIT License - Feel free to use this project for personal and commercial use.
