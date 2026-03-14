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
    if (!p) return "TRANSITIONING...";
    switch (p) {
      case 'bidding': return 'AUCTION PHASE';
      case 'actionDeployment': return 'ACTION PHASE';
      case 'resolution': return 'DAY SUMMARY';
      default: return p.toUpperCase();
    }
  };

  // 5m (300s) for bidding, 2m (120s) for action, 1m (60s) for resolution
  const getPhaseDuration = (p: string | null) => {
    if (p === 'bidding') return 300;
    if (p === 'actionDeployment') return 120;
    return 60;
  };

  const phaseName = getPhaseName(phase);
  const duration = getPhaseDuration(phase);

  return (
    <header className="phase-header">
      <div className="game-stats">
        <div className="stat-item">
          <span className="label">DAY</span>
          <span className="value">{currentDay}</span>
        </div>
        <div className="stat-item">
          <span className="label">ROUND</span>
          <span className="value">{currentPeriod}/3</span>
        </div>
      </div>

      <div className="phase-info">
        <h1 className="phase-title">{phaseName}</h1>
        {/* Key forces timer reset on phase change */}
        <Timer 
          key={`${phase}-${currentDay}-${currentPeriod}`}
          initialSeconds={duration} 
          onExpiry={onTimerExpiry} 
        />
      </div>

      <div className="phase-actions">
        <button 
          className={`ready-button ${isReady ? 'is-ready' : ''}`}
          onClick={onReadyClick}
        >
          {isReady ? 'READY ✓' : 'MARK READY'}
        </button>
      </div>
    </header>
  );
};
