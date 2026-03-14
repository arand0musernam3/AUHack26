import React from 'react';
import type { GameState } from '../../game/types';

interface PortfolioTabProps {
  G: GameState;
  playerID: string;
  ctx: any;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ G, playerID, ctx }) => {
  const contracts = G.contracts || {};
  const isBiddingPhase = ctx?.phase === 'bidding';
  
  // Find all bids placed by the current player
  const myBids = Object.values(contracts).flatMap(contract => 
    contract.bids
      .filter(bid => bid.player_id === playerID)
      .map(bid => ({ ...bid, contract }))
  );

  // Find bids from other players
  const otherBidsByPlayer: Record<string, any[]> = {};
  Object.values(contracts).forEach(contract => {
    contract.bids.forEach(bid => {
      if (bid.player_id !== playerID) {
        if (!otherBidsByPlayer[bid.player_id]) {
          otherBidsByPlayer[bid.player_id] = [];
        }
        otherBidsByPlayer[bid.player_id].push({ ...bid, contract });
      }
    });
  });

  return (
    <div className="tab-content" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
      <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
        <span>My Active Bids</span>
        <span className="mono">{myBids.length} BIDS</span>
      </div>

      {myBids.length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>
          No active energy bids found.<br />
          <small>Win bids in the Market phase to acquire contracts.</small>
        </div>
      ) : (
        <div className="bid-list">
          {myBids.map((bid, index) => (
            <div 
              key={`my-bid-${bid.contract.contract_id}-${index}`}
              className="bid-card"
              style={{ 
                border: '1px solid var(--border-color)', 
                padding: '12px', 
                marginBottom: '12px',
                background: 'rgba(255,255,255,0.02)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ color: 'var(--color-wind)', fontWeight: 'bold' }}>
                  {bid.contract.origin_country} → {bid.contract.delivery_country}
                </span>
                <span className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  {bid.contract.energy_type.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  VOLUME<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                    {bid.volume} MWh
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  PRICE<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                    €{bid.price}/MWh
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='pane-header' style={{ background: 'transparent', padding: '20px 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px', marginTop: '10px' }}>
        <span>Other Operators' Bids</span>
      </div>

      {Object.keys(otherBidsByPlayer).length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>
          No bids from other operators detected.
        </div>
      ) : (
        Object.entries(otherBidsByPlayer).map(([otherPlayerID, bids]) => (
          <div key={`other-player-${otherPlayerID}`} style={{ marginBottom: '20px' }}>
            <div className="mono" style={{ fontSize: '0.75rem', marginBottom: '10px', color: 'var(--color-solar)', borderLeft: '2px solid var(--color-solar)', paddingLeft: '8px' }}>
              OPERATOR {otherPlayerID} — {bids.length} BIDS
            </div>
            {bids.map((bid, index) => (
              <div 
                key={`other-bid-${otherPlayerID}-${index}`}
                style={{ 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  padding: '10px', 
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.01)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isBiddingPhase ? '0' : '5px' }}>
                  <span className="mono">{bid.contract.origin_country} ({bid.contract.energy_type})</span>
                  {isBiddingPhase && <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>[CONFIDENTIAL]</span>}
                </div>
                
                {!isBiddingPhase && (
                  <div style={{ display: 'flex', gap: '15px', opacity: 0.8 }}>
                    <span className="mono" style={{ fontSize: '0.7rem' }}>VOL: {bid.volume}</span>
                    <span className="mono" style={{ fontSize: '0.7rem' }}>PRC: €{bid.price}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      <div className='pane-header' style={{ background: 'transparent', padding: '20px 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px', marginTop: '10px' }}>
        <span>Owned Portfolio</span>
      </div>
      <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>
        No settled contracts in your current portfolio.
      </div>
    </div>
  );
};
