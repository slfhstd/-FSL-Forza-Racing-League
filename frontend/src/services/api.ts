import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
});

export interface Player {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
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

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  wins: number;
  secondPlace: number;
  thirdPlace: number;
  totalPoints: number;
  rank: number;
}

export const playerService = {
  getAll: async () => api.get<Player[]>('/players').then(r => r.data),
  create: async (name: string) => api.post<Player>('/players', { name }).then(r => r.data),
  delete: async (id: string) => api.delete(`/players/${id}`),
};

export const raceService = {
  recordRace: async (data: {
    winnerId: string;
    secondPlaceId?: string;
    thirdPlaceId?: string;
    trackName: string;
    carClass?: string;
  }) => api.post<Race>('/races', data).then(r => r.data),
  getMonthRaces: async (month: number, year: number) =>
    api.get<Race[]>(`/races/month/${month}/${year}`).then(r => r.data),
  deleteRace: async (id: string) => api.delete(`/races/${id}`),
};

export const leagueService = {
  getLeaderboard: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    return api.get<{
      month: number;
      year: number;
      leaderboard: LeaderboardEntry[];
    }>('/league/leaderboard', { params }).then(r => r.data);
  },
  getAllTimeStats: async () =>
    api.get<LeaderboardEntry[]>('/league/stats/alltime').then(r => r.data),
  getPlayerStats: async (playerId: string) =>
    api.get(`/league/stats/player/${playerId}`).then(r => r.data),
};
