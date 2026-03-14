import React, { useState } from 'react';
import { ContractList } from '../contracts/ContractList';
import { PortfolioTab } from './PortfolioTab';
import { OperatorTab } from './OperatorTab';
import type { GameState } from '../../game/types';

interface SidePaneProps {
  G: GameState;
  ctx: any;
  playerID: string;
  moves: {
    submitBid: (tradeId: string, price: number, volume: number) => void;
    playActionCard: (cardId: string, target?: string, faceDown?: boolean) => void;
    routeEnergy: (contractId: string, route: any[]) => void;
    buyActionCard: () => void;
    markReady: () => void;
  };
}

type TabType = 'market' | 'portfolio' | 'operator';

export const SidePane: React.FC<SidePaneProps> = ({ G, ctx, playerID, moves }) => {
  const [activeTab, setActiveTab] = useState<TabType>('market');

  console.log(G.action_cards);
  const playerBalances = G.player_balances || {};
  const readyPlayers = G.ready_players || [];
  const actionCards = G.action_cards ? G.action_cards[playerID] : [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'market':
        return (
          <ContractList 
            contracts={G.contracts} 
            title="Market Terminal" 
            onBid={(tradeId, price, volume) => moves.submitBid(tradeId, price, volume)}
          />
        );
      case 'portfolio':
        return <PortfolioTab G={G} playerID={playerID} ctx={ctx} />;
      case 'operator':
        return (
          <OperatorTab 
            playerID={playerID}
            playerBalances={playerBalances}
            playerNames={G.player_names || {}}
            readyPlayers={readyPlayers}
            actionCards={actionCards || []}
            onBuyCard={() => moves.buyActionCard()}
            onDeployCard={(cardId) => moves.playActionCard(cardId)}
            ctx={ctx}
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
