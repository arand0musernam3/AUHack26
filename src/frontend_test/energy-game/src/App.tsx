import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { EnergyGame } from './game/GameDefinition';
import { GameBoard } from './components/board/GameBoard';
import { Login } from './components/lobby/Login';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import './App.css';

const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: SocketIO({server: 'http://localhost:8000'}),
  debug: true,
});

const App = () => {
  const [operatorName, setOperatorName] = useState<string | null>(null);

  console.log('Player Joined with info', EnergyClient.multiplayer);

  if (!operatorName) {
    console.log('Showing Login component');
    return (
      <div className="app" data-testid="login-view">
        <Login onLogin={(name) => {
          setOperatorName(name);
          // Here we would also want to connect to the game server and join a game room
        }} />
        <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '10px', color: '#333' }}>
          DEBUG: LOGIN_VIEW_ACTIVE
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <EnergyClient playerID="0" />
    </div>
  );
};

export default App;
