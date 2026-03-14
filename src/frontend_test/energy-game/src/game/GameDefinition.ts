import { INVALID_MOVE } from 'boardgame.io/core';
import type { EnergyType, Contract, Conduct, ActionCardType, GameState } from './types';

const COUNTRIES = ['DE', 'FR', 'ES', 'PT', 'IT', 'NL', 'BE', 'DK', 'NO', 'SE', 'FI', 'PL', 'CZ', 'AT', 'CH'];
const ENERGY_TYPES: EnergyType[] = ['Wind', 'Solar', 'Water', 'Fossil', 'Nuclear'];

const generateMockContracts = (): Record<string, Contract> => {
  const contracts: Record<string, Contract> = {};
  let id = 1;
  // Generate a few contracts for initial UI testing
  COUNTRIES.slice(0, 5).forEach(country => {
    ENERGY_TYPES.forEach(type => {
      const contractId = `c${id++}`;
      contracts[contractId] = {
        contract_id: contractId,
        origin_country: country,
        energy_type: type,
        available_volume: Math.floor(Math.random() * 500) + 100,
        base_price: Math.floor(Math.random() * 50) + 20,
        bids: [],
        delivery_country: 'DE',
      };
    });
  });
  return contracts;
};

const generateMockConducts = (): Conduct[] => {
  return [
    { origin: 'DE', destination: 'FR', base_cost: 5, volume_capacity: 1000, is_broken: false },
    { origin: 'DE', destination: 'DK', base_cost: 3, volume_capacity: 800, is_broken: false },
    { origin: 'FR', destination: 'ES', base_cost: 4, volume_capacity: 600, is_broken: false },
    { origin: 'NO', destination: 'DK', base_cost: 2, volume_capacity: 1200, is_broken: false },
    { origin: 'IT', destination: 'AT', base_cost: 6, volume_capacity: 400, is_broken: false },
  ];
};

const ACTION_CARD_TYPES: ActionCardType[] = [
  'POLAR_VORTEX', 'HEAT_DOME', 'MONSOON', 'DEAD_CALM',
  'BOOST_ENERGY', 'NERF_ENERGY',
  'CUT_CONDUCT', 'FIX_CONDUCT', 'DISCOUNT_CONDUCT',
  'NOPE_CARD'
];

export const EnergyGame = {
  name: 'energy-market',

  setup: (ctx: any): GameState => {
    const player_balances: Record<string, number> = {};
    const action_cards: Record<string, any[]> = {};

    // Initialize players
    for (let i = 0; i < ctx.numPlayers; i++) {
      player_balances[i.toString()] = 1000000;
      action_cards[i.toString()] = [
        {
          card_id: `card-${i}-1`,
          type: ACTION_CARD_TYPES[Math.floor(Math.random() * ACTION_CARD_TYPES.length)],
          face_down: false
        }
      ];
    }

    const contracts = generateMockContracts();
    
    // Add some random bids for initial testing
    Object.keys(contracts).forEach(id => {
      // 30% chance of having bids
      if (Math.random() > 0.7) {
        const numBids = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numBids; i++) {
          const myId = "0";
          contracts[id].bids.push({
            player_id: myId,
            price: contracts[id].base_price + Math.floor(Math.random() * 20) + 5,
            volume: Math.floor(Math.random() * (contracts[id].available_volume / 2)) + 10,
          });
        }

      } else {
        // add some bids from other players
        const otherPlayerId = Math.floor(Math.random() * ctx.numPlayers).toString();
          contracts[id].bids.push({
            player_id: otherPlayerId,
            price: contracts[id].base_price + Math.floor(Math.random() * 20) + 5,
            volume: Math.floor(Math.random() * (contracts[id].available_volume / 2)) + 10,
          });
      }
    });

    return {
      phase_number: 1,
      contracts,
      player_balances,
      ready_players: [],
      conducts: generateMockConducts(),
      action_cards,
      played_cards: [],
      forecast: {
        description: "High winds expected in the North Sea",
        affected_country: "DK",
        probability: 0.8,
        weather_feature: 'wind_speed_10m (km/h)',
        direction: 'increase'
      }
    };
  },


  phases: {
    forecasting: {
      start: true,
      next: 'actionDeployment',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState, ctx: any) => (G.ready_players || []).length >= 1, // Simplified for testing
    },
    actionDeployment: {
      next: 'bidding',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState, ctx: any) => (G.ready_players || []).length >= 1,
    },
    bidding: {
      next: 'resolution',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState, ctx: any) => (G.ready_players || []).length >= 1,
    },
    resolution: {
      next: 'forecasting',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState, ctx: any) => (G.ready_players || []).length >= 1,
    },
  },

  moves: {
    submitBid: (G: GameState, ctx: any, tradeId: string, price: number, volume: number) => {
      if (!G.contracts[tradeId]) return INVALID_MOVE;
      G.contracts[tradeId].bids.push({
        player_id: ctx.playerID,
        price,
        volume,
      });
    },
    playActionCard: (G: GameState, ctx: any, cardId: string, targetCountryId?: string, faceDown?: boolean) => {
      const playerCards = G.action_cards[ctx.playerID] || [];
      const cardIndex = playerCards.findIndex(c => c.card_id === cardId);
      if (cardIndex === -1) return INVALID_MOVE;

      const [card] = playerCards.splice(cardIndex, 1);
      G.played_cards.push({
        player_id: ctx.playerID,
        card: { ...card, face_down: !!faceDown },
        target_country: targetCountryId,
        rounds_remaining: 3,
      });
    },
    routeEnergy: (G: GameState, ctx: any, contractId: string, route: any[]) => {
      // Logic for routing energy
    },
    buyActionCard: (G: GameState, ctx: any) => {
      // Logic for buying a card
    },
    markReady: (G: GameState, ctx: any) => {
      if (!G.ready_players) G.ready_players = [];
      if (!G.ready_players.includes(ctx.playerID)) {
        G.ready_players.push(ctx.playerID);
      }
    },
  },

  turn: {
    activePlayers: { all: 'stage' },
  },
};
