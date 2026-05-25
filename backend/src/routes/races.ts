import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, run, get, all } from '../database';
import { Race, LeagueStanding } from '../models';

const router = express.Router();

const POINTS_FOR_PLACE = {
  1: 10,
  2: 5,
  3: 2,
};

// Record a new race
router.post('/', async (req, res) => {
  try {
    const { winnerId, secondPlaceId, thirdPlaceId, trackName, carClass } = req.body;
    if (!winnerId || !trackName) {
      return res.status(400).json({ error: 'winnerId and trackName are required' });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const id = uuidv4();

    // Insert race
    await run(
      `INSERT INTO races (id, winnerId, secondPlaceId, thirdPlaceId, month, year, trackName, carClass)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, winnerId, secondPlaceId || null, thirdPlaceId || null, month, year, trackName, carClass || null]
    );

    // Update league standings
    await updateLeagueStandings(winnerId, 1, 0, 0, month, year);
    if (secondPlaceId) {
      await updateLeagueStandings(secondPlaceId, 0, 1, 0, month, year);
    }
    if (thirdPlaceId) {
      await updateLeagueStandings(thirdPlaceId, 0, 0, 1, month, year);
    }

    const race = await get<Race>(
      'SELECT * FROM races WHERE id = ?',
      [id]
    );
    res.status(201).json(race);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record race' });
  }
});

// Get all races for a specific month
router.get('/month/:month/:year', async (req, res) => {
  try {
    const { month, year } = req.params;
    const races = await all<Race>(
      `SELECT * FROM races WHERE month = ? AND year = ? ORDER BY raceDate DESC`,
      [month, year]
    );
    res.json(races);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Get all races
router.get('/', async (req, res) => {
  try {
    const races = await all<Race>(
      'SELECT * FROM races ORDER BY raceDate DESC LIMIT 50'
    );
    res.json(races);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Delete a race
router.delete('/:id', async (req, res) => {
  try {
    const race = await get<Race>(
      'SELECT * FROM races WHERE id = ?',
      [req.params.id]
    );

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    // Revert league standings
    await revertLeagueStandings(race.winnerId, 1, 0, 0, race.month, race.year);
    if (race.secondPlaceId) {
      await revertLeagueStandings(race.secondPlaceId, 0, 1, 0, race.month, race.year);
    }
    if (race.thirdPlaceId) {
      await revertLeagueStandings(race.thirdPlaceId, 0, 0, 1, race.month, race.year);
    }

    await run('DELETE FROM races WHERE id = ?', [req.params.id]);
    res.json({ message: 'Race deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete race' });
  }
});

async function updateLeagueStandings(
  playerId: string,
  wins: number,
  secondPlace: number,
  thirdPlace: number,
  month: number,
  year: number
) {
  const standing = await get<LeagueStanding>(
    'SELECT * FROM league_standings WHERE playerId = ? AND month = ? AND year = ?',
    [playerId, month, year]
  );

  const totalPoints =
    wins * POINTS_FOR_PLACE[1] +
    secondPlace * POINTS_FOR_PLACE[2] +
    thirdPlace * POINTS_FOR_PLACE[3];

  if (standing) {
    const newWins = standing.wins + wins;
    const newSecondPlace = standing.secondPlace + secondPlace;
    const newThirdPlace = standing.thirdPlace + thirdPlace;
    const newTotalPoints =
      newWins * POINTS_FOR_PLACE[1] +
      newSecondPlace * POINTS_FOR_PLACE[2] +
      newThirdPlace * POINTS_FOR_PLACE[3];

    await run(
      `UPDATE league_standings 
       SET wins = ?, secondPlace = ?, thirdPlace = ?, totalPoints = ?, lastUpdated = CURRENT_TIMESTAMP
       WHERE playerId = ? AND month = ? AND year = ?`,
      [newWins, newSecondPlace, newThirdPlace, newTotalPoints, playerId, month, year]
    );
  } else {
    const id = uuidv4();
    await run(
      `INSERT INTO league_standings (id, playerId, month, year, wins, secondPlace, thirdPlace, totalPoints)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, playerId, month, year, wins, secondPlace, thirdPlace, totalPoints]
    );
  }
}

async function revertLeagueStandings(
  playerId: string,
  wins: number,
  secondPlace: number,
  thirdPlace: number,
  month: number,
  year: number
) {
  const standing = await get<LeagueStanding>(
    'SELECT * FROM league_standings WHERE playerId = ? AND month = ? AND year = ?',
    [playerId, month, year]
  );

  if (standing) {
    const newWins = Math.max(0, standing.wins - wins);
    const newSecondPlace = Math.max(0, standing.secondPlace - secondPlace);
    const newThirdPlace = Math.max(0, standing.thirdPlace - thirdPlace);
    const newTotalPoints =
      newWins * POINTS_FOR_PLACE[1] +
      newSecondPlace * POINTS_FOR_PLACE[2] +
      newThirdPlace * POINTS_FOR_PLACE[3];

    await run(
      `UPDATE league_standings 
       SET wins = ?, secondPlace = ?, thirdPlace = ?, totalPoints = ?, lastUpdated = CURRENT_TIMESTAMP
       WHERE playerId = ? AND month = ? AND year = ?`,
      [newWins, newSecondPlace, newThirdPlace, newTotalPoints, playerId, month, year]
    );
  }
}

export default router;
