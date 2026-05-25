import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    req.userId = decoded.sub || decoded.userId;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

export function generateToken(userId: string, email: string, name: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(
    {
      sub: userId,
      userId,
      email,
      name,
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    { expiresIn: '7d' }
  );
}
