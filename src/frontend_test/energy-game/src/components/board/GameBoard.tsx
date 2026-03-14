import React, { useState } from 'react';
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

type TabType = 'market' | 'portfolio' | 'operator';

export const GameBoard: React.FC<BoardProps> = ({ G, ctx, moves, playerID }) => {
  const [activeTab, setActiveTab] = useState<TabType>('market');

  // Guard against undefined G or properties
  if (!G) {
    return <div className="loading">Initializing Terminal...</div>;
  }

  const readyPlayers = G.ready_players || [];
  const isReady = readyPlayers.includes(playerID);
  const playerBalance = G.player_balances ? G.player_balances[playerID] : 0;
  const actionCards = G.action_cards ? G.action_cards[playerID] : [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'market':
        return <ContractList contracts={G.contracts} title="Market Terminal" />;
      case 'portfolio':
        return (
          <div className="tab-content" style={{ padding: '20px' }}>
            <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0' }}>
              <span>My Energy Portfolio</span>
            </div>
            <div className="placeholder">
              No active energy contracts in your current portfolio.<br />
              <small>Win bids in the Market phase to acquire contracts.</small>
            </div>
          </div>
        );
      case 'operator':
        return (
          <div className="tab-content" style={{ padding: '20px' }}>
            <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0' }}>
              <span>Operator Status</span>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '5px' }}>AVAILABLE CAPITAL</div>
              <div className="mono" style={{ fontSize: '1.5rem', color: 'var(--color-wind)' }}>
                € {playerBalance?.toLocaleString()}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '15px' }}>ACTION CARDS HAND</div>
            <div className="action-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {actionCards && actionCards.length > 0 ? (
                actionCards.map((card) => (
                  <div 
                    key={card.card_id}
                    className="action-card-item"
                    style={{
                      border: '1px solid var(--border-color)',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.2)',
                      display: 'flex',
                      "justify-content": 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{card.type.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>ID: {card.card_id}</div>
                    </div>
                    <button 
                      className="mono"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.65rem',
                        background: 'transparent',
                        border: '1px solid var(--color-wind)',
                        color: 'var(--color-wind)',
                        cursor: 'pointer'
                      }}
                    >
                      DEPLOY
                    </button>
                  </div>
                ))
              ) : (
                <div className="placeholder" style={{ padding: '20px' }}>
                  No action cards held.
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <MapChart />
          </div>
        </section>

        <section className="side-pane">
          <nav className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`} 
              onClick={() => setActiveTab('market')}
            >
              Market
            </button>
            <button 
              className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} 
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
            <button 
              className={`tab-btn ${activeTab === 'operator' ? 'active' : ''}`} 
              onClick={() => setActiveTab('operator')}
            >
              Operator
            </button>
          </nav>
          
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </section>
      </main>
    </div>
  );
};
