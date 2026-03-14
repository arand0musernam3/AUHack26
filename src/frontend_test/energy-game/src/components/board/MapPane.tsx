import React, { useState } from 'react';
import { EuropeMap } from '../map/EuropeMap';
import type { CountryWeatherData, ActiveModifier, PlayedCard, Pipe } from '../../game/types';

interface MapPaneProps {
  weather_data: CountryWeatherData;
  current_date: string;
  pipes: Pipe[];
  onCountryClick?: (id: string) => void;
  activeModifiers?: Record<string, ActiveModifier[]>;
  pendingPlays?: PlayedCard[];
  isTargeting?: boolean;
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
  activeModifiers = {},
  pendingPlays = [],
  isTargeting = false
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

    // Calculate probabilities for pending cards
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

    return (
      <div className="country-tooltip mono" style={{ border: '1px solid var(--color-solar)', width: '220px' }}>
        <div className="tooltip-header" style={{ color: 'var(--color-solar)', borderBottom: '1px solid var(--color-solar)' }}>
          PIPE TERMINAL
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
      </div>
    );
  };

  return (
    <section className="map-pane">
      <div className="map-header pane-header">
        <span className="mono">EUROPEAN GRID STATUS — {current_date.slice(0,10)}</span>
        {isTargeting && <span className="targeting-pulse mono">SELECT TARGET COUNTRY</span>}
      </div>
      
      <div className="map-container" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <EuropeMap 
          weather_data={weather_data}
          pipes={pipes}
          onCountryClick={onCountryClick}
          onCountryHover={setHoveredCountry}
          onPipeHover={setHoveredPipe}
          activeModifiers={activeModifiers}
          pendingPlays={pendingPlays}
          isTargeting={isTargeting}
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
      </div>
    </section>
  );
};
