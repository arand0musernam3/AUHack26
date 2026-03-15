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

const DESCRIPTIONS: Record<string, string> = {
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

const SectionHeader = ({ title, count, label }: { title: string, count: number, label: string }) => (
  <div className="pane-header" style={{ background: 'transparent', padding: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }}>
    <span>{title}</span>
    <span className="mono">{count} {label}</span>
  </div>
);

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ 
  G, playerID, ctx, onBuyCard, selectedCardId, onSelectCard
}) => {
  const [hover, setHover] = useState<string | null>(null);
  const contracts = G.contracts || {};
  const currentPhase = ctx?.phase;
  const isBidding = currentPhase === 'bidding';
  const isAction = currentPhase === 'actionDeployment';
  
  const myBids = Object.values(contracts).flatMap(c => 
    c.bids.filter(b => b.player_id === playerID).map(b => ({ ...b, contract: c }))
  );

  const myPositions = (G.positions || []).filter(p => p.player_id === playerID);

  const otherBids: Record<string, any[]> = {};
  Object.values(contracts).forEach(c => {
    c.bids.forEach(b => {
      if (b.player_id !== playerID) {
        if (!otherBids[b.player_id]) otherBids[b.player_id] = [];
        otherBids[b.player_id].push({ ...b, contract: c });
      }
    });
  });

  const cards = G.action_cards?.[playerID] || [];
  const PIPES = ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"];

  return (
    <div className="tab-content" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
      <SectionHeader title="OPERATOR ARSENAL" count={cards.length} label="CARDS" />

      <div style={{ marginBottom: '25px' }}>
        <button 
          onClick={onBuyCard}
          disabled={currentPhase === 'resolution' || G.player_balances[playerID] < 20000}
          style={{
            width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)',
            border: '1px dashed var(--border-color)', color: 'var(--text-main)',
            cursor: (currentPhase === 'resolution' || G.player_balances[playerID] < 20000) ? 'not-allowed' : 'pointer',
            marginBottom: '15px', fontSize: '0.75rem'
          }}
        >
          ACQUIRE INTEL CARD (20,000 €)
        </button>

        {cards.length === 0 ? (
          <div className="placeholder" style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>No action cards available.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {cards.map(c => {
              const sel = selectedCardId === c.card_id;
              const isPipe = PIPES.includes(c.type);
              return (
                <div 
                  key={c.card_id}
                  onMouseEnter={() => setHover(c.card_id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    border: sel ? '1px solid var(--color-solar)' : '1px solid var(--border-color)',
                    padding: '10px', background: sel ? 'rgba(255, 179, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                    fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '8px',
                    opacity: isAction ? 1 : 0.6, position: 'relative'
                  }}
                >
                  <div className="mono" style={{ color: isPipe ? 'var(--color-solar)' : 'var(--color-wind)' }}>
                    {c.type.replace('_', ' ')}
                  </div>
                  <div className="mono" style={{ fontSize: '0.6rem', opacity: 0.6 }}>TARGET: {isPipe ? 'CONDUCT' : 'COUNTRY'}</div>
                  
                  {hover === c.card_id && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                      width: '180px', background: '#1a1d23', border: '1px solid var(--color-solar)',
                      padding: '8px', borderRadius: '4px', zIndex: 1000, marginBottom: '10px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)', pointerEvents: 'none'
                    }}>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--color-solar)', marginBottom: '4px' }}>OPERATIONAL INTEL:</div>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'white', lineHeight: '1.4' }}>{DESCRIPTIONS[c.type] || 'No description available.'}</div>
                    </div>
                  )}

                  <button 
                    disabled={!isAction}
                    onClick={() => onSelectCard?.(c.card_id)}
                    style={{
                      padding: '5px', background: isAction ? (sel ? 'var(--color-fossil)' : 'var(--color-solar)') : 'transparent',
                      color: isAction ? 'black' : 'var(--text-dim)', border: isAction ? 'none' : '1px solid var(--border-color)',
                      cursor: isAction ? 'pointer' : 'not-allowed', fontSize: '0.65rem', fontWeight: 'bold'
                    }}
                  >
                    {sel ? 'CANCEL' : 'TARGET'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SectionHeader title="MY ACTIVE POSITIONS" count={myPositions.length} label="POSITIONS" />
      {myPositions.length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>No active energy positions.</div>
      ) : (
        <div className="position-list" style={{ marginBottom: '25px' }}>
          {myPositions.map((p, i) => (
            <div key={i} style={{ border: '1px solid var(--border-color)', padding: '12px', marginBottom: '12px', background: 'rgba(255,255,255,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: p.is_short ? 'var(--color-solar)' : 'var(--color-wind)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ color: p.is_short ? 'var(--color-solar)' : 'var(--color-wind)', fontWeight: 'bold' }}>{p.origin_country} {p.is_short ? '[SHORT]' : '[LONG]'}</span>
                <span className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>{p.energy_type.toUpperCase()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>VOLUME<br /><span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{p.volume.toFixed(0)} MWh</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ENTRY PRICE<br /><span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>€{p.bid_price}/MWh</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                  SETTLEMENT<br />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--color-solar)', fontSize: '0.85rem' }}>DAY {p.delivery_day} {p.delivery_day === G.current_day ? '(TODAY)' : `(IN ${p.delivery_day - G.current_day} DAYS)`}</span>
                    <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>TOTAL: €{Math.round(p.volume * p.bid_price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHeader title="MY PENDING BIDS" count={myBids.length} label="BIDS" />
      {myBids.length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>No pending energy bids.</div>
      ) : (
        <div className="bid-list">
          {myBids.map((b, i) => (
            <div key={i} style={{ border: '1px solid var(--border-color)', padding: '12px', marginBottom: '12px', background: 'rgba(255,255,255,0.02)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ color: b.is_short ? 'var(--color-solar)' : 'var(--color-wind)', fontWeight: 'bold' }}>{b.contract.origin_country} {b.is_short ? '(SHORT)' : '(LONG)'}</span>
                <span className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>{b.contract.energy_type.toUpperCase()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>VOLUME<br /><span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{b.volume} MWh</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>PRICE<br /><span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>€{b.price}/MWh</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                  DELIVERY<br />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ color: 'var(--color-wind)', fontSize: '0.85rem' }}>DAY {b.contract.delivery_day}</span>
                    <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>TOTAL: €{(b.volume * b.price).toLocaleString()}</span>
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
      {Object.keys(otherBids).length === 0 ? (
        <div className="placeholder" style={{ padding: '20px 0', textAlign: 'center', opacity: 0.6 }}>No bids from other operators detected.</div>
      ) : (
        Object.entries(otherBids).map(([pid, bids]) => (
          <div key={pid} style={{ marginBottom: '20px' }}>
            <div className="mono" style={{ fontSize: '0.75rem', marginBottom: '10px', color: 'var(--color-solar)', borderLeft: '2px solid var(--color-solar)', paddingLeft: '8px' }}>OPERATOR {pid} — {bids.length} BIDS</div>
            {bids.map((b, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '10px', marginBottom: '8px', background: 'rgba(255,255,255,0.01)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isBidding ? '0' : '5px' }}>
                  <span className="mono">{b.contract.origin_country} ({b.contract.energy_type})</span>
                  {isBidding && <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>[CONFIDENTIAL]</span>}
                </div>
                {!isBidding && (
                  <div style={{ display: 'flex', gap: '15px', opacity: 0.8, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span className="mono" style={{ fontSize: '0.7rem' }}>VOL: {b.volume}</span>
                      <span className="mono" style={{ fontSize: '0.7rem' }}>PRC: €{b.price}</span>
                      {b.is_short && <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-solar)' }}>SHORT</span>}
                    </div>
                    <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>TOTAL: €{(b.volume * b.price).toLocaleString()}</span>
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
