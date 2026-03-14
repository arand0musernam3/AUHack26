import React, { useState } from 'react';
import type { GameState } from '../../game/types';
import { PortfolioTab } from './PortfolioTab';
import { OperatorTab } from './OperatorTab';
import { ContractList } from '../contracts/ContractList';

interface SidePaneProps {
  G: GameState;
  ctx: any;
  playerID: string;
  moves: any;
  selectedCardId?: string | null;
  onSelectCard?: (cardId: string) => void;
}

export const SidePane: React.FC<SidePaneProps> = ({ 
  G, 
  ctx, 
  playerID, 
  moves,
  selectedCardId,
  onSelectCard
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'portfolio' | 'operators'>('contracts');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contracts':
        return (
          <div className="tab-pane active">
            {ctx.phase !== 'bidding' && (
              <div className="phase-restriction-notice">
                Bidding is only allowed during the AUCTION phase.
              </div>
            )}
            <ContractList 
              contracts={G.contracts} 
              onBid={(id, price, vol) => moves.submitBid(id, price, vol)}
              disabled={ctx.phase !== 'bidding'}
            />
          </div>
        );
      case 'portfolio':
        return (
          <div className="tab-pane active">
             {ctx.phase !== 'actionDeployment' && (
              <div className="phase-restriction-notice">
                Actions can only be deployed during the ACTION phase.
              </div>
            )}
            <PortfolioTab 
              G={G} 
              playerID={playerID} 
              ctx={ctx}
              onPlayCard={(id, target, faceDown) => moves.playActionCard(id, target, faceDown)}
              onBuyCard={() => moves.buyActionCard()}
              disabled={ctx.phase !== 'actionDeployment'}
              selectedCardId={selectedCardId}
              onSelectCard={onSelectCard}
            />
          </div>
        );
      case 'operators':
        return (
          <div className="tab-pane active">
            <OperatorTab 
              playerID={playerID}
              playerBalances={G.player_balances}
              playerNames={G.player_names}
              readyPlayers={G.ready_players}
              actionCards={G.action_cards[playerID] || []}
              onBuyCard={() => moves.buyActionCard()}
              onDeployCard={(id) => moves.playActionCard(id)}
              ctx={ctx}
            />
          </div>
        );
    }
  };

  return (
    <aside className="side-pane">
      <nav className="side-nav">
        <button 
          className={activeTab === 'contracts' ? 'active' : ''} 
          onClick={() => setActiveTab('contracts')}
        >
          CONTRACTS
        </button>
        <button 
          className={activeTab === 'portfolio' ? 'active' : ''} 
          onClick={() => setActiveTab('portfolio')}
        >
          PORTFOLIO
        </button>
        <button 
          className={activeTab === 'operators' ? 'active' : ''} 
          onClick={() => setActiveTab('operators')}
        >
          OPERATORS
        </button>
      </nav>

      <div className="side-content">
        {renderTabContent()}
      </div>
    </aside>
  );
};
