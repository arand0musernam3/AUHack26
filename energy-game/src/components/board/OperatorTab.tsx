import React from 'react';
import type { ActionCardInstance } from '../../game/types';

interface OperatorTabProps {
  playerID: string;
  playerBalances: Record<string, number>;
  playerNames: Record<string, string>;
  readyPlayers: string[];
  actionCards: ActionCardInstance[];
  onBuyCard: () => void;
  onDeployCard: (cardId: string) => void;
  ctx: any;
}

export const OperatorTab: React.FC<OperatorTabProps> = ({ 
  playerID, 
  playerBalances, 
  playerNames,
  readyPlayers, 
  actionCards,
  onBuyCard,
  onDeployCard,
  ctx
}) => {
  const localBalance = playerBalances[playerID] || 0;
  const localName = playerNames[playerID] || ctx.playerMetadata?.[playerID]?.name || `OP_${playerID}`;

  return (
    <div className="tab-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Local Player Stats */}
      <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid var(--color-wind)', background: 'rgba(0, 229, 255, 0.05)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-wind)', letterSpacing: '1px', marginBottom: '10px', fontWeight: 'bold' }}>LOCAL OPERATOR STATUS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>NAME: {localName}</div>
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

      {/* Other Operators */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '15px', letterSpacing: '1px' }}>NETWORK OPERATORS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(playerBalances).map(([id, balance]) => {
            if (id === playerID) return null;
            
            // source the name from wherever available
            const name = playerNames[id] || ctx.playerMetadata?.[id]?.name || `OP_${id}`;
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
                  <span className="mono" style={{ fontSize: '0.8rem' }}>{name}</span>
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
