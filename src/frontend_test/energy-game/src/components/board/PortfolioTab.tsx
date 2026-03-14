import React from 'react';
import type { GameState } from '../../game/types';

interface PortfolioTabProps {
  G: GameState;
  playerID: string;
  ctx: any;
  onPlayCard?: (cardId: string, target?: string, faceDown?: boolean) => void;
  onBuyCard?: () => void;
  disabled?: boolean;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ 
  G, 
  playerID, 
  ctx,
  onPlayCard,
  onBuyCard,
  disabled = false
}) => {
  const contracts = G.contracts || {};
  const currentPhase = ctx?.phase;
  const isBiddingPhase = currentPhase === 'bidding';
  const isActionPhase = currentPhase === 'actionDeployment';
  
  // Find all bids placed by the current player
  const myBids = Object.values(contracts).flatMap(contract => 
    contract.bids
      .filter(bid => bid.player_id === playerID)
      .map(bid => ({ ...bid, contract }))
  );

  // My current won positions
  const myPositions = (G.positions || []).filter(pos => pos.player_id === playerID);

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

  const myActionCards = G.action_cards?.[playerID] || [];

  return (
    <div className="tab-content" style={{ 
      padding: '20px', 
      overflowY: 'auto', 
      flex: 1
    }}>
      {/* ACTION CARDS SECTION */}
      <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
        <span>OPERATOR ARSENAL</span>
        <span className="mono">{myActionCards.length} CARDS</span>
      </div>

      <div style={{ marginBottom: '25px' }}>
        {/* BUYING: Let them buy anytime except resolution */}
        <button 
          onClick={onBuyCard}
          disabled={currentPhase === 'resolution' || G.player_balances[playerID] < 5000}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px dashed var(--border-color)',
            color: 'var(--text-main)',
            cursor: (currentPhase === 'resolution' || G.player_balances[playerID] < 5000) ? 'not-allowed' : 'pointer',
            marginBottom: '15px',
            fontSize: '0.75rem'
          }}
        >
          ACQUIRE INTEL CARD (5,000 €)
        </button>

        {myActionCards.length === 0 ? (
          <div className="placeholder" style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
            No action cards available.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {myActionCards.map(card => (
              <div 
                key={card.card_id}
                style={{
                  border: '1px solid var(--border-color)',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  fontSize: '0.7rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  opacity: isActionPhase ? 1 : 0.6
                }}
              >
                <div className="mono" style={{ color: 'var(--color-solar)' }}>{card.type.replace('_', ' ')}</div>
                <button 
                  disabled={!isActionPhase}
                  onClick={() => onPlayCard?.(card.card_id)}
                  style={{
                    padding: '5px',
                    background: isActionPhase ? 'var(--color-solar)' : 'transparent',
                    color: isActionPhase ? 'black' : 'var(--text-dim)',
                    border: isActionPhase ? 'none' : '1px solid var(--border-color)',
                    cursor: isActionPhase ? 'pointer' : 'not-allowed',
                    fontSize: '0.65rem',
                    fontWeight: 'bold'
                  }}
                >
                  DEPLOY
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
        <span>MY ACTIVE POSITIONS</span>
        <span className="mono">{myPositions.length} POSITIONS</span>
      </div>

      {myPositions.length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>
          No active energy positions.
        </div>
      ) : (
        <div className="position-list" style={{ marginBottom: '25px' }}>
          {myPositions.map((pos, index) => (
            <div 
              key={`my-pos-${pos.contract_id}-${index}`}
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
              <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: pos.is_short ? 'var(--color-solar)' : 'var(--color-wind)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ color: pos.is_short ? 'var(--color-solar)' : 'var(--color-wind)', fontWeight: 'bold' }}>
                  {pos.origin_country} {pos.is_short ? '[SHORT]' : '[LONG]'}
                </span>
                <span className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  {pos.energy_type.toUpperCase()}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  VOLUME<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                    {pos.volume.toFixed(0)} MWh
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  ENTRY PRICE<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                    €{pos.bid_price}/MWh
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
        <span>MY PENDING BIDS</span>
        <span className="mono">{myBids.length} BIDS</span>
      </div>

      {myBids.length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>
          No pending energy bids.
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
                <span className="mono" style={{ color: bid.is_short ? 'var(--color-solar)' : 'var(--color-wind)', fontWeight: 'bold' }}>
                  {bid.contract.origin_country} {bid.is_short ? '(SHORT)' : '(LONG)'}
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
        <span>OTHER OPERATORS' BIDS</span>
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
                    {bid.is_short && <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-solar)' }}>SHORT</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};
