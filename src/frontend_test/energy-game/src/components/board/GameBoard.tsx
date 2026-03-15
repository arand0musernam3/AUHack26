import React, { useState } from 'react';
import type { GameState, ActionCardInstance } from '../../game/types';
import { PhaseHeader } from './PhaseHeader';
import { MapPane } from './MapPane';
import { SidePane } from './SidePane';
import { useEffect } from 'react';

export interface BoardProps {
  G: GameState;
  ctx: any;
  moves: {
    submitBid: (tradeId: string, price: number, volume: number) => void;
    playActionCard: (cardId: string, target?: string, isPipe?: boolean) => void;
    routeEnergy: (contractId: string, route: any[]) => void;
    buyActionCard: () => void;
    markReady: () => void;
    setPlayerName: (id: string, name: string) => void;
  };
  playerID: string;
  isActive: boolean;
  isMultiplayer: boolean;
}

export const GameBoard: React.FC<BoardProps> = ({ G, ctx, moves, playerID }) => {
  const [selectedCard, setSelectedCard] = useState<ActionCardInstance | null>(null);

  // Sync LOCAL player name from Lobby metadata
  useEffect(() => {
    if (!ctx.playerMetadata || !playerID) return;

    const myName = ctx.playerMetadata[playerID]?.name;
    if (myName && myName.trim() !== "" && G.player_names[playerID] !== myName) {
      console.log(`[GameBoard] Syncing local name for ${playerID}: ${myName}`);
      moves.setPlayerName(playerID, myName);
    }
  }, [ctx.playerMetadata, G.player_names, playerID, moves]);

  // Guard against undefined G
  if (!G) {
    return <div className="loading">Initializing Terminal...</div>;
  }

  const readyPlayers = G.ready_players || [];
  const isReady = readyPlayers.includes(playerID);

  const handleCountryClick = (countryId: string) => {
    if (selectedCard && ctx.phase === 'actionDeployment') {
      const isPipeCard = ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"].includes(selectedCard.type);
      if (!isPipeCard) {
        moves.playActionCard(selectedCard.card_id, countryId, false);
        setSelectedCard(null);
      }
    }
  };

  const handlePipeClick = (pipeId: string) => {
    if (selectedCard && ctx.phase === 'actionDeployment') {
      const isPipeCard = ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"].includes(selectedCard.type);
      if (isPipeCard) {
        moves.playActionCard(selectedCard.card_id, pipeId, true);
        setSelectedCard(null);
      }
    }
  };

  const handleSelectCard = (cardId: string) => {
    if (selectedCard?.card_id === cardId) {
      setSelectedCard(null);
    } else {
      const card = G.action_cards[playerID].find(c => c.card_id === cardId);
      if (card) setSelectedCard(card);
    }
  };

  const isTargetingPipe = selectedCard && ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"].includes(selectedCard.type);

  return (
    <div className="game-board">
      <PhaseHeader 
        phase={ctx.phase || "loading"}
        onTimerExpiry={() => {
          if (!isReady) moves.markReady();
        }}
        isReady={isReady}
        onReadyClick={() => moves.markReady()}
        currentDay={G.current_day}
        currentPeriod={G.current_period ? G.current_period.toString() : "1"}
      />

      <main className="game-layout">
        <MapPane 
          weather_data={G.modified_weather_data || {}} 
          current_date={G.current_date} 
          pipes={G.pipes || []} 
          onCountryClick={handleCountryClick}
          onPipeClick={handlePipeClick}
          activeModifiers={G.active_modifiers}
          activePipeModifiers={G.active_pipe_modifiers}
          pendingPlays={G.played_cards}
          isTargeting={!!selectedCard}
          targetingType={isTargetingPipe ? 'pipe' : 'country'}
        />
        <SidePane 
          G={G} 
          ctx={ctx} 
          playerID={playerID} 
          moves={moves} 
          selectedCardId={selectedCard?.card_id || null}
          onSelectCard={handleSelectCard}
        />
      </main>

      {selectedCard && (
        <div className="targeting-overlay mono">
          SELECT {isTargetingPipe ? 'INTERCONNECTION PIPE' : 'TARGET COUNTRY'} ON MAP TO DEPLOY {selectedCard.type.replace('_', ' ')}
          <button onClick={() => setSelectedCard(null)}>CANCEL</button>
        </div>
      )}

      {ctx.phase === 'resolution' && (
        <div className="resolution-overlay">
          <h1 className="mono" style={{ textAlign: 'center', color: 'var(--color-wind)' }}>DAY {G.current_day} SUMMARY — OPERATIONAL REPORT</h1>
          <div className="log-container">
            {G.resolution_log && G.resolution_log.length > 0 ? (
              G.resolution_log.map((log, i) => (
                <div key={i} className="log-entry mono">{log}</div>
              ))
            ) : (
              <div className="log-entry mono">No atmospheric or infrastructure anomalies reported.</div>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'auto' }}>
            <button 
              className={`ready-button ${isReady ? 'is-ready' : ''}`}
              onClick={() => moves.markReady()}
              style={{ width: '300px' }}
            >
              {isReady ? 'WAITING FOR OTHERS...' : 'CONFIRM REPORT & START NEXT DAY'}
            </button>
          </div>
        </div>
      )}

      {ctx.gameover && (
        <div className="resolution-overlay game-over-overlay">
          <h1 className="mono" style={{ textAlign: 'center', color: 'var(--color-solar)', fontSize: '2.5rem' }}>GAME OVER</h1>
          <h2 className="mono" style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '30px' }}>FINAL MARKET LEADERBOARD</h2>
          
          <div className="leaderboard-container mono" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            margin: '0 auto',
            maxHeight: '60vh',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {ctx.gameover.leaderboard.map((entry: any, i: number) => (
              <div key={i} className={`leaderboard-entry ${i === 0 ? 'winner' : ''}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px',
                background: i === 0 ? 'rgba(255, 179, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: i === 0 ? '1px solid var(--color-solar)' : '1px solid rgba(255,255,255,0.1)',
                marginBottom: '10px',
                borderRadius: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '1.2rem', color: i === 0 ? 'var(--color-solar)' : 'var(--text-dim)' }}>#{i + 1}</span>
                  <span style={{ fontSize: '1.1rem' }}>{entry.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', color: 'var(--color-wind)' }}>€{Math.round(entry.score).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button 
              className="ready-button"
              onClick={() => {
                // Clear any stored match credentials to avoid "already joined" errors on new matches
                localStorage.clear();
                sessionStorage.clear();
                
                // Redirect to base URL using replace to avoid back-history issues
                window.location.replace(window.location.origin + window.location.pathname);
              }}
              style={{ width: '300px', background: 'var(--color-solar)', color: '#000' }}
            >
              EXIT TO LOBBY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
