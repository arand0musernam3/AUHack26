import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { LobbyClient } from 'boardgame.io/client';
import { EnergyGame } from './game/GameDefinition';
import { GameBoard } from './components/board/GameBoard';
import { Login } from './components/lobby/Login';
import { SocketIO } from 'boardgame.io/multiplayer';
import './App.css';

const server = 'http://localhost:8000';
const lobbyClient = new LobbyClient({ server });

const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: SocketIO({ server }),
  debug: true,
});

const App = () => {
  const [gameConfig, setGameConfig] = useState<{
    matchID: string;
    playerID: string;
    credentials: string;
  } | null>(null);

  if (!gameConfig) {
    return (
      <div className="app">
        <Login 
          lobbyClient={lobbyClient} 
          gameName="energy-market"
          onJoin={(matchID, id, creds) => setGameConfig({ matchID, playerID: id, credentials: creds })} 
        />
      </div>
    );
  }

  return (
    <div className="app">
      {/* CRITICAL: Pass matchID, playerID AND credentials */}
      <EnergyClient 
        matchID={gameConfig.matchID}
        playerID={gameConfig.playerID} 
        credentials={gameConfig.credentials} 
      />
    </div>
  );
};

export default App;
