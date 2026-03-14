import React from 'react';
import type { GameState } from '../../game/types';
import { PhaseHeader } from './PhaseHeader';
import { ContractList } from '../contracts/ContractList';
import MapChart from '../map/EuropeMap.tsx';

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
        <section className="map-pane">
          <div className="pane-header">
            <span>EUROPEAN ENERGY INFRASTRUCTURE</span>
            <span className="mono">LIVE DATA</span>
          </div>
          <div className="placeholder">
            <MapChart 
            />
          </div>
        </section>

        <section className="side-pane">
          <ContractList contracts={G.contracts} />
          
          <div className="player-hud-bottom" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '20px' }}>
             <div className="pane-header" style={{ borderBottom: 'none', padding: '0 0 10px 0' }}>
               <span>PLAYER HUD</span>
               <span className="mono" style={{ color: 'var(--color-wind)' }}>
                 € {(G.player_balances && G.player_balances[playerID])?.toLocaleString() || '1,000,000'}
               </span>
             </div>
             <div className="placeholder" style={{ margin: 0 }}>
               {G.action_cards && G.action_cards[playerID] ? 
                 `Action Cards: ${G.action_cards[playerID].length}` : 
                 'Action Cards Hand'
               }
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};
