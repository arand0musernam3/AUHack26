import React from 'react';
import MapChart from '../map/EuropeMap.tsx';

export const MapPane: React.FC = () => {
  return (
    <section className="map-pane">
      <div className="pane-header">
        <span>EUROPEAN ENERGY INFRASTRUCTURE</span>
        <span className="mono">LIVE DATA</span>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapChart />
      </div>
    </section>
  );
};
