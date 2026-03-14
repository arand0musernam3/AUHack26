import { INVALID_MOVE } from 'boardgame.io/core';
import { GameState } from './types';

export const EnergyGame = {
  name: 'energy-market',

  setup: (ctx: any): GameState => ({
    phase_number: 1,
    contracts: {},
    player_balances: {},
    ready_players: [],
    conducts: [],
    action_cards: {},
    played_cards: [],
  }),

  phases: {
    forecasting: {
      start: true,
      next: 'actionDeployment',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState) => G.ready_players.length === 2, // Simplified for now
    },
    actionDeployment: {
      next: 'bidding',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState) => G.ready_players.length === 2,
    },
    bidding: {
      next: 'resolution',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState) => G.ready_players.length === 2,
    },
    resolution: {
      next: 'forecasting',
      onBegin: (G: GameState, ctx: any) => {
        G.ready_players = [];
      },
      endIf: (G: GameState) => G.ready_players.length === 2,
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
      if (!G.ready_players.includes(ctx.playerID)) {
        G.ready_players.push(ctx.playerID);
      }
    },
  },

  turn: {
    activePlayers: { all: 'stage' },
  },
};
