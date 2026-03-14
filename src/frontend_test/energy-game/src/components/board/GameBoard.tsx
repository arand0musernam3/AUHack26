import React from 'react';
import type { GameState } from '../../game/types';
import { PhaseHeader } from './PhaseHeader';
import { MapPane } from './MapPane';
import { SidePane } from './SidePane';

export interface BoardProps {
  G: GameState;
  ctx: any;
  moves: {
    submitBid: (tradeId: string, price: number, volume: number) => void;
    playActionCard: (cardId: string, target?: string, faceDown?: boolean) => void;
    routeEnergy: (contractId: string, route: any[]) => void;
    buyActionCard: () => void;
    markReady: () => void;
  };
  playerID: string;
  isActive: boolean;
  isMultiplayer: boolean;
}

export const GameBoard: React.FC<BoardProps> = ({ G, ctx, moves, playerID }) => {
  // Guard against undefined G or properties
  if (!G) {
    return <div className="loading">Initializing Terminal...</div>;
  }

  const readyPlayers = G.ready_players || [];
  const isReady = readyPlayers.includes(playerID);

  return (
    <div className="game-board">
      <PhaseHeader 
        phase={ctx?.phase || 'Unknown'} 
        onTimerExpiry={() => moves.markReady()}
        isReady={isReady}
        onReadyClick={() => moves.markReady()}
      />

      <main className="game-layout">
        <MapPane />
        <SidePane G={G} ctx={ctx} playerID={playerID} moves={moves} />
      </main>
    </div>
  );
};
