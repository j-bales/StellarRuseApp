import React, { useState, useEffect } from 'react';
import { GameClient } from './game/GameClient';
import { loadCardCatalog } from './game/CardLoader';
import './styles/theme.css';

function App() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);
  
  // Lobby state
  const [joined, setJoined] = useState(false);
  const [matchID, setMatchID] = useState('test-room');
  const [playerID, setPlayerID] = useState('0');

  useEffect(() => {
    async function init() {
      try {
        const data = await loadCardCatalog();
        if (data && data.length > 0) {
          window.CARD_CATALOG = data;
          setCatalog(data);
        } else {
          setError('Card Catalog Not Found or Empty');
        }
      } catch (err) {
        setError('Failed to load card resources');
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        <h2>⚠️ {error}</h2>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h2>✨ Loading card catalog...</h2>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>Join Match</h2>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Match ID</label>
            <input 
              type="text" 
              value={matchID} 
              onChange={(e) => setMatchID(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Seat</label>
            <select 
              value={playerID} 
              onChange={(e) => setPlayerID(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            >
              <option value="0" style={{ color: 'black' }}>Player-1</option>
              <option value="1" style={{ color: 'black' }}>Player-2</option>
              <option value="2" style={{ color: 'black' }}>Player-3</option>
            </select>
          </div>

          <button 
            onClick={() => setJoined(true)}
            style={{ marginTop: '1rem', padding: '0.8rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <GameClient 
        key={`${matchID}-${playerID}`} 
        matchID={matchID}
        playerID={playerID} 
        setupData={catalog} 
      />
    </div>
  );
}

export default App;
