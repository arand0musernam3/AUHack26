import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number; // in seconds
  onExpiry: () => void;
}

export const Timer: React.FC<TimerProps> = ({ duration, onExpiry }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpiry();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpiry]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 10;

  return (
    <div className="timer-container">
      <div className="timer-labels mono">
        <span>00:{timeLeft.toString().padStart(2, '0')}</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="timer-bar-bg">
        <div 
          className={`timer-bar-fill ${isWarning ? 'warning' : ''}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
