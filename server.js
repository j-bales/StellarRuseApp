import pkg from 'boardgame.io/dist/cjs/server.js';
const { Server, Origins } = pkg;
import { CardGame } from './src/game/GameLogic.js';

const server = Server({
  games: [CardGame],
  origins: [Origins.LOCALHOST, 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
});

const PORT = process.env.PORT || 8000;

server.run(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
