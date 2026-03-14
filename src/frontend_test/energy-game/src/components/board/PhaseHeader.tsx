import React from 'react';
import { Timer } from '../shared/Timer';

interface PhaseHeaderProps {
  phase: string;
  onTimerExpiry: () => void;
  isReady: boolean;
  onReadyClick: () => void;
  currentDay: number;
  currentPeriod: string;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({ 
  phase, 
  onTimerExpiry, 
  isReady, 
  onReadyClick,
  currentDay,
  currentPeriod
}) => {
  const getPhaseName = (p: string | null) => {
    if (!p) return 'INITIALIZING...';
    switch (p) {
      case 'bidding': return 'AUCTION & CONTRACTS';
      case 'actionDeployment': return 'OPERATOR ACTIONS';
      case 'resolution': return 'DAY END RESOLUTION';
      default: return p.toUpperCase();
    }
  };

  return (
    <div className="phase-header">
      <div className="phase-info" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <span className="mono status-label">DAY:</span>
          <span className="mono phase-value" style={{ color: 'var(--color-solar)' }}>{currentDay}</span>
        </div>
        <div>
          <span className="mono status-label">ROUND:</span>
          <span className="mono phase-value" style={{ color: 'var(--color-solar)' }}>{currentPeriod}/3</span>
        </div>
        <div style={{ marginLeft: '10px', borderLeft: '1px solid #333', paddingLeft: '20px' }}>
          <span className="mono status-label">PHASE:</span>
          <span className="mono phase-value">{getPhaseName(phase)}</span>
        </div>
      </div>
      
      <div className="timer-section">
        <Timer key={`${phase}-${currentDay}-${currentPeriod}`} duration={30} onExpiry={onTimerExpiry} />
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
