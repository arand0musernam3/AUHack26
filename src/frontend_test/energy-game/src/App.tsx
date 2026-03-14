import { Lobby } from "boardgame.io/react";
import { EnergyGame } from "./game/GameDefinition";
import { GameBoard } from "./components/board/GameBoard";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import "./App.css";

const App = () => {
  return (
    <div className="lobby-wrapper">
      <div className="lobby-header">
        <h1 className="login-title">ENERGY MARKET</h1>
        <p className="login-subtitle">Skibidi Boppi Forza Napoli</p>
      </div>
      <Lobby
        gameServer={`http://${window.location.hostname}:8000`}
        lobbyServer={`http://${window.location.hostname}:8000`}
        gameComponents={[{ game: EnergyGame, board: GameBoard }]}
        debug={false}
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
  );
};

export default App;
