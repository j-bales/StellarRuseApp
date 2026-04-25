import React, { useState, useEffect } from 'react';
import { GameClient } from './game/GameClient';
import { loadCardCatalog } from './game/CardLoader';
import './styles/theme.css';

function App() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="app-container">
      <GameClient 
        key={catalog ? 'loaded' : 'loading'} 
        playerID="0" 
        setupData={catalog} 
      />
    </div>
  );
}

export default App;
