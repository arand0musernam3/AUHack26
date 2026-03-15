import React, { useState } from 'react';
import type { Contract } from '../../game/types';
import { BidForm } from './BidForm';

interface ContractListProps {
  contracts?: Record<string, Contract>;
  title?: string;
  onBid?: (tradeId: string, price: number, volume: number, isShort: boolean) => void;
  disabled?: boolean;
  currentDay?: number;
}

export const ContractList: React.FC<ContractListProps> = ({ 
  contracts = {}, 
  title = "Available Contracts",
  onBid,
  disabled = false,
}) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const contractCount = Object.keys(contracts).length;

  return (
    <div className={`contract-list ${disabled ? 'disabled-phase' : ''}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' : 'auto'
    }}>
      <div className="pane-header">
        <span>{title}</span>
        <span className="mono">{contractCount} ITEMS</span>
      </div>
      <div className="contract-grid" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {contractCount === 0 ? (
          <div className="placeholder">No contracts available in this sector.</div>
        ) : (
          Object.values(contracts).map((contract) => (
            <div 
              key={contract.contract_id} 
              className="contract-card"
              style={{ 
                border: '1px solid var(--border-color)', 
                padding: '15px', 
                marginBottom: '15px',
                background: 'rgba(255,255,255,0.02)',
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--color-wind)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="mono" style={{ color: 'var(--color-wind)', fontWeight: 'bold' }}>{contract.origin_country}</span>
                <span className="mono" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{contract.energy_type.toUpperCase()}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  VOLUME<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{contract.available_volume} MWh</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  BASE PRICE<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>€{contract.base_price}/MWh</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                  BIDS<br />
                  <span className="mono" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{contract.bids.length} placed</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px' }}>
                  PROCESS ON<br />
                  <span className="mono" style={{ color: 'var(--color-solar)', fontSize: '0.9rem' }}>DAY {contract.delivery_day}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '5px', gridColumn: 'span 2' }}>
                  TOTAL COST (EST.)<br />
                  <span className="mono" style={{ color: 'var(--color-wind)', fontSize: '1rem', fontWeight: 'bold' }}>
                    €{(contract.available_volume * contract.base_price).toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                className="mono"
                disabled={disabled}
                onClick={() => setSelectedContract(contract)}
                style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-wind)',
                  fontSize: '0.7rem',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Place Bid
              </button>
            </div>
          ))
        )}
      </div>

      {selectedContract && (
        <BidForm 
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onSubmit={(price, volume, isShort) => {
            if (onBid) {
              onBid(selectedContract.contract_id, price, volume, isShort);
            }
          }}
        />
      )}
    </div>
  );
};
