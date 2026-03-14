import { useState } from "react";
import { LobbyClient } from "boardgame.io/client";
import "./App.css";
import { Client, Lobby } from "boardgame.io/react";
import { EnergyGame } from "./game/GameDefinition";
import { GameBoard } from "./components/board/GameBoard";
import { Local, SocketIO } from "boardgame.io/multiplayer";
import "./App.css";

const server = "http://localhost:8000";
const lobbyClient = new LobbyClient({ server });

const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: SocketIO({ server }),
  debug: true,
});

const App = () => {
  // const [gameConfig, setGameConfig] = useState<{
  //   matchID: string;
  //   playerID: string;
  //   credentials: string;
  // } | null>(null);
  //
  // if (!gameConfig) {
  //   return (
  //     <div className="app">
  //       <Login 
  //         lobbyClient={lobbyClient} 
  //         gameName="energy-market"
  //         onJoin={(matchID, id, creds) => setGameConfig({ matchID, playerID: id, credentials: creds })} 
  //       />
  //     </div>
  //   );
  // }
  //
  // return (
  //   <div className="app">
  //     {/* CRITICAL: Pass matchID, playerID AND credentials */}
  //     <EnergyClient 
  //       matchID={gameConfig.matchID}
  //       playerID={gameConfig.playerID} 
  //       credentials={gameConfig.credentials} 
  //     />
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">ENERGY MARKET</h1>
        <p className="login-subtitle">Industrial Control Room Terminal</p>
        <Lobby
          gameServer={`http://${window.location.hostname}:8000`}
          lobbyServer={`http://${window.location.hostname}:8000`}
          gameComponents={[{ game: EnergyGame, board: GameBoard }]}
          clientFactory={(gameInfo) => {
            return Client({
              game: gameInfo.game,
              board: gameInfo.board,
              multiplayer: SocketIO({
                server: `http://${window.location.hostname}:8000`,
              }),
              debug: true,
            });
          }}
        />
      </div>
    </div>
  );
};

export default App;
