import { INVALID_MOVE } from 'boardgame.io/dist/cjs/core.js';
import type { Ctx } from 'boardgame.io';
import type {
  EnergyType,
  Contract,
  GameState,
  ActiveModifier,
  CountryWeatherData,
} from "./types";

import * as weatherReader from "./weatherReader";

const COUNTRIES = ["DE", "FR", "ES", "PT", "IT", "NL", "BE", "DK", "NO", "SE", "FI", "PL", "CZ", "AT", "CH"];
const ENERGY_TYPES: EnergyType[] = ["Wind", "Solar", "Water", "Fossil", "Nuclear"];

const CODE_TO_NAME: Record<string, string> = {
  DE: "Germany", FR: "France", ES: "Spain", PT: "Portugal", IT: "Italy",
  NL: "Netherlands", BE: "Belgium", DK: "Denmark", NO: "Norway",
  SE: "Sweden", FI: "Finland", PL: "Poland", CZ: "Czechia",
  AT: "Austria", CH: "Switzerland",
};

const genContracts = (day: number, total: number, countries: string[]): Record<string, Contract> => {
  const contracts: Record<string, Contract> = {};
  const active = countries.length ? countries : COUNTRIES;

  active.forEach((code, c) => {
    const name = CODE_TO_NAME[code] || code;
    for (let offset = 0; offset < 3; offset++) {
      const d = day + offset;
      if (d > total) continue;
      
      const type = ENERGY_TYPES[offset % ENERGY_TYPES.length];
      const seed = (d * 100) + (c * 10) + offset;
      const id = `d${d}-c${c}-t${offset}`;
      
      contracts[id] = {
        contract_id: id,
        origin_country: name,
        energy_type: type,
        available_volume: Math.max(100, (500 - (d - 1) * 50) + (seed % 200)),
        base_price: 20 + ((d * 50) + (c * 5) + offset) % 30,
        bids: [],
        delivery_country: "DE",
        delivery_day: d,
      };
    }
  });
  return contracts;
};

const MODS: Partial<Record<string, any>> = {
  POLAR_VORTEX: { Wind: 1.3, Solar: 0.1, Fossil: 0.95, Nuclear: 1.0, Water: 1.0, Consumption: 1.15, Price: 1.2 },
  HEAT_DOME: { Wind: 0.8, Solar: 1.5, Fossil: 1.05, Nuclear: 0.85, Water: 0.7, Consumption: 1.1, Price: 1.15 },
  MONSOON: { Wind: 0.6, Solar: 0.2, Fossil: 1.1, Nuclear: 1.0, Water: 1.4, Consumption: 0.95, Price: 1.05 },
  DEAD_CALM: { Wind: 0.1, Solar: 1.2, Fossil: 1.1, Nuclear: 1.1, Water: 1.0, Consumption: 0.9, Price: 0.95 },
  BOOST_ENERGY: { Price: 1.5 },
  NERF_ENERGY: { Price: 0.5 }
};

const FIELDS = ['Wind', 'Solar', 'Fossil', 'Nuclear', 'Water', 'Consumption', 'Price'];

function applyModifiers(G: GameState) {
  const modified: CountryWeatherData = JSON.parse(JSON.stringify(G.weather_data));
  
  Object.keys(modified).forEach(country => {
    (G.active_modifiers[country] || []).forEach(mod => {
      const cfg = MODS[mod.type];
      if (!cfg) return;
      
      FIELDS.forEach(f => {
        const mul = cfg[f] ?? 1;
        (modified[country].current as any)[f] *= mul;
        modified[country].forecast.forEach(fc => (fc as any)[f] *= mul);
      });
    });
  });
  
  G.modified_weather_data = modified;

  G.conducts.forEach(c => {
    c.is_broken = G.active_pipe_modifiers.some(m => m.type === 'CUT_CONDUCT' && 
      ((m.target.from === c.origin && m.target.to === c.destination) ||
       (m.target.from === c.destination && m.target.to === c.origin)));
    c.discount_active = G.active_pipe_modifiers.some(m => m.type === 'DISCOUNT_CONDUCT' && 
      ((m.target.from === c.origin && m.target.to === c.destination) ||
       (m.target.from === c.destination && m.target.to === c.origin)));
  });
}

const W_CARDS = ["POLAR_VORTEX", "HEAT_DOME", "MONSOON", "DEAD_CALM"];
const P_CARDS = ["BOOST_ENERGY", "NERF_ENERGY"];
const ALL_CARDS = [...W_CARDS, ...P_CARDS, "CUT_CONDUCT", "FIX_CONDUCT", "DISCOUNT_CONDUCT"];

const nextDay = (iso: string) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 16);
};

export const EnergyGame = {
  name: "energy-market",
  maxPlayers: 5,
  minPlayers: 2,

  setup: ({ ctx }: { ctx: Ctx }): GameState => {
    const player_balances: Record<string, number> = {};
    const player_names: Record<string, string> = {};
    const action_cards: Record<string, any[]> = {};
    const player_history: Record<string, any[]> = {};

    for (let i = 0; i < ctx.numPlayers; i++) {
      const pid = i.toString();
      player_balances[pid] = 100000;
      player_names[pid] = `OP_${pid}`; 
      player_history[pid] = [];
      action_cards[pid] = Array.from({ length: 2 }).map((_, idx) => ({
        card_id: `card-${pid}-${idx}-${Date.now()}`,
        type: ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)],
        face_down: false,
        duration: Math.floor(Math.random() * 3) + 2,
      }));
    }

    let weather = {};
    let date = '2024-01-01T00:00';
    let pipes: any[] = [];

    if (typeof window === 'undefined') {
      date = weatherReader.getRandomWeatherDate();
      weather = weatherReader.loadWeatherForDate(date);
      pipes = weatherReader.getHistoricalPipes(Object.keys(weather));
    }

    const active = COUNTRIES.filter(c => (weather as any)[CODE_TO_NAME[c]]);
    const finalActive = active.length ? active : COUNTRIES;

    const G: GameState = {
      phase_number: 1,
      current_day: 1,
      total_days: 5,
      current_period: 1,
      periods_completed: [],
      contracts: genContracts(1, 5, finalActive),
      player_balances,
      player_names,
      ready_players: [],
      conducts: pipes.map(p => ({
        origin: p.from,
        destination: p.to,
        base_cost: 2 + Math.random() * 5,
        volume_capacity: p.capacity,
        is_broken: false,
        discount_active: false
      })),
      action_cards,
      played_cards: [],
      active_modifiers: {},
      active_pipe_modifiers: [],
      weather_data: weather as CountryWeatherData,
      modified_weather_data: weather as CountryWeatherData,
      current_date: date,
      pipes,
      phase_deadline: null,
      active_countries: finalActive,
      positions: [],
      resolution_log: [],
      auction_results: [],
      player_history,
    };

    applyModifiers(G);
    return G;
  },

  phases: {
    bidding: {
      start: true,
      onBegin: ({ G }) => { G.ready_players = []; },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: "actionDeployment",
      onEnd: ({ G }) => {
        Object.keys(G.contracts).forEach(id => {
          const c = G.contracts[id];
          if (c.bids.length > 0) {
            const bids = c.bids.map(b => `${G.player_names[b.player_id] || b.player_id}: €${b.price}`).join(", ");
            G.auction_results.push(`AUCTION: ${c.origin_country} ${c.energy_type} (Delivery Day ${c.delivery_day})`);
            G.auction_results.push(`  BIDS: ${bids}`);

            const max = Math.max(...c.bids.map(b => Math.abs(b.price)));
            const winners = c.bids.filter(b => Math.abs(b.price) === max);
            const vol = c.available_volume / winners.length;
            
            winners.forEach(bid => {
              const cost = max * vol;
              if (G.player_balances[bid.player_id] >= cost) {
                G.player_balances[bid.player_id] -= cost;
                G.positions.push({
                  player_id: bid.player_id,
                  contract_id: c.contract_id,
                  origin_country: c.origin_country,
                  energy_type: c.energy_type,
                  volume: vol,
                  bid_price: max,
                  base_price: c.base_price,
                  is_short: !!bid.is_short,
                  day_placed: G.current_day,
                  delivery_day: c.delivery_day,
                  period_placed: G.current_period
                });
                G.auction_results.push(`  WINNER: ${G.player_names[bid.player_id] || bid.player_id} acquired ${vol.toFixed(0)} MWh @ €${max}`);
              } else {
                G.auction_results.push(`  FAILED: ${G.player_names[bid.player_id] || bid.player_id} insufficient funds for €${cost.toFixed(0)}`);
              }
            });
            delete G.contracts[id];
          }
        });
        G.ready_players = [];
      }
    },

    actionDeployment: {
      onBegin: ({ G }) => { G.ready_players = []; },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: ({ G }) => (G.current_period < 3 ? "bidding" : "resolution"),
      onEnd: ({ G }) => {
        if (G.current_period < 3) G.current_period++;
        G.ready_players = [];
      },
    },

    resolution: {
      onBegin: ({ G }) => {
        G.ready_players = [];
        G.resolution_log = [...G.auction_results];
        
        const votes: Record<string, any[]> = {};
        G.played_cards.forEach(pc => {
          if (pc.target_country && [...W_CARDS, ...P_CARDS].includes(pc.card.type)) {
            if (!votes[pc.target_country]) votes[pc.target_country] = [];
            votes[pc.target_country].push(pc.card);
          }
        });

        Object.entries(votes).forEach(([country, cards]) => {
          const win = cards[Math.floor(Math.random() * cards.length)];
          G.active_modifiers[country] = [{
            type: win.type,
            remaining_days: win.duration,
            original_duration: win.duration
          }];
          G.resolution_log.push(`${country}: ${win.type} implemented (${win.duration}d).`);
        });

        G.played_cards.forEach(pc => {
          if (!pc.target_pipe) return;
          const { from, to } = pc.target_pipe;
          if (pc.card.type === 'FIX_CONDUCT') {
            G.active_pipe_modifiers = G.active_pipe_modifiers.filter(m => 
              !(m.type === 'CUT_CONDUCT' && m.target.from === from && m.target.to === to));
            G.resolution_log.push(`INFRASTRUCTURE: ${from} ⇹ ${to} conduct repaired.`);
          } else if (pc.card.type === 'CUT_CONDUCT') {
            const r = Math.floor(Math.random() * 2) + 1;
            G.active_pipe_modifiers.push({ type: 'CUT_CONDUCT', target: { from, to }, remaining_rounds: r });
            G.resolution_log.push(`SABOTAGE: ${from} ⇹ ${to} conduct severed for ${r} rounds.`);
          } else if (pc.card.type === 'DISCOUNT_CONDUCT') {
            const r = Math.floor(Math.random() * 3) + 1;
            G.active_pipe_modifiers.push({ type: 'DISCOUNT_CONDUCT', target: { from, to }, remaining_rounds: r });
            G.resolution_log.push(`SUBSIDY: ${from} ⇹ ${to} transit fees discounted for ${r} rounds.`);
          }
        });

        G.played_cards = [];
        applyModifiers(G);
      },
      endIf: ({ G, ctx }) => G.ready_players.length >= ctx.numPlayers,
      next: "bidding",
      onEnd: ({ G }) => {
        const K_L = 0.0005, K_G = 0.0005, K_S = 0.001;
        const dailyProfits: Record<string, number> = {};
        Object.keys(G.player_balances).forEach(pid => dailyProfits[pid] = 0);

        G.positions.forEach(pos => {
          if (pos.delivery_day !== G.current_day) return;
          
          const w = G.modified_weather_data[pos.origin_country];
          let price = w.current.Price; 
          
          if (w && w.current.consumption && w.current.generation) {
            const load = w.current.consumption;
            const gen = w.current.generation;
            const total = Object.values(gen).reduce((a, b) => a + b, 0);
            const type = gen[pos.energy_type] || 0;
            const scarcity = (total / 5) - type;

            price = pos.base_price + (K_L * load) - (K_G * total) + (K_S * scarcity);
            price = Math.max(5, Math.min(300, price));
          }

          const profit = pos.is_short ? (pos.bid_price - price) * pos.volume : (price - pos.bid_price) * pos.volume;
          G.player_balances[pos.player_id] += (pos.bid_price * pos.volume) + profit;
          dailyProfits[pos.player_id] += profit;
        });

        // Record history
        Object.entries(dailyProfits).forEach(([pid, profit]) => {
          if (!G.player_history[pid]) G.player_history[pid] = [];
          G.player_history[pid].push({ day: G.current_day, profit });
        });
        
        G.positions = G.positions.filter(p => p.delivery_day !== G.current_day);

        Object.keys(G.contracts).forEach(id => {
          if (G.contracts[id].delivery_day === G.current_day) delete G.contracts[id];
        });

        if (G.current_day < G.total_days) {
          G.current_day++;
          G.current_period = 1;
          G.current_date = nextDay(G.current_date);
          if (typeof window === 'undefined') G.weather_data = weatherReader.loadWeatherForDate(G.current_date);
          applyModifiers(G);

          G.active_countries.forEach((code, cIdx) => {
            const name = CODE_TO_NAME[code];
            for (let offset = 0; offset < 3; offset++) {
              const target = G.current_day + offset;
              if (target > G.total_days) continue;

              if (!Object.values(G.contracts).some(c => c.origin_country === name && c.delivery_day === target)) {
                const seed = (target * 100) + (cIdx * 10) + offset + G.phase_number;
                const cid = `d${target}-c${cIdx}-p${G.phase_number}-t${offset}`;
                G.contracts[cid] = {
                  contract_id: cid,
                  origin_country: name,
                  energy_type: ENERGY_TYPES[offset % ENERGY_TYPES.length],
                  available_volume: Math.max(100, (500 - (target - 1) * 50) + (seed % 200)),
                  base_price: 20 + ((target * 50) + (cIdx * 5) + offset + G.phase_number) % 30,
                  bids: [],
                  delivery_country: "DE",
                  delivery_day: target,
                };
              }
            }
          });
        } else if (G.current_period === 3) {
          G.is_game_over = true;
        }

        Object.keys(G.active_modifiers).forEach(c => {
          G.active_modifiers[c] = G.active_modifiers[c].filter(m => {
            m.remaining_days--;
            if (m.remaining_days <= 0) {
              G.resolution_log.push(`${m.type} in ${c} expired.`);
              return false;
            }
            return true;
          });
          if (!G.active_modifiers[c].length) delete G.active_modifiers[c];
        });

        G.active_pipe_modifiers = G.active_pipe_modifiers.filter(m => {
          m.remaining_rounds--;
          return m.remaining_rounds > 0;
        });

        applyModifiers(G);
        G.phase_number++;
        G.ready_players = [];
        G.resolution_log = [];
        G.auction_results = [];
      },
    },
  },

  endIf: ({ G }) => {
    if (G.is_game_over) {
      const scores = Object.keys(G.player_balances).map(id => ({
        playerID: id,
        name: G.player_names[id],
        score: G.player_balances[id]
      })).sort((a, b) => b.score - a.score);
      return { winner: scores[0].playerID, leaderboard: scores };
    }
  },

  moves: {
    setPlayerName: ({ G }, id: string, name: string) => { G.player_names[id] = name; },
    submitBid: ({ G, playerID }, tid: string, price: number, vol: number, is_short = false) => {
      const c = G.contracts[tid];
      if (!c) return INVALID_MOVE;
      const cost = c.base_price * vol;
      if (G.player_balances[playerID] < cost) return INVALID_MOVE;
      c.bids.push({ player_id: playerID, price, volume: vol, is_short });
    },
    shortBid: ({ G, playerID }, tid: string, price: number, vol: number) => {
      const c = G.contracts[tid];
      if (!c) return INVALID_MOVE;
      const cost = c.base_price * vol;
      if (G.player_balances[playerID] < cost) return INVALID_MOVE;
      c.bids.push({ player_id: playerID, price, volume: vol, is_short: true });
    },
    playActionCard: ({ G, playerID }, cid: string, target?: string, isPipe?: boolean) => {
      const cards = G.action_cards[playerID] || [];
      const idx = cards.findIndex(c => c.card_id === cid);
      if (idx === -1) return INVALID_MOVE;
      const [card] = cards.splice(idx, 1);
      const play: any = { player_id: playerID, card };
      if (isPipe && target) {
        const [from, to] = target.split(' ⇹ ');
        play.target_pipe = { from, to };
      } else if (target) {
        play.target_country = target;
      }
      G.played_cards.push(play);
    },
    buyActionCard: ({ G, playerID }) => {
      if (G.player_balances[playerID] < 20000) return INVALID_MOVE;
      G.player_balances[playerID] -= 20000;
      G.action_cards[playerID].push({
        card_id: `card-${playerID}-${Date.now()}`,
        type: ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)],
        face_down: false,
        duration: Math.floor(Math.random() * 3) + 2,
      });
    },
    flowEnergy: ({ G, playerID }, positionIndex: number, destinationCountry: string) => {
      const pos = G.positions[positionIndex];
      if (!pos || pos.player_id !== playerID) return INVALID_MOVE;
      
      const conduct = G.conducts.find(c => 
        (c.origin === pos.origin_country && c.destination === destinationCountry) ||
        (c.origin === destinationCountry && c.destination === pos.origin_country)
      );
      
      if (!conduct || conduct.is_broken) return INVALID_MOVE;
      
      let cost = 20000; 
      if (conduct.discount_active) cost *= 0.5;
      
      if (G.player_balances[playerID] < cost) return INVALID_MOVE;
      
      G.player_balances[playerID] -= cost;
      const oldCountry = pos.origin_country;
      pos.origin_country = destinationCountry;
      
      G.resolution_log.push(`LOGISTIC: ${G.player_names[playerID]} rerouted energy from ${oldCountry} to ${destinationCountry} (€${cost.toLocaleString()}).`);
    },
    markReady: ({ G, playerID }) => {
      const idx = G.ready_players.indexOf(playerID);
      if (idx === -1) G.ready_players.push(playerID);
      else G.ready_players.splice(idx, 1);
    },
  },

  turn: { activePlayers: { all: "main" }, stages: { main: {} } },
};
