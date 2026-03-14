import React from 'react';
import type { GameState } from '../../game/types';
import { PhaseHeader } from './PhaseHeader';
import { MapPane } from './MapPane';
import { SidePane } from './SidePane';
import { useEffect } from 'react';

export interface BoardProps {
  G: GameState;
  ctx: any;
  moves: {
    submitBid: (tradeId: string, price: number, volume: number) => void;
    playActionCard: (cardId: string, target?: string, faceDown?: boolean) => void;
    routeEnergy: (contractId: string, route: any[]) => void;
    buyActionCard: () => void;
    markReady: () => void;
    setPlayerName: (name: string) => void;
  };
  playerID: string;
  isActive: boolean;
  isMultiplayer: boolean;
}

export const GameBoard: React.FC<BoardProps> = ({ G, ctx, moves, playerID }) => {
  // Sync name from Lobby metadata
  useEffect(() => {
    if (!ctx.playerMetadata) return;

    // Check all players, not just local, to help sync the whole state
    Object.keys(ctx.playerMetadata).forEach(id => {
      const name = ctx.playerMetadata[id]?.name;
      if (name && name.trim() !== "" && G.player_names[id] !== name) {
        console.log(`[GameBoard] Syncing name for ${id}: ${name}`);
        moves.setPlayerName(name);
      }
    });
  }, [ctx.playerMetadata, G.player_names, moves]);

  // Guard against undefined G
  if (!G) {
    return <div className="loading">Initializing Terminal...</div>;
  }

  const readyPlayers = G.ready_players || [];
  const isReady = readyPlayers.includes(playerID);

  return (
    <div className="game-board">
      <PhaseHeader 
        phase={ctx.phase || "loading"}
        onTimerExpiry={() => {
          if (!isReady) moves.markReady();
        }}
        isReady={isReady}
        onReadyClick={() => {
          if (!isReady) moves.markReady();
        }}
        currentDay={G.current_day}
        currentPeriod={G.current_period ? G.current_period.toString() : "1"}
      />

      <main className="game-layout">
        <MapPane 
          weather_data={G.weather_data || {}} 
          current_date={G.current_date} 
          pipes={G.pipes || []} 
        />
        <SidePane G={G} ctx={ctx} playerID={playerID} moves={moves} />
      </main>
    </div>
  );
};
