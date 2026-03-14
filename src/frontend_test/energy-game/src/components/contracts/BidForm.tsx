import React, { useState } from 'react';
import type { Contract } from '../../game/types';

interface BidFormProps {
  contract: Contract;
  onClose: () => void;
  onSubmit: (price: number, volume: number) => void;
}

export const BidForm: React.FC<BidFormProps> = ({ contract, onClose, onSubmit }) => {
  const [price, setPrice] = useState<number>(contract.base_price);
  const [volume, setVolume] = useState<number>(contract.available_volume);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    onSubmit(price, volume);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div className="modal-content" style={{
        background: '#1a1a1a',
        padding: '30px',
        border: '1px solid var(--border-color)',
        width: '400px',
        maxWidth: '90%'
      }}>
        {!showConfirmation ? (
          <form onSubmit={handleSubmit}>
            <h3 className="mono" style={{ color: 'var(--color-wind)', marginBottom: '20px' }}>
              PLACE BID: {contract.origin_country} {contract.energy_type.toUpperCase()}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                PRICE (€/MWh)
              </label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={contract.base_price}
                step="1"
                required
                className="mono"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>Min base price: €{contract.base_price}</small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                VOLUME (MWh)
              </label>
              <input 
                type="number" 
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                min={1}
                max={contract.available_volume}
                step="1"
                required
                className="mono"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
                disabled={true}
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>Max volume: {contract.available_volume} MWh</small>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button 
                type="button" 
                onClick={onClose}
                className="mono"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button 
                type="submit"
                className="mono"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--color-wind)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                BID
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3 className="mono" style={{ color: 'var(--color-wind)', marginBottom: '20px' }}>CONFIRM BID</h3>
            <p className="mono" style={{ fontSize: '0.9rem', marginBottom: '30px' }}>
              Are you sure you want to bid €{price}/MWh for {volume} MWh from {contract.origin_country}?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="mono"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                BACK
              </button>
              <button 
                onClick={confirmSubmit}
                className="mono"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--color-wind)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
