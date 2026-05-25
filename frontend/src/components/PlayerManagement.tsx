import React, { useState } from 'react';
import { playerService, Player } from '../services/api';
import './PlayerManagement.css';

interface Props {
  players: Player[];
  onPlayerAdded: (player: Player) => void;
  onPlayerDeleted: (playerId: string) => void;
}

function PlayerManagement({ players, onPlayerAdded, onPlayerDeleted }: Props) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) {
      setError('Player name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const newPlayer = await playerService.create(newPlayerName);
      onPlayerAdded(newPlayer);
      setNewPlayerName('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to deactivate this player?')) {
      return;
    }

    try {
      await playerService.delete(playerId);
      onPlayerDeleted(playerId);
    } catch (err) {
      alert('Failed to delete player');
    }
  };

  return (
    <div className="player-management">
      <div className="card">
        <h2>Add New Player</h2>
        <form onSubmit={handleAddPlayer} className="add-player-form">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Player name"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Player'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Active Players ({players.length})</h2>
        <div className="players-list">
          {players.length === 0 ? (
            <p>No players yet. Add one to get started!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>{player.name}</td>
                    <td>{new Date(player.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeletePlayer(player.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerManagement;
