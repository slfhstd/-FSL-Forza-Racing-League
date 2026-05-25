import React, { useState, useEffect } from 'react';
import { leagueService, LeaderboardEntry, Player } from '../services/api';
import './Leaderboard.css';

interface Props {
  players: Player[];
  currentMonthOnly: boolean;
}

function Leaderboard({ players, currentMonthOnly }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadLeaderboard();
  }, [month, year, currentMonthOnly]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentMonthOnly) {
        const data = await leagueService.getLeaderboard(month, year);
        setLeaderboard(data?.leaderboard || []);
      } else {
        const data = await leagueService.getAllTimeStats();
        setLeaderboard(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to load leaderboard. Is the backend running?');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="leaderboard">
      <div className="card">
        <div className="leaderboard-header">
          <h2>{currentMonthOnly ? `${monthName} Leaderboard` : 'All-Time Stats'}</h2>
          {currentMonthOnly && (
            <div className="month-controls">
              <button onClick={handlePreviousMonth}>← Previous</button>
              <span>{monthName}</span>
              <button onClick={handleNextMonth}>Next →</button>
            </div>
          )}
        </div>

        {loading && <p className="loading">Loading leaderboard...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && leaderboard.length === 0 && (
          <p className="empty">No races recorded yet for this period</p>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Points</th>
                  <th>Wins</th>
                  <th>2nd</th>
                  <th>3rd</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.playerId}
                    className={
                      entry.rank === 1 ? 'rank-1' : entry.rank === 2 ? 'rank-2' : entry.rank === 3 ? 'rank-3' : ''
                    }
                  >
                    <td className="rank">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && entry.rank}
                    </td>
                    <td className="player-name">{entry.playerName}</td>
                    <td className="points">
                      <strong>{entry.totalPoints}</strong>
                    </td>
                    <td>{entry.wins}</td>
                    <td>{entry.secondPlace}</td>
                    <td>{entry.thirdPlace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="scoring-info">
            <p>
              <strong>Scoring:</strong> 1st place = 10 points • 2nd place = 5 points • 3rd place = 2 points
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
