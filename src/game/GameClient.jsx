import { Client } from 'boardgame.io/react';
import { CardGame } from './GameLogic';
import { Table } from '../components/Table';

export const GameClient = Client({
  game: CardGame,
  board: Table,
  numPlayers: 3,
  debug: false
});
