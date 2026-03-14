import React from 'react';
import MapChart from '../map/EuropeMap.tsx';
import type { CountryWeatherData, Pipe } from '../../game/types';

export const MapPane: React.FC<{ 
  weather_data: Record<string, CountryWeatherData>, 
  current_date: string,
  pipes: Pipe[]
}> = ({ weather_data, current_date, pipes }) => {
  const formattedDate = new Date(current_date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).toUpperCase();

  return (
    <section className="map-pane">
      <div className="pane-header">
        <span>EUROPEAN ENERGY INFRASTRUCTURE</span>
        <span className="mono">{formattedDate}</span>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapChart weather_data={weather_data} pipes={pipes} />
      </div>
    </section>
  );
};
