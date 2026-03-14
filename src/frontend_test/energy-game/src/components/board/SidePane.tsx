import React, { useState } from 'react';
import { ContractList } from '../contracts/ContractList';
import { PortfolioTab } from './PortfolioTab';
import { OperatorTab } from './OperatorTab';
import type { GameState } from '../../game/types';

interface SidePaneProps {
  G: GameState;
  ctx: any;
  playerID: string;
}

type TabType = 'market' | 'portfolio' | 'operator';

export const SidePane: React.FC<SidePaneProps> = ({ G, ctx, playerID }) => {
  const [activeTab, setActiveTab] = useState<TabType>('market');

  const playerBalances = G.player_balances || {};
  const readyPlayers = G.ready_players || [];
  const actionCards = G.action_cards ? G.action_cards[playerID] : [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'market':
        return <ContractList contracts={G.contracts} title="Market Terminal" />;
      case 'portfolio':
        return <PortfolioTab G={G} playerID={playerID} ctx={ctx} />;
      case 'operator':
        return (
          <OperatorTab 
            playerID={playerID}
            playerBalances={playerBalances}
            readyPlayers={readyPlayers}
            actionCards={actionCards || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="side-pane">
      <nav className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`} 
          onClick={() => setActiveTab('market')}
        >
          Market
        </button>
        <button 
          className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`} 
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button 
          className={`tab-btn ${activeTab === 'operator' ? 'active' : ''}`} 
          onClick={() => setActiveTab('operator')}
        >
          Operator
        </button>
      </nav>
      
      <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {renderTabContent()}
      </div>
    </section>
  );
};
