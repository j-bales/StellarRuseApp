import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CardGame } from './GameLogic';
import { Table } from '../components/Table';

export const GameClient = Client({
  game: CardGame,
  board: Table,
  numPlayers: 3,
  debug: false,
  multiplayer: SocketIO({ server: 'http://127.0.0.1:8000' })
});
