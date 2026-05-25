import React, { useState, useEffect } from 'react';
import { playerService, leagueService, raceService, Player, LeaderboardEntry } from './services/api';
import { useAuth } from './services/auth';
import PlayerManagement from './components/PlayerManagement';
import RaceRecorder from './components/RaceRecorder';
import Leaderboard from './components/Leaderboard';
import Login from './pages/Login';
import './App.css';

type Tab = 'leaderboard' | 'record-race' | 'manage-players' | 'all-time';

function AppContent() {
  const { user, token, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (user) {
      loadPlayers();
    }
  }, [user]);

  const loadPlayers = async () => {
    try {
      const data = await playerService.getAll();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load players:', err);
      setPlayers([]);
    }
  };

  const handlePlayerAdded = (newPlayer: Player) => {
    setPlayers([...players, newPlayer]);
  };

  const handlePlayerDeleted = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const handleRaceRecorded = () => {
    loadPlayers();
  };

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🏁 Forza Racing League</h1>
        </header>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#a0a0a0' }}>Loading...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user || !token) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🏁 Forza Racing League</h1>
          <p>Monthly race tracking and leaderboard</p>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {user.name}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Current Month
        </button>
        <button
          className={`nav-button ${activeTab === 'all-time' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-time')}
        >
          All-Time Stats
        </button>
        <button
          className={`nav-button ${activeTab === 'record-race' ? 'active' : ''}`}
          onClick={() => setActiveTab('record-race')}
        >
          Record Race
        </button>
        <button
          className={`nav-button ${activeTab === 'manage-players' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-players')}
        >
          Manage Players
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'leaderboard' && <Leaderboard players={players} currentMonthOnly={true} />}
        {activeTab === 'all-time' && <Leaderboard players={players} currentMonthOnly={false} />}
        {activeTab === 'record-race' && (
          <RaceRecorder players={players} onRaceRecorded={handleRaceRecorded} />
        )}
        {activeTab === 'manage-players' && (
          <PlayerManagement
            players={players}
            onPlayerAdded={handlePlayerAdded}
            onPlayerDeleted={handlePlayerDeleted}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
