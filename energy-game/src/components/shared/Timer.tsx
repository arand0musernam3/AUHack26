import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  initialSeconds: number;
  onExpiry: () => void;
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds = 60, onExpiry }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const expiryCalled = useRef(false);

  useEffect(() => {
    // Reset timer when initialSeconds or key changes (via parent)
    setTimeLeft(initialSeconds);
    expiryCalled.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!expiryCalled.current) {
        expiryCalled.current = true;
        onExpiry();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpiry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = initialSeconds > 0 ? (timeLeft / initialSeconds) * 100 : 0;
  const isWarning = timeLeft <= 10;

  return (
    <div className="timer-container" style={{ width: '100%', maxWidth: '200px' }}>
      <div className="timer-labels mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
        <span style={{ color: isWarning ? 'var(--color-fossil)' : 'inherit' }}>
          {formatTime(timeLeft)}
        </span>
        <span style={{ opacity: 0.6 }}>{Math.round(percentage)}%</span>
      </div>
      <div className="timer-bar-bg" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div 
          className={`timer-bar-fill ${isWarning ? 'warning' : ''}`} 
          style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            background: isWarning ? 'var(--color-fossil)' : 'var(--color-wind)',
            transition: 'width 1s linear, background-color 0.3s'
          }}
        />
      </div>
    </div>
  );
};
