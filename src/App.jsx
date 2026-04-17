import React from 'react';
import { GameClient } from './game/GameClient';
import './styles/theme.css';

function App() {
  return (
    <div className="app-container">
      <GameClient playerID="0" />
    </div>
  );
}

export default App;
