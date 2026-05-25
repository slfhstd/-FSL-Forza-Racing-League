# 🏁 Forza Racing League - Quick Reference

## 🚀 Start the Application

### Option 1: Docker (Easiest - Recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2: Local Development
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm install && npm run dev
```

## 📱 Using the App

1. **Add Players**: Manage Players tab → enter names
2. **Record Races**: Record Race tab → select results
3. **View Results**: Current Month tab → see leaderboard
4. **Check Stats**: All-Time Stats tab → view cumulative performance

## 💾 Points System

- 1st Place: 10 points 🥇
- 2nd Place: 5 points 🥈
- 3rd Place: 2 points 🥉

## 🔌 Key API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/players` | List all active players |
| POST | `/api/players` | Add new player |
| POST | `/api/races` | Record race result |
| GET | `/api/league/leaderboard` | Get current leaderboard |
| GET | `/api/league/stats/alltime` | Get all-time stats |

## 📂 Important Files

- **Backend Entry**: `backend/src/index.ts`
- **Frontend Entry**: `frontend/src/main.tsx`
- **Database**: `data/races.db`
- **Docker Setup**: `docker-compose.yml`
- **Full Docs**: `SETUP.md`

## 🛑 Stop the Application

```bash
# If using Docker
docker-compose down

# If running locally
# Just close the terminal windows
```

## 📊 Database Backup

Important race data is stored in `data/races.db`. Back this up regularly:

```bash
# Copy the database file somewhere safe
cp data/races.db data/races.db.backup
```

## 🎯 Features Implemented

✅ Player Management (Create, List, Deactivate)
✅ Race Recording (1st, 2nd, 3rd place)
✅ Monthly Leaderboards
✅ All-Time Statistics
✅ Points System (10-5-2)
✅ Responsive UI
✅ Docker Support
✅ SQLite Database
✅ TypeScript (Frontend & Backend)
✅ Modern UI with Styling

## 🔧 Tech Stack

**Frontend**: React + Vite + TypeScript + CSS3
**Backend**: Express + TypeScript + SQLite3
**Deployment**: Docker + Docker Compose

## 📞 Support

See `README.md` for detailed documentation
See `SETUP.md` for comprehensive setup guide
