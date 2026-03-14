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
  ActivePipeModifier,
} from "./types";

import * as weatherReader from "./weatherReader";

const COUNTRIES = [
  "DE", "FR", "ES", "PT", "IT", "NL", "BE", "DK", "NO", "SE", "FI", "PL", "CZ", "AT", "CH",
];
const ENERGY_TYPES: EnergyType[] = [
  "Wind", "Solar", "Water", "Fossil", "Nuclear",
];

/**
 * Deterministically generates contracts for a given day range.
 * Current day gets the most contracts, following days get progressively fewer.
 */
const generateDeterministicContracts = (currentDay: number, totalDays: number): Record<string, Contract> => {
const MODIFIER_CONFIGS: Partial<Record<ActionCardType, any>> = {
  'POLAR_VORTEX': { Wind: 1.30, Solar: 0.10, Fossil: 0.95, Nuclear: 1.0, Water: 1.0, Consumption: 1.15, Price: 1.20 },
  'HEAT_DOME': { Wind: 0.80, Solar: 1.50, Fossil: 1.05, Nuclear: 0.85, Water: 0.70, Consumption: 1.10, Price: 1.15 },
  'MONSOON': { Wind: 0.60, Solar: 0.20, Fossil: 1.10, Nuclear: 1.0, Water: 1.40, Consumption: 0.95, Price: 1.05 },
  'DEAD_CALM': { Wind: 0.10, Solar: 1.20, Fossil: 1.10, Nuclear: 1.10, Water: 1.0, Consumption: 0.90, Price: 0.95 },
  'BOOST_ENERGY': { Price: 1.50 },
  'NERF_ENERGY': { Price: 0.50 }
};

const MODIFIER_FIELDS = ['Wind', 'Solar', 'Fossil', 'Nuclear', 'Water', 'Consumption', 'Price'];

function applyModifiersToState(G: GameState) {
  const newModified: CountryWeatherData = JSON.parse(JSON.stringify(G.weather_data));
  
  Object.keys(newModified).forEach(country => {
    const mods = G.active_modifiers[country] || [];
    mods.forEach(mod => {
      const config = MODIFIER_CONFIGS[mod.type];
      if (config) {
        MODIFIER_FIELDS.forEach(field => {
          const multiplier = config[field] ?? 1.0;
          (newModified[country].current as any)[field] *= multiplier;
        });
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

  // Refresh conduct states based on active pipe modifiers
  G.conducts.forEach(c => {
    c.is_broken = G.active_pipe_modifiers.some(m => m.type === 'CUT_CONDUCT' && 
      m.target.from === c.origin && m.target.to === c.destination);
    c.discount_active = G.active_pipe_modifiers.some(m => m.type === 'DISCOUNT_CONDUCT' && 
      m.target.from === c.origin && m.target.to === c.destination);
  });
}

const generateMockContracts = (): Record<string, Contract> => {
  const contracts: Record<string, Contract> = {};
  
  // Deterministic values for volume and base price based on day, country, and type
  const getVol = (day: number, cIdx: number, tIdx: number) => {
    const base = 500 - (day - 1) * 50; // Further days have less volume
    const seed = (day * 100) + (cIdx * 10) + tIdx;
    return Math.max(100, base + (seed % 200));
  };
  
  const getPrice = (day: number, cIdx: number, tIdx: number) => {
    const seed = (day * 50) + (cIdx * 5) + tIdx;
    return 20 + (seed % 30);
  };

  // Generate contracts for current day and next 2 days
  for (let d = currentDay; d <= Math.min(currentDay + 2, totalDays); d++) {
    // Number of countries depends on day: most on day 1
    const countryCount = Math.max(2, 6 - (d - currentDay) * 2);
    
    for (let c = 0; c < countryCount; c++) {
      const country = COUNTRIES[c % COUNTRIES.length];
      for (let t = 0; t < ENERGY_TYPES.length; t++) {
        const type = ENERGY_TYPES[t];
        const contractId = `d${d}-c${c}-t${t}`;
        contracts[contractId] = {
          contract_id: contractId,
          origin_country: country,
          energy_type: type,
          available_volume: getVol(d, c, t),
          base_price: getPrice(d, c, t),
          bids: [],
          delivery_country: "DE",
          delivery_day: d,
        };
      }
    }
  }
  
  return contracts;
};

const generateMockConducts = (): Conduct[] => {
  return [
    { origin: "Germany", destination: "France", base_cost: 5, volume_capacity: 1000, is_broken: false, discount_active: false },
    { origin: "Germany", destination: "Denmark", base_cost: 3, volume_capacity: 800, is_broken: false, discount_active: false },
    { origin: "France", destination: "Spain", base_cost: 4, volume_capacity: 600, is_broken: false, discount_active: false },
    { origin: "Norway", destination: "Denmark", base_cost: 2, volume_capacity: 1200, is_broken: false, discount_active: false },
    { origin: "Italy", destination: "Austria", base_cost: 6, volume_capacity: 400, is_broken: false, discount_active: false },
  ];
};

const WEATHER_CARD_TYPES: ActionCardType[] = ["POLAR_VORTEX", "HEAT_DOME", "MONSOON", "DEAD_CALM"];
const PRICE_CARD_TYPES: ActionCardType[] = ["BOOST_ENERGY", "NERF_ENERGY"];
const PIPE_CARD_TYPES: ActionCardType[] = ["CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"];
const ALL_CARD_TYPES = [...WEATHER_CARD_TYPES, ...PRICE_CARD_TYPES, ...PIPE_CARD_TYPES];

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

    const total_days = 5;
    
    const G: GameState = {
      phase_number: 1,
      current_day: 1,
      total_days,
      current_period: 1,
      periods_completed: [],
      contracts: generateDeterministicContracts(1, total_days),
      player_balances,
      player_names,
      ready_players: [],
      conducts: generateMockConducts(),
      action_cards,
      played_cards: [],
      active_modifiers: {},
      active_pipe_modifiers: [],
      weather_data,
      modified_weather_data: weather_data,
      current_date,
      pipes,
      phase_deadline: null,
      positions: [],
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
        // Refresh contracts, keeping existing ones that have bids
        const newContracts = generateDeterministicContracts(G.current_day, G.total_days);
        
        // Merge: keep old if it has bids or is for the current day
        const merged: Record<string, Contract> = {};
        
        // 1. Keep any old contract that has bids or is NOT in the past
        Object.keys(G.contracts).forEach(id => {
          const c = G.contracts[id];
          if (c.bids.length > 0 || c.delivery_day >= G.current_day) {
            merged[id] = c;
          }
        });
        
        // 2. Add new contracts if they don't exist
        Object.keys(newContracts).forEach(id => {
          if (!merged[id]) {
            merged[id] = newContracts[id];
          }
        });
        
        G.contracts = merged;
      },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: "actionDeployment",
      onEnd: ({ G }) => {
        Object.keys(G.contracts).forEach(id => {
          const contract = G.contracts[id];
          // Only evaluate contracts for the CURRENT day that have bids
          if (contract.delivery_day !== G.current_day || contract.bids.length === 0) return;
          
          const maxPrice = Math.max(...contract.bids.map(b => b.price));
          const winners = contract.bids.filter(b => b.price === maxPrice);
          const volPerWinner = contract.available_volume / winners.length;
          
          winners.forEach(bid => {
            const cost = maxPrice * volPerWinner;
            if (G.player_balances[bid.player_id] >= cost) {
              G.player_balances[bid.player_id] -= cost;
              G.positions.push({
                player_id: bid.player_id,
                contract_id: contract.contract_id,
                origin_country: contract.origin_country,
                energy_type: contract.energy_type,
                volume: volPerWinner,
                bid_price: maxPrice,
                base_price: contract.base_price,
                is_short: !!bid.is_short,
                day_placed: G.current_day,
                period_placed: G.current_period
              });
            }
          });
          // Clear bids as they are now positions
          contract.bids = [];
        });
        
        // Cleanup: remove any contract for current day (they are processed)
        // or any past contract with no bids.
        Object.keys(G.contracts).forEach(id => {
          const c = G.contracts[id];
          if (c.delivery_day < G.current_day && c.bids.length === 0) {
            delete G.contracts[id];
          }
          if (c.delivery_day === G.current_day) {
             delete G.contracts[id];
          }
        });

        G.ready_players = []; // Extra safety
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

        // 1. Resolve Weather & Price Votes (PROPORTIONAL)
        const countryVotes: Record<string, ActionCardInstance[]> = {};
        G.played_cards.forEach(pc => {
          if (pc.target_country && [...WEATHER_CARD_TYPES, ...PRICE_CARD_TYPES].includes(pc.card.type)) {
            if (!countryVotes[pc.target_country]) countryVotes[pc.target_country] = [];
            countryVotes[pc.target_country].push(pc.card);
          }
        });

        Object.entries(countryVotes).forEach(([country, cards]) => {
          const winningCard = cards[Math.floor(Math.random() * cards.length)];
          const newModifier: ActiveModifier = {
            type: winningCard.type,
            remaining_days: winningCard.duration,
            original_duration: winningCard.duration
          };
          G.active_modifiers[country] = [newModifier];
          G.resolution_log.push(`${country}: ${winningCard.type} implemented (${winningCard.duration}d).`);
        });

        // 2. Resolve Pipe Actions (INSTANT or ROUND-BASED)
        G.played_cards.forEach(pc => {
          if (pc.target_pipe) {
            const { from, to } = pc.target_pipe;
            if (pc.card.type === 'FIX_CONDUCT') {
              G.active_pipe_modifiers = G.active_pipe_modifiers.filter(m => 
                !(m.type === 'CUT_CONDUCT' && m.target.from === from && m.target.to === to)
              );
              G.resolution_log.push(`INFRASTRUCTURE: ${from} ⇹ ${to} conduct repaired.`);
            } else if (pc.card.type === 'CUT_CONDUCT') {
              const rounds = Math.floor(Math.random() * 2) + 1;
              G.active_pipe_modifiers.push({ type: 'CUT_CONDUCT', target: { from, to }, remaining_rounds: rounds });
              G.resolution_log.push(`SABOTAGE: ${from} ⇹ ${to} conduct severed for ${rounds} rounds.`);
            } else if (pc.card.type === 'DISCOUNT_CONDUCT') {
              const rounds = Math.floor(Math.random() * 3) + 1;
              G.active_pipe_modifiers.push({ type: 'DISCOUNT_CONDUCT', target: { from, to }, remaining_rounds: rounds });
              G.resolution_log.push(`SUBSIDY: ${from} ⇹ ${to} transit fees discounted for ${rounds} rounds.`);
            }
          }
        });

        // 3. Decrement and clean up active modifiers
        Object.keys(G.active_modifiers).forEach(country => {
          G.active_modifiers[country] = G.active_modifiers[country].filter(mod => {
            mod.remaining_days--;
            if (mod.remaining_days <= 0) {
              G.resolution_log.push(`${mod.type} in ${country} expired.`);
              return false;
            }
            return true;
          });
          if (G.active_modifiers[country].length === 0) delete G.active_modifiers[country];
        });

        G.active_pipe_modifiers = G.active_pipe_modifiers.filter(mod => {
          mod.remaining_rounds--;
          return mod.remaining_rounds > 0;
        });

        G.played_cards = [];
        applyModifiersToState(G);
      },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: "bidding",
      onEnd: ({ G }) => {
        // Evaluate positions using linear pricing model
        const K_LOAD = 0.0005; // Load sensitivity
        const K_GEN = 0.0005;  // Generation sensitivity
        const K_SCARCITY = 0.001; // Energy type scarcity factor

        G.positions.forEach(pos => {
          if (pos.day_placed === G.current_day) {
            const countryWeather = G.weather_data[pos.origin_country];
            let marketPrice = pos.base_price;
            
            if (countryWeather && countryWeather.current.consumption && countryWeather.current.generation) {
              const load = countryWeather.current.consumption;
              const generationMix = countryWeather.current.generation;
              const totalGen = Object.values(generationMix).reduce((a, b) => a + b, 0);
              
              const typeGen = generationMix[pos.energy_type] || 0;
              const typeAvg = totalGen / 5;
              const typeScarcity = typeAvg - typeGen;

              marketPrice = pos.base_price 
                + (K_LOAD * load) 
                - (K_GEN * totalGen) 
                + (K_SCARCITY * typeScarcity);

              marketPrice = Math.max(5, Math.min(300, marketPrice));
              console.log(`Evaluating position for player ${pos.player_id} on contract ${pos.contract_id}:`);
              console.log(`  Load: ${load}, Total Gen: ${totalGen}, Type Gen: ${typeGen}, Type Scarcity: ${typeScarcity}`);
              console.log(`  Market Price: ${marketPrice.toFixed(2)}, Bid Price: ${pos.bid_price}, Volume: ${pos.volume}`);
            }

            let profit = 0;
            if (pos.is_short) {
              profit = (pos.bid_price - marketPrice) * pos.volume;
            } else {
              profit = (marketPrice - pos.bid_price) * pos.volume;
            }
            
            G.player_balances[pos.player_id] += (pos.bid_price * pos.volume) + profit;
          }
        });
        
        // Remove evaluated positions
        G.positions = G.positions.filter(pos => pos.day_placed !== G.current_day);

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
    submitBid: ({ G, playerID }, tradeId: string, price: number, volume: number, is_short: boolean = false) => {
      if (!G.contracts[tradeId]) return INVALID_MOVE;
      const maxCost = G.contracts[tradeId].base_price * volume;
      if (G.player_balances[playerID] < maxCost) return INVALID_MOVE;
      G.contracts[tradeId].bids.push({ player_id: playerID, price, volume, is_short });
    },
    shortBid: ({ G, playerID }, tradeId: string, price: number, volume: number) => {
      if (!G.contracts[tradeId]) return INVALID_MOVE;
      const maxCost = G.contracts[tradeId].base_price * volume;
      if (G.player_balances[playerID] < maxCost) return INVALID_MOVE;
      G.contracts[tradeId].bids.push({ player_id: playerID, price, volume, is_short: true });
    },
    playActionCard: ({ G, playerID }, cardId: string, targetId?: string, isPipe?: boolean) => {
      const playerCards = G.action_cards[playerID] || [];
      const cardIndex = playerCards.findIndex((c) => c.card_id === cardId);
      if (cardIndex === -1) return INVALID_MOVE;
      const [card] = playerCards.splice(cardIndex, 1);
      
      const play: any = { player_id: playerID, card };
      if (isPipe && targetId) {
        const [from, to] = targetId.split(' ⇹ ');
        play.target_pipe = { from, to };
      } else if (targetId) {
        play.target_country = targetId;
      }
      
      G.played_cards.push(play);
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
