import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, run, get, all } from '../database';
import { Player } from '../models';

const router = express.Router();

// Get all active players
router.get('/', async (req, res) => {
  try {
    const players = await all<Player>(
      'SELECT * FROM players WHERE isActive = 1 ORDER BY name'
    );
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Create a new player
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const id = uuidv4();
    await run(
      'INSERT INTO players (id, name) VALUES (?, ?)',
      [id, name]
    );

    const player = await get<Player>(
      'SELECT * FROM players WHERE id = ?',
      [id]
    );
    res.status(201).json(player);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await get<Player>(
      'SELECT * FROM players WHERE id = ? AND isActive = 1',
      [req.params.id]
    );
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// Deactivate a player
router.delete('/:id', async (req, res) => {
  try {
    await run(
      'UPDATE players SET isActive = 0 WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Player deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate player' });
  }
});

export default router;
