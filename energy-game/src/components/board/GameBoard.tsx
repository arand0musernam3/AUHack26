import React, { useState, useEffect } from 'react';
import { PhaseHeader } from './PhaseHeader';
import { MapPane } from './MapPane';
import { SidePane } from './SidePane';

export const GameBoard = ({ G, ctx, moves, playerID }: any) => {
  const [sel, setSel] = useState<any>(null);

  useEffect(() => {
    const name = ctx.playerMetadata?.[playerID]?.name;
    if (name && G.player_names[playerID] !== name) moves.setPlayerName(playerID, name);
  }, [ctx.playerMetadata, G.player_names, playerID, moves]);

  if (!G) return <div className="loading">Initializing Terminal...</div>;

  const isReady = (G.ready_players || []).includes(playerID);
  const PIPES = ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"];

  const onCountry = (id: string) => {
    if (sel && ctx.phase === 'actionDeployment' && !PIPES.includes(sel.type)) {
      moves.playActionCard(sel.card_id, id, false);
      setSel(null);
    }
  };

  const onPipe = (id: string) => {
    if (sel && ctx.phase === 'actionDeployment' && PIPES.includes(sel.type)) {
      moves.playActionCard(sel.card_id, id, true);
      setSel(null);
    }
  };

  const onSelect = (id: string) => {
    if (sel?.card_id === id) setSel(null);
    else {
      const c = G.action_cards[playerID].find((x: any) => x.card_id === id);
      if (c) setSel(c);
    }
  };

  const targetingPipe = sel && PIPES.includes(sel.type);

  return (
    <div className="game-board">
      <PhaseHeader 
        phase={ctx.phase || "loading"}
        onTimerExpiry={() => !isReady && moves.markReady()}
        isReady={isReady}
        onReadyClick={() => moves.markReady()}
        currentDay={G.current_day}
        currentPeriod={G.current_period || "1"}
      />

      <main className="game-layout">
        <MapPane 
          weather_data={G.modified_weather_data || {}} current_date={G.current_date} 
          pipes={G.pipes || []} onCountryClick={onCountry} onPipeClick={onPipe}
          activeModifiers={G.active_modifiers} activePipeModifiers={G.active_pipe_modifiers}
          pendingPlays={G.played_cards} isTargeting={!!sel}
          targetingType={targetingPipe ? 'pipe' : 'country'}
        />
        <SidePane 
          G={G} ctx={ctx} playerID={playerID} moves={moves} 
          selectedCardId={sel?.card_id || null} onSelectCard={onSelect}
        />
      </main>

      {sel && (
        <div className="targeting-overlay mono">
          SELECT {targetingPipe ? 'INTERCONNECTION PIPE' : 'TARGET COUNTRY'} ON MAP TO DEPLOY {sel.type.replace('_', ' ')}
          <button onClick={() => setSel(null)}>CANCEL</button>
        </div>
      )}

      {ctx.phase === 'resolution' && (
        <div className="resolution-overlay">
          <h1 className="mono" style={{ textAlign: 'center', color: 'var(--color-wind)' }}>DAY {G.current_day} SUMMARY — OPERATIONAL REPORT</h1>
          <div className="log-container">
            {(G.resolution_log?.length ? G.resolution_log : ["No atmospheric or infrastructure anomalies reported."]).map((l: string, i: number) => (
              <div key={i} className="log-entry mono">{l}</div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'auto' }}>
            <button className={`ready-button ${isReady ? 'is-ready' : ''}`} onClick={() => moves.markReady()} style={{ width: '300px' }}>
              {isReady ? 'WAITING FOR OTHERS...' : 'CONFIRM REPORT & START NEXT DAY'}
            </button>
          </div>
        </div>
      )}

      {ctx.gameover && (
        <div className="resolution-overlay game-over-overlay">
          <h1 className="mono" style={{ textAlign: 'center', color: 'var(--color-solar)', fontSize: '2.5rem' }}>GAME OVER</h1>
          <h2 className="mono" style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '30px' }}>FINAL MARKET LEADERBOARD</h2>
          <div className="leaderboard-container mono" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
            {ctx.gameover.leaderboard.map((e: any, i: number) => (
              <div key={i} className={`leaderboard-entry ${i === 0 ? 'winner' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: i === 0 ? 'rgba(255, 179, 0, 0.15)' : 'rgba(255,255,255,0.03)', border: i === 0 ? '1px solid var(--color-solar)' : '1px solid rgba(255,255,255,0.1)', marginBottom: '10px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '1.2rem', color: i === 0 ? 'var(--color-solar)' : 'var(--text-dim)' }}>#{i + 1}</span>
                  <span style={{ fontSize: '1.1rem' }}>{e.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', color: 'var(--color-wind)' }}>€{Math.round(e.score).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="ready-button" onClick={() => window.location.replace(window.location.origin + window.location.pathname)} style={{ width: '300px', background: 'var(--color-solar)', color: '#000' }}>EXIT TO LOBBY</button>
          </div>
        </div>
      )}
    </div>
  );
};
