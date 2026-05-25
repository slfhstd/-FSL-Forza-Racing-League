import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { verifyToken } from './middleware/auth';
import authRouter from './routes/auth';
import playersRouter from './routes/players';
import racesRouter from './routes/races';
import leagueRouter from './routes/league';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRouter);

// Public leaderboard access
app.use('/api/league', leagueRouter);

// Protected routes (require authentication)
app.use('/api/players', verifyToken, playersRouter);
app.use('/api/races', verifyToken, racesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
