import { INVALID_MOVE } from 'boardgame.io/dist/cjs/core.js';
import type { Ctx } from 'boardgame.io';
import type {
  EnergyType,
  Contract,
  Conduct,
  ActionCardType,
  GameState,
  DayPeriod,
} from "./types";

type MoveContext = { G: GameState; ctx: Ctx; playerID: string };

const DAY_PERIODS: DayPeriod[] = ["morning", "afternoon", "evening"];

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

const phaseConfig = (nextPhase?: string | ((...args: any[]) => string)) => ({
  ...(nextPhase ? { next: nextPhase } : {}),
  onBegin: ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
    G.ready_players = [];
  },
  endIf: ({ G, ctx }: { G: GameState; ctx: Ctx }) =>
    G.ready_players.length >= ctx.numPlayers,
  turn: {
      activePlayers: { all: "stage" },
    },
});

export const EnergyGame = {
  name: "energy-market",

  setup: ({ ctx }: { ctx: Ctx }): GameState => {
    const player_balances: Record<string, number> = {};
    const action_cards: Record<string, ActionCardInstance[]> = {};

    for (let i = 0; i < ctx.numPlayers; i++) {
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
      current_period: "morning",
      periods_completed: [],
      phase_deadline: null,
    };
  },

  phases: {
    // forecasting: {
    //   start: true,
    //   ...phaseConfig("actionDeployment"),
    //   onBegin: ({ G, ctx }: { G: GameState; ctx: Ctx }) => {
    //     G.ready_players = [];
    //     G.current_period = "morning";
    //     G.periods_completed = [];
    //   },
    // },


    bidding: {
      ...phaseConfig(), // next is dynamic, so we handle it separately
      next: ({ G }: { G: GameState }) => {
        const nextIndex = DAY_PERIODS.indexOf(G.current_period) + 1;
        return nextIndex < DAY_PERIODS.length
          ? "actionDeployment"
          : "resolution";
      },
      onEnd: ({ G }: { G: GameState }) => {
        G.periods_completed.push(G.current_period);
        const nextIndex = DAY_PERIODS.indexOf(G.current_period) + 1;
        if (nextIndex < DAY_PERIODS.length) {
          G.current_period = DAY_PERIODS[nextIndex];
        }
      },
      start: true,
    },

    actionDeployment: phaseConfig("bidding"),

    resolution: phaseConfig(),
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
    playActionCard: (
      { G, playerID }: MoveContext,
      cardId: string,
      targetCountryId?: string,
      faceDown?: boolean,
    ) => {
      const playerCards = G.action_cards[playerID] || [];
      const cardIndex = playerCards.findIndex((c) => c.card_id === cardId);
      if (cardIndex === -1) return INVALID_MOVE;

      const [card] = playerCards.splice(cardIndex, 1);
      G.played_cards.push({
        player_id: playerID,
        card: { ...card, face_down: !!faceDown },
        target_country: targetCountryId,
        rounds_remaining: 3,
      });
    },
    routeEnergy: (
      { G, playerID }: MoveContext,
      contractId: string,
      route: RouteStep[],
    ) => {
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
        type: ACTION_CARD_TYPES[
          Math.floor(Math.random() * ACTION_CARD_TYPES.length)
        ],
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
