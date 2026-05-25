import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { run, get } from '../database';
import { User } from '../models';
import { generateToken, verifyToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get OAuth config from environment
const OAUTH_ISSUER_URL = process.env.OAUTH_ISSUER_URL;
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;

// Get current user
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// OAuth2 callback endpoint
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!OAUTH_ISSUER_URL || !OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
      return res.status(500).json({ error: 'OAuth configuration missing' });
    }

    // Exchange code for token
    const tokenResponse = await axios.post(
      `${OAUTH_ISSUER_URL}token/`,
      {
        grant_type: 'authorization_code',
        code,
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        redirect_uri: OAUTH_REDIRECT_URI,
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user info from OIDC userinfo endpoint
    const userInfoResponse = await axios.get(`${OAUTH_ISSUER_URL}userinfo/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { sub, email, name, preferred_username } = userInfoResponse.data;

    // Check if user exists, if not create them
    let user = await get<User>('SELECT * FROM users WHERE id = ?', [sub]);

    if (!user) {
      const userId = uuidv4();
      await run(
        'INSERT INTO users (id, email, name, lastLogin) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [sub, email, name || preferred_username || email]
      );
      user = await get<User>('SELECT * FROM users WHERE id = ?', [sub]);
    } else {
      // Update last login
      await run('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [sub]);
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to create/fetch user' });
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id, user.email, user.name);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err: any) {
    console.error('OAuth callback error:', err.message);
    res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const authReq: AuthRequest = {
      headers: { authorization: `Bearer ${token}` },
    } as any;

    verifyToken(authReq, res, () => {
      res.json({
        valid: true,
        user: authReq.user,
      });
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint (client-side, just removes token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
