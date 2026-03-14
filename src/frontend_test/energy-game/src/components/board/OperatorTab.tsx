import React from 'react';
import type { ActionCardInstance } from '../../game/types';

interface OperatorTabProps {
  playerID: string;
  playerBalances: Record<string, number>;
  readyPlayers: string[];
  actionCards: ActionCardInstance[];
  onBuyCard: () => void;
  onDeployCard: (cardId: string) => void;
}

export const OperatorTab: React.FC<OperatorTabProps> = ({ 
  playerID, 
  playerBalances, 
  readyPlayers, 
  actionCards,
  onBuyCard,
  onDeployCard
}) => {
  const localBalance = playerBalances[playerID] || 0;

  return (
    <div className="tab-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Local Player Stats */}
      <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid var(--color-wind)', background: 'rgba(0, 229, 255, 0.05)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-wind)', letterSpacing: '1px', marginBottom: '10px', fontWeight: 'bold' }}>LOCAL OPERATOR STATUS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>ID: {playerID}</div>
            <div className="mono" style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
              € {localBalance.toLocaleString()}
            </div>
          </div>
          <div className="mono" style={{ 
            fontSize: '0.7rem', 
            padding: '4px 8px', 
            background: readyPlayers.includes(playerID) ? 'var(--color-wind)' : 'transparent',
            color: readyPlayers.includes(playerID) ? 'var(--bg-dark)' : 'var(--color-wind)',
            border: '1px solid var(--color-wind)'
          }}>
            {readyPlayers.includes(playerID) ? 'READY' : 'WAITING'}
          </div>
        </div>
      </div>

      {/* Buy Card Section */}
      <div style={{ marginBottom: '25px' }}>
        <button 
          onClick={onBuyCard}
          className="mono"
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--color-solar)',
            color: 'var(--bg-dark)',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>ACQUIRE NEW ACTION CARD</span>
          <span>€ 5,000</span>
        </button>
      </div>

      {/* Action Cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '25px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '15px', letterSpacing: '1px' }}>ACTION CARDS HAND</div>
        <div className="action-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {actionCards && actionCards.length > 0 ? (
            actionCards.map((card) => (
              <div 
                key={card.card_id}
                className="action-card-item"
                style={{
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--color-solar)' }}></div>
                <div>
                  <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{card.type.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>ID: {card.card_id}</div>
                </div>
                <button 
                  onClick={() => onDeployCard(card.card_id)}
                  className="mono"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.65rem',
                    background: 'transparent',
                    border: '1px solid var(--color-solar)',
                    color: 'var(--color-solar)',
                    cursor: 'pointer'
                  }}
                >
                  DEPLOY
                </button>
              </div>
            ))
          ) : (
            <div className="placeholder" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-color)', opacity: 0.5 }}>
              No action cards held.
            </div>
          )}
        </div>
      </div>

      {/* Other Operators */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '15px', letterSpacing: '1px' }}>NETWORK OPERATORS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(playerBalances).map(([id, balance]) => {
            if (id === playerID) return null;
            const isReady = readyPlayers.includes(id);
            return (
              <div key={id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: isReady ? 'var(--color-nuclear)' : 'var(--text-dim)',
                    boxShadow: isReady ? '0 0 5px var(--color-nuclear)' : 'none'
                  }}></div>
                  <span className="mono" style={{ fontSize: '0.8rem' }}>OP_{id}</span>
                </div>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>€ {balance.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
