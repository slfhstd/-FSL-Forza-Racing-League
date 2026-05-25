import express from 'express';
import { all, get } from '../database';
import { LeagueStanding, LeaderboardEntry } from '../models';

const router = express.Router();

// Get current month leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string) : now.getFullYear();

    const standings = await all<any>(
      `SELECT 
        ls.playerId,
        p.name as playerName,
        ls.wins,
        ls.secondPlace,
        ls.thirdPlace,
        ls.totalPoints
       FROM league_standings ls
       JOIN players p ON ls.playerId = p.id
       WHERE ls.month = ? AND ls.year = ? AND p.isActive = 1
       ORDER BY ls.totalPoints DESC, ls.wins DESC`,
      [month, year]
    );

    const leaderboard: LeaderboardEntry[] = standings.map((s, index) => ({
      playerId: s.playerId,
      playerName: s.playerName,
      wins: s.wins,
      secondPlace: s.secondPlace,
      thirdPlace: s.thirdPlace,
      totalPoints: s.totalPoints,
      rank: index + 1,
    }));

    res.json({
      month,
      year,
      leaderboard,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get all-time stats
router.get('/stats/alltime', async (req, res) => {
  try {
    const stats = await all<any>(
      `SELECT 
        p.id as playerId,
        p.name as playerName,
        SUM(ls.wins) as totalWins,
        SUM(ls.secondPlace) as totalSecondPlace,
        SUM(ls.thirdPlace) as totalThirdPlace,
        SUM(ls.totalPoints) as totalPoints
       FROM players p
       LEFT JOIN league_standings ls ON p.id = ls.playerId
       WHERE p.isActive = 1
       GROUP BY p.id, p.name
       ORDER BY totalPoints DESC, totalWins DESC`,
      []
    );

    const leaderboard: LeaderboardEntry[] = stats.map((s, index) => ({
      playerId: s.playerId,
      playerName: s.playerName,
      wins: s.totalWins || 0,
      secondPlace: s.totalSecondPlace || 0,
      thirdPlace: s.totalThirdPlace || 0,
      totalPoints: s.totalPoints || 0,
      rank: index + 1,
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all-time stats' });
  }
});

// Get player season stats
router.get('/stats/player/:playerId', async (req, res) => {
  try {
    const stats = await all<any>(
      `SELECT 
        month,
        year,
        wins,
        secondPlace,
        thirdPlace,
        totalPoints
       FROM league_standings
       WHERE playerId = ?
       ORDER BY year DESC, month DESC`,
      [req.params.playerId]
    );

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

export default router;
