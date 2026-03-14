import React from 'react';
import { Timer } from '../shared/Timer';

interface PhaseHeaderProps {
  phase: string;
  onTimerExpiry: () => void;
  isReady: boolean;
  onReadyClick: () => void;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({ 
  phase, 
  onTimerExpiry, 
  isReady, 
  onReadyClick 
}) => {
  const getPhaseName = (p: string) => {
    switch (p) {
      case 'forecasting': return 'Market Forecasting';
      case 'actionDeployment': return 'Action Deployment';
      case 'bidding': return 'Bidding Phase';
      case 'resolution': return 'Resolution & Routing';
      default: return p;
    }
  };

  return (
    <div className="phase-header">
      <div className="phase-info">
        <span className="mono status-label">PHASE:</span>
        <span className="mono phase-value">{getPhaseName(phase)}</span>
      </div>
      
      <div className="timer-section">
        <Timer duration={30} onExpiry={onTimerExpiry} />
      </div>

      <div className="ready-section">
        <button 
          className={`ready-btn ${isReady ? 'active' : ''}`} 
          onClick={onReadyClick}
        >
          {isReady ? 'AWAITING OTHERS...' : 'MARK AS READY'}
        </button>
      </div>
    </div>
  );
};
