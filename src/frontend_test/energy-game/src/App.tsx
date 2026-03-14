import { Client } from 'boardgame.io/react';
import { EnergyGame } from './game/GameDefinition';
import { GameBoard } from './components/board/GameBoard';
import './App.css';

const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: { local: true }, // Local for now
  debug: true,
});

const App = () => (
  <div className="app">
    <EnergyClient playerID="0" />
  </div>
);

export default App;
