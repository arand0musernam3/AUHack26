import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { EnergyGame } from './game/GameDefinition';
import { GameBoard } from './components/board/GameBoard';
import { Login } from './components/lobby/Login';
import { Local } from 'boardgame.io/multiplayer';
import './App.css';

const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: Local(),
  debug: true,
});

const App = () => {
  const [operatorName, setOperatorName] = useState<string | null>(null);

  console.log('App rendering, operatorName:', operatorName);

  if (!operatorName) {
    console.log('Showing Login component');
    return (
      <div className="app" data-testid="login-view">
        <Login onLogin={(name) => {
          console.log('Login successful for:', name);
          setOperatorName(name);
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
