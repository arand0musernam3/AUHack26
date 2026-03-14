import { INVALID_MOVE } from 'boardgame.io/dist/cjs/core.js';
import type { Ctx } from 'boardgame.io';
import type {
  EnergyType,
  Contract,
  Conduct,
  ActionCardType,
  ActionCardInstance,
  RouteStep,
  GameState,
  CountryWeatherData,
} from "./types";

import * as weatherReader from "./weatherReader";

type MoveContext = { G: GameState; ctx: Ctx; playerID: string };

const COUNTRIES = [
  "DE",
  "FR",
  "ES",
  "PT",
  "IT",
  "NL",
  "BE",
  "DK",
  "NO",
  "SE",
  "FI",
  "PL",
  "CZ",
  "AT",
  "CH",
];
const ENERGY_TYPES: EnergyType[] = [
  "Wind",
  "Solar",
  "Water",
  "Fossil",
  "Nuclear",
];

const generateMockContracts = (): Record<string, Contract> => {
  const contracts: Record<string, Contract> = {};
  let id = 1;
  // Generate a few contracts for initial UI testing
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
    {
      origin: "DE",
      destination: "FR",
      base_cost: 5,
      volume_capacity: 1000,
      is_broken: false,
    },
    {
      origin: "DE",
      destination: "DK",
      base_cost: 3,
      volume_capacity: 800,
      is_broken: false,
    },
    {
      origin: "FR",
      destination: "ES",
      base_cost: 4,
      volume_capacity: 600,
      is_broken: false,
    },
    {
      origin: "NO",
      destination: "DK",
      base_cost: 2,
      volume_capacity: 1200,
      is_broken: false,
    },
    {
      origin: "IT",
      destination: "AT",
      base_cost: 6,
      volume_capacity: 400,
      is_broken: false,
    },
  ];
};

const ACTION_CARD_TYPES: ActionCardType[] = [
  "POLAR_VORTEX",
  "HEAT_DOME",
  "MONSOON",
  "DEAD_CALM",
  "BOOST_ENERGY",
  "NERF_ENERGY",
  "CUT_CONDUCT",
  "FIX_CONDUCT",
  "DISCOUNT_CONDUCT",
  "NOPE_CARD",
];

export const EnergyGame = {
  name: "energy-market",
  maxPlayers: 5,

  setup: ({ ctx }: { ctx: Ctx }): GameState => {
  const player_balances: Record<string, number> = {};
  const action_cards: Record<string, ActionCardInstance[]> = {};

  // Create player data for all 5 potential players
  for (let i = 0; i < 5; i++) {
    const playerId = i.toString();
    player_balances[playerId] = 100000;

    const numCards = i === 0 ? 5 : 2;
    action_cards[playerId] = Array.from({ length: numCards }).map(
      (_, cardIndex) => ({
        card_id: `card-${playerId}-${cardIndex}`,
        type: ACTION_CARD_TYPES[
          Math.floor(Math.random() * ACTION_CARD_TYPES.length)
        ],
        face_down: false,
      }),
    );
  }

  const contracts = generateMockContracts();

  Object.keys(contracts).forEach((id) => {
    if (Math.random() > 0.7) {
      const numBids = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numBids; i++) {
        const biddingPlayerId = Math.floor(
          Math.random() * 5, // Use 5 instead of ctx.numPlayers
        ).toString();
        contracts[id].bids.push({
          player_id: biddingPlayerId,
          price:
            contracts[id].base_price + Math.floor(Math.random() * 20) + 5,
          volume:
            Math.floor(Math.random() * (contracts[id].available_volume / 2)) +
            10,
        });
      }
    }
  });

  let weather_data: Record<string, CountryWeatherData> = {};
  let current_date = '2024-01-01T00:00';
  let pipes: any[] = [];

  // In Node environment, weatherReader will have access to fs
  if (typeof window === 'undefined') {
    current_date = weatherReader.getRandomWeatherDate();
    weather_data = weatherReader.loadWeatherForDate(current_date);
    const activeCountryNames = Object.keys(weather_data);
    pipes = weatherReader.getHistoricalPipes(activeCountryNames);
  } else {
    // Provide some mock data if running in browser for testing
    weather_data = {
      'Germany': {
        current: { time: current_date, temperature: 15, wind_speed: 10, cloud_cover: 50, precipitation: 0, consumption: 45000, generation: { Fossil: 20000, Wind: 15000, Solar: 5000, Water: 2000, Nuclear: 3000 }, mix_percentages: { Fossil: 44.4, Wind: 33.3, Solar: 11.1, Water: 4.4, Nuclear: 6.7 } },
        forecast: [
          { time: '2024-01-02T00:00', temperature: 16, wind_speed: 12, cloud_cover: 40, precipitation: 0 },
          { time: '2024-01-03T00:00', temperature: 14, wind_speed: 15, cloud_cover: 60, precipitation: 0 },
          { time: '2024-01-04T00:00', temperature: 12, wind_speed: 8, cloud_cover: 80, precipitation: 0.1 },
        ]
      }
    };
    pipes = [
      { from: 'Germany', to: 'France', capacity: 3000 },
      { from: 'Germany', to: 'Poland', capacity: 2000 },
    ];
  }

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
      weather_feature: "wind_speed_10m (km/h)",
      direction: "increase",
    },
    weather_data,
    current_date,
    pipes,
  };
},

  phases: {
    forecasting: {
      start: true,
      next: "actionDeployment",
      onBegin: ({ G }: { G: GameState }) => { G.ready_players = []; },
      endIf: ({ G, ctx }: { G: GameState, ctx: Ctx }) => G.ready_players.length >= ctx.numPlayers,
    },
    actionDeployment: {
      next: "bidding",
      onBegin: ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
        G.ready_players = [];
      },
      endIf: ({ G, ctx }: { G: GameState, ctx: Ctx }) => G.ready_players.length >= ctx.numPlayers,
    },
    bidding: {
      next: "resolution",
      onBegin: ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
        G.ready_players = [];
      },
      endIf: ({ G, ctx }: { G: GameState, ctx: Ctx }) => G.ready_players.length >= ctx.numPlayers,
    },
    resolution: {
      next: "forecasting",
      onBegin: ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
        // Resolve contracts, update balances, apply action cards, etc.
        console.warn("Resolution logic is not fully implemented yet");
        G.ready_players = [];
      },
      endIf: ({ G, ctx }: { G: GameState, ctx: Ctx }) => G.ready_players.length >= ctx.numPlayers,
    }
  },

  moves: {
    submitBid: (
      { G, playerID }: MoveContext,
      tradeId: string,
      price: number,
      volume: number,
    ) => {
      if (!G.contracts[tradeId]) return INVALID_MOVE;
      G.contracts[tradeId].bids.push({ player_id: playerID, price, volume });
    },
    playActionCard: ({ G, playerID }: MoveContext, cardId: string, targetCountryId?: string, faceDown?: boolean) => {
      const playerCards = G.action_cards[playerID] || [];
      const cardIndex = playerCards.findIndex(c => c.card_id === cardId);
      if (cardIndex === -1) return INVALID_MOVE;

      const [card] = playerCards.splice(cardIndex, 1);
      G.played_cards.push({
        player_id: playerID,
        card: { ...card, face_down: !!faceDown },
        target_country: targetCountryId,
        rounds_remaining: 3,
      });
    },
    routeEnergy: ({ G, playerID }: MoveContext, contractId: string, route: RouteStep[]) => {
      // routing logic
      console.warn("routeEnergy move is not fully implemented yet");
    },
    buyActionCard: ({ G, playerID }: MoveContext) => {
      const CARD_COST = 5000;
      if (G.player_balances[playerID] < CARD_COST) return INVALID_MOVE;

      G.player_balances[playerID] -= CARD_COST;
      if (!G.action_cards[playerID]) G.action_cards[playerID] = [];
      G.action_cards[playerID].push({
        card_id: `card-${playerID}-${Date.now()}`,
        type: ACTION_CARD_TYPES[Math.floor(Math.random() * ACTION_CARD_TYPES.length)],
        face_down: false,
      });
    },
    markReady: ({ G, playerID }: MoveContext) => {
      if (!G.ready_players.includes(playerID)) {
        G.ready_players.push(playerID);
      }
    },
  },

  turn: {
    activePlayers: { all: "stage" },
  },
};
