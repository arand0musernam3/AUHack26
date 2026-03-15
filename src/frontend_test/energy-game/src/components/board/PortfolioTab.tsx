import React, { useState } from 'react';
import type { GameState, ActionCardType } from '../../game/types';

interface PortfolioTabProps {
  G: GameState;
  playerID: string;
  ctx: any;
  onPlayCard?: (cardId: string, target?: string, faceDown?: boolean) => void;
  onBuyCard?: () => void;
  disabled?: boolean;
  selectedCardId?: string | null;
  onSelectCard?: (cardId: string) => void;
}

const CARD_DESCRIPTIONS: Record<ActionCardType | string, string> = {
  'POLAR_VORTEX': 'Intense cold: Wind +30%, Solar -90%, Consumption +15%, Prices +20%.',
  'HEAT_DOME': 'Extreme heat: Solar +50%, Wind -20%, Water -30%, Consumption +10%, Prices +15%.',
  'MONSOON': 'Heavy rain & wind: Water +40%, Wind -40%, Solar -80%, Prices +5%.',
  'DEAD_CALM': 'Stagnant air: Wind -90%, Solar +20%, Consumption -10%, Prices -5%.',
  'BOOST_ENERGY': 'Market manipulation: Increases local energy prices by 50%.',
  'NERF_ENERGY': 'Market manipulation: Decreases local energy prices by 50%.',
  'CUT_CONDUCT': 'Sabotage: Sever an interconnection pipe for 1-2 rounds.',
  'FIX_CONDUCT': 'Maintenance: Repair a severed interconnection pipe immediately.',
  'DISCOUNT_CONDUCT': 'Subsidy: Reduce transit fees on a pipe for 1-3 rounds.',
};

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ 
  G, 
  playerID, 
  ctx,
  onPlayCard,
  onBuyCard,
  disabled = false,
  selectedCardId,
  onSelectCard
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const contracts = G.contracts || {};
  const currentPhase = ctx?.phase;
  const isBiddingPhase = currentPhase === 'bidding';
  const isActionPhase = currentPhase === 'actionDeployment';
  
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
  const WEATHER_AND_PRICE_TYPES = ["POLAR_VORTEX", "HEAT_DOME", "MONSOON", "DEAD_CALM", "BOOST_ENERGY", "NERF_ENERGY"];
  const PIPE_TYPES = ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"];

  return (
    <div className="tab-content" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
      <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
        <span>OPERATOR ARSENAL</span>
        <span className="mono">{myActionCards.length} CARDS</span>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <button 
          onClick={onBuyCard}
          disabled={currentPhase === 'resolution' || G.player_balances[playerID] < 20000}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px dashed var(--border-color)',
            color: 'var(--text-main)',
            cursor: (currentPhase === 'resolution' || G.player_balances[playerID] < 20000) ? 'not-allowed' : 'pointer',
            marginBottom: '15px',
            fontSize: '0.75rem'
          }}
        >
          ACQUIRE INTEL CARD (20,000 €)
        </button>

        {myActionCards.length === 0 ? (
          <div className="placeholder" style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
            No action cards available.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {myActionCards.map(card => {
              const isSelected = selectedCardId === card.card_id;
              const isPipe = PIPE_TYPES.includes(card.type);
              const isWeatherOrPrice = WEATHER_AND_PRICE_TYPES.includes(card.type);

              return (
                <div 
                  key={card.card_id}
                  onMouseEnter={() => setHoveredCardId(card.card_id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    border: isSelected ? '1px solid var(--color-solar)' : '1px solid var(--border-color)',
                    padding: '10px',
                    background: isSelected ? 'rgba(255, 179, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                    fontSize: '0.7rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    opacity: isActionPhase ? 1 : 0.6,
                    position: 'relative'
                  }}
                >
                  <div className="mono" style={{ color: isPipe ? 'var(--color-solar)' : 'var(--color-wind)' }}>
                    {card.type.replace('_', ' ')}
                  </div>
                  <div className="mono" style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                    TARGET: {isPipe ? 'CONDUCT' : 'COUNTRY'}
                  </div>
                  
                  {hoveredCardId === card.card_id && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '180px',
                      background: '#1a1d23',
                      border: '1px solid var(--color-solar)',
                      padding: '8px',
                      borderRadius: '4px',
                      zIndex: 1000,
                      marginBottom: '10px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                      pointerEvents: 'none'
                    }}>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--color-solar)', marginBottom: '4px' }}>OPERATIONAL INTEL:</div>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'white', lineHeight: '1.4' }}>
                        {CARD_DESCRIPTIONS[card.type] || 'No description available.'}
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={!isActionPhase}
                    onClick={() => onSelectCard?.(card.card_id)}
                    style={{
                      padding: '5px',
                      background: isActionPhase ? (isSelected ? 'var(--color-fossil)' : 'var(--color-solar)') : 'transparent',
                      color: isActionPhase ? 'black' : 'var(--text-dim)',
                      border: isActionPhase ? 'none' : '1px solid var(--border-color)',
                      cursor: isActionPhase ? 'pointer' : 'not-allowed',
                      fontSize: '0.65rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {isSelected ? 'CANCEL' : 'TARGET'}
                  </button>
                </div>
              );
            })}
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                  SETTLEMENT<br />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--color-solar)', fontSize: '0.85rem' }}>
                      DAY {pos.delivery_day} {pos.delivery_day === G.current_day ? '(TODAY)' : `(IN ${pos.delivery_day - G.current_day} DAYS)`}
                    </span>
                    <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                      TOTAL: €{Math.round(pos.volume * pos.bid_price).toLocaleString()}
                    </span>
                  </div>
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
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                  DELIVERY<br />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--color-wind)', fontSize: '0.85rem' }}>
                      DAY {bid.contract.delivery_day}
                    </span>
                    <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                      TOTAL: €{(bid.volume * bid.price).toLocaleString()}
                    </span>
                  </div>
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
                  <div style={{ display: 'flex', gap: '15px', opacity: 0.8, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span className="mono" style={{ fontSize: '0.7rem' }}>VOL: {bid.volume}</span>
                      <span className="mono" style={{ fontSize: '0.7rem' }}>PRC: €{bid.price}</span>
                      {bid.is_short && <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-solar)' }}>SHORT</span>}
                    </div>
                    <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>TOTAL: €{(bid.volume * bid.price).toLocaleString()}</span>
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
