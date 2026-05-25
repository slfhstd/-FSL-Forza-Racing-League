import React, { useState } from 'react';
import { raceService, Player } from '../services/api';
import './RaceRecorder.css';

interface Props {
  players: Player[];
  onRaceRecorded: () => void;
}

function RaceRecorder({ players, onRaceRecorded }: Props) {
  const [winnerId, setWinnerId] = useState('');
  const [secondPlaceId, setSecondPlaceId] = useState('');
  const [thirdPlaceId, setThirdPlaceId] = useState('');
  const [trackName, setTrackName] = useState('');
  const [carClass, setCarClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRecordRace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!winnerId || !trackName) {
      setError('Winner and track name are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await raceService.recordRace({
        winnerId,
        secondPlaceId: secondPlaceId || undefined,
        thirdPlaceId: thirdPlaceId || undefined,
        trackName,
        carClass: carClass || undefined,
      });
      
      if (result) {
        setSuccess('Race recorded successfully!');
        setWinnerId('');
        setSecondPlaceId('');
        setThirdPlaceId('');
        setTrackName('');
        setCarClass('');
        onRaceRecorded();
      } else {
        setError('Failed to record race - no response from server');
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record race');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="race-recorder">
      <div className="card">
        <h2>Record New Race</h2>
        <form onSubmit={handleRecordRace} className="race-form">
          <div className="form-group">
            <label htmlFor="winner">Race Winner *</label>
            <select
              id="winner"
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">-- Select Winner --</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="second">2nd Place</label>
            <select
              id="second"
              value={secondPlaceId}
              onChange={(e) => setSecondPlaceId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- None --</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === winnerId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="third">3rd Place</label>
            <select
              id="third"
              value={thirdPlaceId}
              onChange={(e) => setThirdPlaceId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- None --</option>
              {players.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={p.id === winnerId || p.id === secondPlaceId}
                >
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="track">Track Name *</label>
            <input
              id="track"
              type="text"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="e.g., Edinburgh Circuit"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Car Class</label>
            <select
              id="class"
              value={carClass}
              onChange={(e) => setCarClass(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Any --</option>
              <option value="S2">S2 998</option>
              <option value="S1">S1 900</option>
              <option value="A">A 800</option>
              <option value="B">B 700</option>
              <option value="C">C 600</option>
              <option value="D">D 500</option>
            </select>
          </div>

          <button type="submit" disabled={loading || !winnerId || !trackName}>
            {loading ? 'Recording...' : 'Record Race'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
}

export default RaceRecorder;
