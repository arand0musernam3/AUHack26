import React, { useState } from 'react';
import { LobbyClient } from 'boardgame.io/client';

interface LoginProps {
  lobbyClient: LobbyClient;
  gameName: string;
  onJoin: (playerID: string, credentials: string) => void;
}

export const Login: React.FC<LoginProps> = ({ lobbyClient, gameName, onJoin }) => {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    try {
      // 1. Get list of matches
      let matches = await lobbyClient.listMatches(gameName);
      let matchID: string;

      // 2. Create a match if none exist
      if (matches.matches.length === 0) {
        const createRes = await lobbyClient.createMatch(gameName, { numPlayers: 5 });
        matchID = createRes.matchID;
      } else {
        matchID = matches.matches[0].matchID;
      }

      // 3. Find first empty seat
      const match = await lobbyClient.getMatch(gameName, matchID);
      const freeSeat = match.players.find(p => !p.name);

      if (!freeSeat) {
        alert("Game is full!");
        return;
      }

      // 4. Join the match
      const { playerID, playerCredentials } = await lobbyClient.joinMatch(
        gameName,
        matchID,
        { playerID: freeSeat.id.toString(), playerName }
      );

      onJoin(playerID, playerCredentials);
    } catch (e) {
      console.error("Join failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
       <h1 className="login-title">ENERGY MARKET</h1>
       <input 
         className="login-input"
         value={playerName} 
         onChange={(e) => setPlayerName(e.target.value)} 
         placeholder="ENTER NAME"
       />
       <button 
         className="login-button" 
         onClick={startSession} 
         disabled={loading || !playerName}
       >
         {loading ? "CONNECTING..." : "INITIALIZE SESSION"}
       </button>
    </div>
  );
};