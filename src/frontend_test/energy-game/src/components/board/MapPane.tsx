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

const getCountryId = (name: string): string => {
  const mapping: Record<string, string> = {
    'Germany': 'DE', 'France': 'FR', 'Spain': 'ES', 'Portugal': 'PT', 'Italy': 'IT',
    'Netherlands': 'NL', 'Belgium': 'BE', 'Denmark': 'DK', 'Norway': 'NO', 
    'Sweden': 'SE', 'Finland': 'FI', 'Poland': 'PL', 'Czechia': 'CZ', 
    'Austria': 'AT', 'Switzerland': 'CH'
  };
  return mapping[name] || name;
};

export const MapPane: React.FC<MapPaneProps> = ({ 
  weather_data, 
  current_date, 
  pipes,
  onCountryClick,
  onPipeClick,
  activeModifiers = {},
  activePipeModifiers = [],
  pendingPlays = [],
  isTargeting = false,
  targetingType = 'country'
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredPipe, setHoveredPipe] = useState<Pipe | null>(null);

  const formatWeather = (countryName: string) => {
    const entry = weather_data[countryName];
    if (!entry) return null;
    const data = entry.current;
    const countryId = getCountryId(countryName);

    const active = activeModifiers[countryId] || [];
    const pending = pendingPlays.filter(p => p.target_country === countryId);

    const cardCounts: Record<string, number> = {};
    pending.forEach(p => {
      cardCounts[p.card.type] = (cardCounts[p.card.type] || 0) + 1;
    });
    const totalPending = pending.length;

    return (
      <div className="country-tooltip mono" style={{ width: '280px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="tooltip-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{countryName.toUpperCase()} Terminal</span>
          <span style={{ color: 'var(--text-dim)' }}>{countryId}</span>
        </div>
        
        <div className="tooltip-section">
          <div className="tooltip-label">METRICS:</div>
          <div className="tooltip-grid">
            <div className="stat">TEMP: {data.temperature.toFixed(1)}°C</div>
            <div className="stat">WIND: {data.wind_speed.toFixed(1)}k</div>
            <div className="stat">CLOU: {data.cloud_cover.toFixed(0)}%</div>
            <div className="stat">PRIC: €{data.Price.toFixed(1)}</div>
          </div>
        </div>

        <div className="tooltip-section">
          <div className="tooltip-label">GRID LOAD:</div>
          <div className="tooltip-grid">
            <div className="stat">CONS: {Math.round(data.Consumption).toLocaleString()} MW</div>
          </div>
        </div>

        <div className="tooltip-section">
          <div className="tooltip-label">GENERATION MIX:</div>
          <div className="tooltip-grid" style={{ gridTemplateColumns: '1fr' }}>
            {['Wind', 'Solar', 'Water', 'Fossil', 'Nuclear'].map(type => {
              const val = (data as any)[type];
              if (!val) return null;
              return (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                  <span>{type.toUpperCase()}</span>
                  <span>{Math.round(val).toLocaleString()} MW</span>
                </div>
              );
            })}
          </div>
        </div>

        {active.length > 0 && (
          <div className="tooltip-active">
            <div className="tooltip-label" style={{ color: 'var(--color-solar)' }}>ACTIVE MODIFIERS:</div>
            {active.map((a, i) => (
              <div key={i} style={{ fontSize: '0.65rem' }}>{a.type} ({a.remaining_days}d left)</div>
            ))}
          </div>
        )}

        {totalPending > 0 && (
          <div className="tooltip-pending" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #444' }}>
            <div className="tooltip-label" style={{ color: 'var(--color-wind)' }}>PENDING DEPLOYMENTS:</div>
            {Object.entries(cardCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                <span>{type}</span>
                <span>{((count / totalPending) * 100).toFixed(0)}% chance</span>
              </div>
            ))}
          </div>
        )}

        <div className="tooltip-section" style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '8px' }}>
          <div className="tooltip-label">3-DAY FORECAST:</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {entry.forecast.slice(0, 3).map((f, i) => (
              <div key={i} style={{ flex: 1, fontSize: '0.6rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--color-wind)', marginBottom: '2px' }}>D+{i+1}</div>
                <div>{f.temperature.toFixed(0)}°C</div>
                <div>{f.wind_speed.toFixed(0)}k</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatPipeTooltip = (pipe: Pipe) => {
    const hourlyCapacity = Math.round(pipe.capacity);
    const transitCapacity = hourlyCapacity * 12;
    
    const activeBroken = activePipeModifiers.find(m => m.type === 'CUT_CONDUCT' && m.target.from === pipe.from && m.target.to === pipe.to);
    const activeDiscount = activePipeModifiers.find(m => m.type === 'DISCOUNT_CONDUCT' && m.target.from === pipe.from && m.target.to === pipe.to);
    const pending = pendingPlays.filter(p => p.target_pipe?.from === pipe.from && p.target_pipe?.to === pipe.to);

    return (
      <div className="country-tooltip mono" style={{ border: activeBroken ? '1px solid var(--color-fossil)' : '1px solid var(--color-solar)', width: '240px' }}>
        <div className="tooltip-header" style={{ color: activeBroken ? 'var(--color-fossil)' : 'var(--color-solar)', borderBottom: activeBroken ? '1px solid var(--color-fossil)' : '1px solid var(--color-solar)' }}>
          PIPE TERMINAL {activeBroken ? '[OFFLINE]' : '[ONLINE]'}
        </div>
        <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
          {pipe.from} ⇹ {pipe.to}
        </div>
        <div className="tooltip-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="stat" style={{ fontSize: '0.65rem' }}>
            MAX FLOW: {hourlyCapacity.toLocaleString()} MW/h
          </div>
          <div className="stat" style={{ fontSize: '0.65rem', color: 'var(--color-solar)' }}>
            TRANSIT CAP (12h): {transitCapacity.toLocaleString()} MW
          </div>
        </div>

        {activeBroken && (
          <div style={{ color: 'var(--color-fossil)', fontSize: '0.65rem', marginTop: '10px', fontWeight: 'bold' }}>
            STATUS: SEVERED ({activeBroken.remaining_rounds} ROUNDS)
          </div>
        )}
        {activeDiscount && (
          <div style={{ color: 'var(--color-nuclear)', fontSize: '0.65rem', marginTop: '10px', fontWeight: 'bold' }}>
            STATUS: DISCOUNTED ({activeDiscount.remaining_rounds} ROUNDS)
          </div>
        )}
        
        {pending.length > 0 && (
          <div className="tooltip-pending" style={{ marginTop: '10px', color: 'var(--color-solar)', fontSize: '0.65rem' }}>
            PENDING: {pending.map(p => p.card.type).join(', ')}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="map-pane">
      <div className="map-header pane-header">
        <span className="mono">EUROPEAN GRID STATUS — {current_date.slice(0,10)}</span>
        {isTargeting && <span className="targeting-pulse mono">SELECT {targetingType.toUpperCase()}</span>}
      </div>
      
      <div className="map-container" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <EuropeMap 
          weather_data={weather_data}
          pipes={pipes}
          onCountryClick={onCountryClick}
          onCountryHover={setHoveredCountry}
          onPipeHover={setHoveredPipe}
          onPipeClick={onPipeClick}
          activeModifiers={activeModifiers}
          activePipeModifiers={activePipeModifiers}
          pendingPlays={pendingPlays}
          isTargeting={isTargeting}
          targetingType={targetingType}
        />
        
        {hoveredCountry && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 100 }}>
            {formatWeather(hoveredCountry)}
          </div>
        )}

        {hoveredPipe && (
          <div style={{ position: 'absolute', top: '20px', right: '20px', pointerEvents: 'none', zIndex: 100 }}>
            {formatPipeTooltip(hoveredPipe)}
          </div>
        )}

        {/* Color Legend in bottom right */}
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
