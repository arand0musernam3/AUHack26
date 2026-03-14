import React from 'react';
import type { Contract } from '../../game/types';

interface ContractListProps {
  contracts?: Record<string, Contract>;
}

export const ContractList: React.FC<ContractListProps> = ({ contracts = {} }) => {
  const contractCount = Object.keys(contracts).length;

  return (
    <div className="contract-list">
      <div className="pane-header">
        <span>Available Contracts</span>
        <span className="mono">{contractCount} ITEMS</span>
      </div>
      <div className="contract-grid" style={{ padding: '10px', overflowY: 'auto' }}>
        {contractCount === 0 ? (
          <div className="placeholder">No contracts available yet.</div>
        ) : (
          Object.values(contracts).map((contract) => (
            <div 
              key={contract.contract_id} 
              className="contract-card"
              style={{ 
                border: '1px solid var(--border-color)', 
                padding: '10px', 
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span className="mono" style={{ color: 'var(--color-wind)' }}>{contract.origin_country}</span>
                <span className="mono">{contract.energy_type}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Volume: <span className="mono" style={{ color: 'var(--text-main)' }}>{contract.available_volume} MWh</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Base: <span className="mono" style={{ color: 'var(--text-main)' }}>€{contract.base_price}/MWh</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
