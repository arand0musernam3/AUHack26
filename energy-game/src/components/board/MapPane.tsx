import React, { useState } from 'react';
import { EuropeMap } from '../map/EuropeMap';
import type { CountryWeatherData, ActiveModifier, PlayedCard, Pipe, ActivePipeModifier } from '../../game/types';

interface MapPaneProps {
  weather_data: CountryWeatherData;
  current_date: string;
  pipes: Pipe[];
  onCountryClick?: (id: string) => void;
  onPipeClick?: (id: string) => void;
  activeModifiers?: Record<string, ActiveModifier[]>;
  activePipeModifiers?: ActivePipeModifier[];
  pendingPlays?: PlayedCard[];
  isTargeting?: boolean;
  targetingType?: 'country' | 'pipe';
}

const MAPPING: Record<string, string> = {
  Germany: 'DE', France: 'FR', Spain: 'ES', Portugal: 'PT', Italy: 'IT',
  Netherlands: 'NL', Belgium: 'BE', Denmark: 'DK', Norway: 'NO', 
  Sweden: 'SE', Finland: 'FI', Poland: 'PL', Czechia: 'CZ', 
  Austria: 'AT', Switzerland: 'CH'
};

const getNoisy = (val: number, offset: number, id: string) => {
  const seed = id.charCodeAt(0) + offset;
  const pseudo = (Math.sin(seed) + 1) / 2;
  const noise = [0.05, 0.1, 0.15][offset] || 0.05;
  return val * (1 + (pseudo * (noise * 2) - noise));
};

export const MapPane: React.FC<MapPaneProps> = ({ 
  weather_data, current_date, pipes, onCountryClick, onPipeClick,
  activeModifiers = {}, activePipeModifiers = [], pendingPlays = [],
  isTargeting = false, targetingType = 'country'
}) => {
  const [hoverC, setHoverC] = useState<string | null>(null);
  const [hoverP, setHoverP] = useState<Pipe | null>(null);

  const renderCountryTooltip = (name: string) => {
    const entry = weather_data[name];
    if (!entry) return null;
    const d = entry.current;
    const id = MAPPING[name] || name;
    const mods = activeModifiers[id] || [];
    const pending = pendingPlays.filter(p => p.target_country === id);
    
    const cardCounts: Record<string, number> = {};
    pending.forEach(p => cardCounts[p.card.type] = (cardCounts[p.card.type] || 0) + 1);

    return (
      <div className="country-tooltip mono" style={{ width: '300px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="tooltip-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{name.toUpperCase()} Terminal</span>
          <span style={{ color: 'var(--text-dim)' }}>{id}</span>
        </div>
        
        <div className="tooltip-section">
          <div className="tooltip-label">LIVE METRICS:</div>
          <div className="tooltip-grid">
            <div className="stat">TEMP: {d.temperature.toFixed(1)}°C</div>
            <div className="stat">WIND: {d.wind_speed.toFixed(1)} km/h</div>
            <div className="stat">CLOU: {d.cloud_cover.toFixed(0)}%</div>
            <div className="stat">PRIC: €{d.Price.toFixed(1)}</div>
          </div>
        </div>

        <div className="tooltip-section">
          <div className="tooltip-label">GENERATION MIX:</div>
          <div className="tooltip-grid" style={{ gridTemplateColumns: '1fr' }}>
            {['Wind', 'Solar', 'Water', 'Fossil', 'Nuclear'].map(t => {
              const val = (d as any)[t];
              if (!val) return null;
              return (
                <div key={t} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                  <span>{t.toUpperCase()}</span>
                  <span>{Math.round(val).toLocaleString()} MW</span>
                </div>
              );
            })}
          </div>
        </div>

        {mods.length > 0 && (
          <div className="tooltip-active">
            <div className="tooltip-label" style={{ color: 'var(--color-solar)' }}>ACTIVE MODIFIERS:</div>
            {mods.map((m, i) => (
              <div key={i} style={{ fontSize: '0.65rem' }}>{m.type} ({m.remaining_days}d left)</div>
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="tooltip-pending" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #444' }}>
            <div className="tooltip-label" style={{ color: 'var(--color-wind)' }}>PENDING DEPLOYMENTS:</div>
            {Object.entries(cardCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                <span>{type}</span>
                <span>{((count / pending.length) * 100).toFixed(0)}% chance</span>
              </div>
            ))}
          </div>
        )}

        <div className="tooltip-section" style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '8px' }}>
          <div className="tooltip-label">3-DAY STRATEGIC FORECAST:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {entry.forecast.slice(0, 3).map((f, i) => {
              const noisyPrice = getNoisy(f.Price, i, id);
              const types = ['Wind', 'Solar', 'Water', 'Fossil', 'Nuclear'];
              const genData = types.map(t => ({ type: t, val: getNoisy((f as any)[t] || 0, i, id) }));
              const totalGen = genData.reduce((acc, curr) => acc + curr.val, 0);
              const top3 = genData.sort((a, b) => b.val - a.val).slice(0, 3);
              const uncertainty = ["±5%", "±10%", "±15%"][i];

              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '2px' }}>
                  <div style={{ color: 'var(--color-wind)', fontSize: '0.65rem', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>D+{i+1} PREDICTIONS</span>
                    <span style={{ opacity: 0.6 }}>({uncertainty} UNCERTAINTY)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>EST. PRICE:</span>
                    <span style={{ color: 'var(--text-main)' }}>€{noisyPrice.toFixed(1)}</span>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.55rem', marginBottom: '2px' }}>TOP PRODUCERS:</div>
                  {top3.map(p => (
                    <div key={p.type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', opacity: 0.8 }}>
                      <span>{p.type.toUpperCase()}</span>
                      <span>{totalGen > 0 ? ((p.val / totalGen) * 100).toFixed(1) : 0}%</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPipeTooltip = (p: Pipe) => {
    const broken = activePipeModifiers.find(m => m.type === 'CUT_CONDUCT' && 
      ((m.target.from === p.from && m.target.to === p.to) || (m.target.from === p.to && m.target.to === p.from)));
    const discount = activePipeModifiers.find(m => m.type === 'DISCOUNT_CONDUCT' && 
      ((m.target.from === p.from && m.target.to === p.to) || (m.target.from === p.to && m.target.to === p.from)));
    const pending = pendingPlays.filter(pl => pl.target_pipe?.from === p.from && pl.target_pipe?.to === p.to);

    return (
      <div className="country-tooltip mono" style={{ border: broken ? '1px solid var(--color-fossil)' : '1px solid var(--color-solar)', width: '240px' }}>
        <div className="tooltip-header" style={{ color: broken ? 'var(--color-fossil)' : 'var(--color-solar)', borderBottom: '1px solid #444' }}>
          PIPE TERMINAL {broken ? '[OFFLINE]' : '[ONLINE]'}
        </div>
        <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>{p.from} ⇹ {p.to}</div>
        <div className="tooltip-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="stat" style={{ fontSize: '0.65rem' }}>MAX FLOW: {Math.round(p.capacity).toLocaleString()} MW/h</div>
          <div className="stat" style={{ fontSize: '0.65rem', color: 'var(--color-solar)' }}>TRANSIT CAP (12h): {(Math.round(p.capacity) * 12).toLocaleString()} MW</div>
        </div>
        {broken && <div style={{ color: 'var(--color-fossil)', fontSize: '0.65rem', marginTop: '10px', fontWeight: 'bold' }}>STATUS: SEVERED ({broken.remaining_rounds} ROUNDS)</div>}
        {discount && <div style={{ color: 'var(--color-nuclear)', fontSize: '0.65rem', marginTop: '10px', fontWeight: 'bold' }}>STATUS: DISCOUNTED ({discount.remaining_rounds} ROUNDS)</div>}
        {pending.length > 0 && <div className="tooltip-pending" style={{ marginTop: '10px', color: 'var(--color-solar)', fontSize: '0.65rem' }}>PENDING: {pending.map(pl => pl.card.type).join(', ')}</div>}
      </div>
    );
  };

  return (
    <section className="map-pane">
      <div className="map-header pane-header">
        <span className="mono">EUROPEAN GRID STATUS — {current_date.replace('T', ' ')}</span>
        {isTargeting && <span className="targeting-pulse mono">SELECT {targetingType.toUpperCase()}</span>}
      </div>
      
      <div className="map-container" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <EuropeMap 
          weather_data={weather_data} pipes={pipes}
          onCountryClick={onCountryClick} onCountryHover={setHoverC}
          onPipeHover={setHoverP} onPipeClick={onPipeClick}
          activeModifiers={activeModifiers} activePipeModifiers={activePipeModifiers}
          pendingPlays={pendingPlays} isTargeting={isTargeting} targetingType={targetingType}
        />
        
        {hoverC && <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 100 }}>{renderCountryTooltip(hoverC)}</div>}
        {hoverP && <div style={{ position: 'absolute', top: '20px', right: '20px', pointerEvents: 'none', zIndex: 100 }}>{renderPipeTooltip(hoverP)}</div>}

        <div className="map-legend mono">
          <div className="legend-section">
            <div className="legend-title">COUNTRIES</div>
            <div className="legend-item"><span className="dot" style={{ background: 'rgba(0, 229, 255, 0.7)' }}></span> Polar Vortex</div>
            <div className="legend-item"><span className="dot" style={{ background: 'rgba(255, 179, 0, 0.7)' }}></span> Heat Dome</div>
            <div className="legend-item"><span className="dot" style={{ background: 'rgba(41, 121, 255, 0.7)' }}></span> Monsoon</div>
            <div className="legend-item"><span className="dot" style={{ background: 'rgba(255, 87, 34, 0.7)' }}></span> Dead Calm / Nerf</div>
            <div className="legend-item"><span className="dot" style={{ background: 'rgba(118, 255, 3, 0.4)' }}></span> Price Boost</div>
          </div>
          <div className="legend-section">
            <div className="legend-title">CONDUCTS</div>
            <div className="legend-item"><span className="line" style={{ background: 'var(--color-fossil)' }}></span> Severed (Offline)</div>
            <div className="legend-item"><span className="line" style={{ background: 'var(--color-nuclear)' }}></span> Discounted (Subsidy)</div>
            <div className="legend-item"><span className="line" style={{ background: 'var(--color-solar)' }}></span> Pending Target</div>
          </div>
        </div>
      </div>
    </section>
  );
};
