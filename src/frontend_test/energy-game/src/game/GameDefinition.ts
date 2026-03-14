import { INVALID_MOVE } from 'boardgame.io/dist/cjs/core.js';
import type { Ctx } from 'boardgame.io';
import type {
  EnergyType,
  Contract,
  Conduct,
  ActionCardType,
  ActionCardInstance,
  GameState,
  ActiveModifier,
  CountryWeatherData,
} from "./types";

import * as weatherReader from "./weatherReader";

const COUNTRIES = [
  "DE", "FR", "ES", "PT", "IT", "NL", "BE", "DK", "NO", "SE", "FI", "PL", "CZ", "AT", "CH",
];
const ENERGY_TYPES: EnergyType[] = [
  "Wind", "Solar", "Water", "Fossil", "Nuclear",
];

const MODIFIER_CONFIGS: Partial<Record<ActionCardType, any>> = {
  'POLAR_VORTEX': { Wind: 1.30, Solar: 0.10, Fossil: 0.95, Nuclear: 1.0, Water: 1.0, Consumption: 1.15, Price: 1.20 },
  'HEAT_DOME': { Wind: 0.80, Solar: 1.50, Fossil: 1.05, Nuclear: 0.85, Water: 0.70, Consumption: 1.10, Price: 1.15 },
  'MONSOON': { Wind: 0.60, Solar: 0.20, Fossil: 1.10, Nuclear: 1.0, Water: 1.40, Consumption: 0.95, Price: 1.05 },
  'DEAD_CALM': { Wind: 0.10, Solar: 1.20, Fossil: 1.10, Nuclear: 1.10, Water: 1.0, Consumption: 0.90, Price: 0.95 }
};

const MODIFIER_FIELDS = ['Wind', 'Solar', 'Fossil', 'Nuclear', 'Water', 'Consumption', 'Price'];

function applyModifiersToState(G: GameState) {
  const newModified: CountryWeatherData = JSON.parse(JSON.stringify(G.weather_data));
  
  Object.keys(newModified).forEach(country => {
    const mods = G.active_modifiers[country] || [];
    mods.forEach(mod => {
      const config = MODIFIER_CONFIGS[mod.type];
      if (config) {
        // Apply to current
        MODIFIER_FIELDS.forEach(field => {
          const multiplier = config[field] ?? 1.0;
          (newModified[country].current as any)[field] *= multiplier;
        });
        // Apply to forecast
        newModified[country].forecast.forEach(f => {
          MODIFIER_FIELDS.forEach(field => {
            const multiplier = config[field] ?? 1.0;
            (f as any)[field] *= multiplier;
          });
        });
      }
    });
  });
  
  G.modified_weather_data = newModified;
}

const generateMockContracts = (): Record<string, Contract> => {
  const contracts: Record<string, Contract> = {};
  let id = 1;
  COUNTRIES.slice(0, 5).forEach((country) => {
    ENERGY_TYPES.forEach((type) => {
      const contractId = `c${id++}`;
      contracts[contractId] = {
        contract_id: contractId,
        origin_country: country,
        energy_type: type,
        available_volume: Math.floor(Math.random() * 500) + 100,
        base_price: Math.floor(Math.random() * 50) + 20,
        bids: [],
        delivery_country: "DE",
      };
    });
  });
  return contracts;
};

const generateMockConducts = (): Conduct[] => {
  return [
    { origin: "DE", destination: "FR", base_cost: 5, volume_capacity: 1000, is_broken: false },
    { origin: "DE", destination: "DK", base_cost: 3, volume_capacity: 800, is_broken: false },
    { origin: "FR", destination: "ES", base_cost: 4, volume_capacity: 600, is_broken: false },
    { origin: "NO", destination: "DK", base_cost: 2, volume_capacity: 1200, is_broken: false },
    { origin: "IT", destination: "AT", base_cost: 6, volume_capacity: 400, is_broken: false },
  ];
};

const WEATHER_CARD_TYPES: ActionCardType[] = [
  "POLAR_VORTEX", "HEAT_DOME", "MONSOON", "DEAD_CALM"
];

const OTHER_CARD_TYPES: ActionCardType[] = [
  "BOOST_ENERGY", "NERF_ENERGY", "CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT", "NOPE_CARD",
];

const ALL_CARD_TYPES = [...WEATHER_CARD_TYPES, ...OTHER_CARD_TYPES];

const advanceDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 16);
};

export const EnergyGame = {
  name: "energy-market",
  maxPlayers: 5,

  setup: ({ ctx }: { ctx: Ctx }): GameState => {
    const player_balances: Record<string, number> = {};
    const player_names: Record<string, string> = {};
    const action_cards: Record<string, ActionCardInstance[]> = {};

    for (let i = 0; i < ctx.numPlayers; i++) {
      const playerId = i.toString();
      player_balances[playerId] = 100000;
      player_names[playerId] = `OP_${playerId}`; 
      action_cards[playerId] = Array.from({ length: 2 }).map((_, idx) => ({
        card_id: `card-${playerId}-${idx}-${Date.now()}`,
        type: ALL_CARD_TYPES[Math.floor(Math.random() * ALL_CARD_TYPES.length)],
        face_down: false,
        duration: Math.floor(Math.random() * 3) + 2,
      }));
    }

    let weather_data = {};
    let current_date = '2024-01-01T00:00';
    let pipes: any[] = [];

    if (typeof window === 'undefined') {
      current_date = weatherReader.getRandomWeatherDate();
      weather_data = weatherReader.loadWeatherForDate(current_date);
      pipes = weatherReader.getHistoricalPipes(Object.keys(weather_data));
    }

    const G: GameState = {
      phase_number: 1,
      current_day: 1,
      total_days: 5,
      current_period: 1,
      periods_completed: [],
      contracts: generateMockContracts(),
      player_balances,
      player_names,
      ready_players: [],
      conducts: generateMockConducts(),
      action_cards,
      played_cards: [],
      active_modifiers: {},
      weather_data,
      modified_weather_data: weather_data,
      current_date,
      pipes,
      phase_deadline: null,
      resolution_log: [],
    };

    applyModifiersToState(G);
    return G;
  },

  phases: {
    bidding: {
      start: true,
      onBegin: ({ G }) => {
        G.ready_players = [];
        G.contracts = generateMockContracts();
      },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: "actionDeployment",
      onEnd: ({ G }) => {
        Object.keys(G.contracts).forEach(id => {
          const contract = G.contracts[id];
          if (contract.bids.length === 0) return;
          const maxPrice = Math.max(...contract.bids.map(b => b.price));
          const winners = contract.bids.filter(b => b.price === maxPrice);
          const volPerWinner = contract.available_volume / winners.length;
          winners.forEach(bid => {
            const cost = maxPrice * volPerWinner;
            if (G.player_balances[bid.player_id] >= cost) {
              G.player_balances[bid.player_id] -= cost;
            }
          });
          contract.bids = [];
        });
        G.ready_players = [];
      }
    },

    actionDeployment: {
      onBegin: ({ G }) => {
        G.ready_players = [];
      },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: ({ G }) => (G.current_period < 3 ? "bidding" : "resolution"),
      onEnd: ({ G }) => {
        if (G.current_period < 3) {
          G.current_period++;
        }
        G.ready_players = [];
      },
    },

    resolution: {
      onBegin: ({ G }) => {
        G.ready_players = [];
        G.resolution_log = [];

        // 1. Resolve Weather Votes
        const votesByCountry: Record<string, ActionCardInstance[]> = {};
        G.played_cards.forEach(pc => {
          if (pc.target_country && WEATHER_CARD_TYPES.includes(pc.card.type)) {
            if (!votesByCountry[pc.target_country]) votesByCountry[pc.target_country] = [];
            votesByCountry[pc.target_country].push(pc.card);
          }
        });

        Object.entries(votesByCountry).forEach(([country, cards]) => {
          const winningCard = cards[Math.floor(Math.random() * cards.length)];
          const newModifier: ActiveModifier = {
            type: winningCard.type,
            remaining_days: winningCard.duration,
            original_duration: winningCard.duration
          };
          G.active_modifiers[country] = [newModifier];
          G.resolution_log.push(`${country} hit by ${winningCard.type} for ${winningCard.duration} days!`);
        });

        // 2. Decrement and clean up active modifiers
        Object.keys(G.active_modifiers).forEach(country => {
          G.active_modifiers[country] = G.active_modifiers[country].filter(mod => {
            mod.remaining_days--;
            if (mod.remaining_days <= 0) {
              G.resolution_log.push(`${mod.type} in ${country} has expired.`);
              return false;
            }
            return true;
          });
          if (G.active_modifiers[country].length === 0) {
            delete G.active_modifiers[country];
          }
        });

        G.played_cards = [];
        applyModifiersToState(G);
      },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: "bidding",
      onEnd: ({ G }) => {
        if (G.current_day < G.total_days) {
          G.current_day++;
          G.current_period = 1;
          G.current_date = advanceDate(G.current_date);
          if (typeof window === 'undefined') {
            G.weather_data = weatherReader.loadWeatherForDate(G.current_date);
          }
          applyModifiersToState(G);
        }
        G.phase_number++;
        G.ready_players = [];
      },
    },
  },

  moves: {
    setPlayerName: ({ G }, id: string, name: string) => {
      G.player_names[id] = name;
    },
    submitBid: ({ G, playerID }, tradeId: string, price: number, volume: number) => {
      if (!G.contracts[tradeId]) return INVALID_MOVE;
      G.contracts[tradeId].bids.push({ player_id: playerID, price, volume });
    },
    playActionCard: ({ G, playerID }, cardId: string, targetCountryId?: string, faceDown?: boolean) => {
      const playerCards = G.action_cards[playerID] || [];
      const cardIndex = playerCards.findIndex((c) => c.card_id === cardId);
      if (cardIndex === -1) return INVALID_MOVE;
      const [card] = playerCards.splice(cardIndex, 1);
      
      G.played_cards.push({
        player_id: playerID,
        card: { ...card, face_down: !!faceDown },
        target_country: targetCountryId,
      });
    },
    buyActionCard: ({ G, playerID }) => {
      const COST = 5000;
      if (G.player_balances[playerID] < COST) return INVALID_MOVE;
      G.player_balances[playerID] -= COST;
      G.action_cards[playerID].push({
        card_id: `card-${playerID}-${Date.now()}`,
        type: ALL_CARD_TYPES[Math.floor(Math.random() * ALL_CARD_TYPES.length)],
        face_down: false,
        duration: Math.floor(Math.random() * 3) + 2,
      });
    },
    markReady: ({ G, playerID }) => {
      const index = G.ready_players.indexOf(playerID);
      if (index === -1) {
        G.ready_players.push(playerID);
      } else {
        G.ready_players.splice(index, 1);
      }
    },
  },

  turn: {
    activePlayers: { all: "main" },
    stages: {
      main: {}
    }
  },
};
