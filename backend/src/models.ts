export interface Player {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Race {
  id: string;
  winnerId: string;
  secondPlaceId?: string;
  thirdPlaceId?: string;
  month: number;
  year: number;
  trackName: string;
  carClass?: string;
  raceDate: string;
}

export interface LeagueStanding {
  id: string;
  playerId: string;
  month: number;
  year: number;
  wins: number;
  secondPlace: number;
  thirdPlace: number;
  totalPoints: number;
  lastUpdated: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  wins: number;
  secondPlace: number;
  thirdPlace: number;
  totalPoints: number;
  rank: number;
}
