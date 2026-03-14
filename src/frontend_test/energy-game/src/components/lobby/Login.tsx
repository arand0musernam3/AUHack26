import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  console.log('Login component rendering');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">ENERGY MARKET</h1>
        <p className="login-subtitle">Industrial Control Room Terminal</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="player-name">ENTER OPERATOR NAME</label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OPERATOR_01"
              autoFocus
              className="login-input mono"
            />
          </div>
          <button type="submit" className="login-button mono" disabled={!name.trim()}>
            INITIALIZE SESSION
          </button>
        </form>
      </div>
    </div>
  );
};
