import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/races.db';

// Ensure data directory exists
const dataDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(DATABASE_PATH);

export function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          lastLogin DATETIME
        )
      `);

      // Players table
      db.run(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          isActive BOOLEAN DEFAULT 1
        )
      `);

      // Races table
      db.run(`
        CREATE TABLE IF NOT EXISTS races (
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
      `);

      // League table
      db.run(`
        CREATE TABLE IF NOT EXISTS league_standings (
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
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

export function run(sql: string, params: any[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function all<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []) as T[]);
    });
  });
}
