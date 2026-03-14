# TASK.md — Energy Market Game: Frontend

## Overview

Build the frontend for a multiplayer, real-time energy trading board game using **React + TypeScript**. Players bid on energy contracts, play action cards, and route energy across a map of European countries. The game state is managed by **Boardgame.io** and the map is rendered with **react-simple-maps**.

The aesthetic direction is **industrial control room meets trading floor**: dark, data-dense, and high-stakes. Think Bloomberg Terminal crossed with a power grid dispatcher's screen. Monospaced data, neon accent colors on a near-black background, and map overlays that feel like live infrastructure monitoring.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Game State | [Boardgame.io](https://boardgame.io/) (`boardgame.io/react`, `boardgame.io/client`) |
| Map | [react-simple-maps](https://www.react-simple-maps.io/) |
| Styling | CSS Modules or Tailwind CSS |
| Realtime (WS) | Boardgame.io multiplayer transport (socket.io under the hood) |
| State (local UI) | React Context + `useReducer` or Zustand |
| Charts / Data Viz | Recharts or Victory (for price graphs, forecasts) |

---

## Project Structure

```
src/
├── game/
│   ├── GameDefinition.ts        # Boardgame.io Game object (moves, phases, turns)
│   ├── moves/
│   │   ├── submitBid.ts
│   │   ├── playActionCard.ts
│   │   ├── routeEnergy.ts
│   │   └── buyActionCard.ts
│   └── types.ts                 # Mirrors backend entities (Contract, Conduct, etc.)
│
├── components/
│   ├── board/
│   │   ├── GameBoard.tsx        # Root board component passed to boardgame.io Client
│   │   ├── PhaseHeader.tsx      # Shows current phase + timer countdown
│   │   └── PlayerHUD.tsx        # Balance, hand of action cards, ready button
│   │
│   ├── map/
│   │   ├── EuropeMap.tsx        # react-simple-maps canvas; countries + conducts
│   │   ├── CountryMarker.tsx    # Per-country overlay: energy type icons, bid count
│   │   ├── ConductLine.tsx      # SVG line between countries; capacity/cost tooltip
│   │   └── RouteOverlay.tsx     # Highlights a player's chosen energy route
│   │
│   ├── contracts/
│   │   ├── ContractList.tsx     # Scrollable list of open contracts for the round
│   │   ├── ContractCard.tsx     # Single contract: origin, type, volume, base price
│   │   └── BidForm.tsx          # Price + volume inputs; submit bid button
│   │
│   ├── action-cards/
│   │   ├── ActionCardHand.tsx   # Player's held cards (face-up + face-down toggle)
│   │   ├── ActionCardTile.tsx   # Card UI with type icon, description, effect text
│   │   └── CardPlayModal.tsx    # Target selection modal (country or trade)
│   │
│   ├── forecast/
│   │   ├── ForecastPanel.tsx    # Current round's forecast card + weather indicators
│   │   └── WeatherBadge.tsx     # Icon + label (e.g., "Cold Front — Scandinavia")
│   │
│   └── shared/
│       ├── Timer.tsx            # Countdown bar; triggers auto-ready on expiry
│       ├── PlayerList.tsx       # All players, balances, ready status
│       └── Toast.tsx            # Round resolution events (who won what contract)
│
├── hooks/
│   ├── useGamePhase.ts          # Derived phase state helpers
│   ├── useMyContracts.ts        # Contracts won by the local player
│   └── useCountryContracts.ts   # Contracts grouped by origin country (for map)
│
├── utils/
│   ├── energyColors.ts          # Color map per EnergyType (Wind=cyan, Solar=amber…)
│   ├── formatCurrency.ts
│   └── conductUtils.ts          # Pathfinding helpers for route selection
│
└── App.tsx                      # Boardgame.io Client setup + lobby routing
```

---

## Game Phases (UI States to Implement)

The screen is divided in three main sectionns:
1. **Left 60%**: `EuropeMap` with countries, conducts, and active overlays.
2. **Right 40%**: Phase-specific UI, we have the game log, the contracts and the player stats. Divided into tabs.
3. Bottom bar: where we have the player's hand of action cards and the "Ready" button.

### Phase 1 — Market Forecasting
- Display the **Forecast Card** prominently (weather event, affected country, probability).
- Render all **27 contracts** (9 countries × 3 each) in `ContractList`.
- On the map: highlight countries with available contracts; show energy type icons per country.
- Players can **inspect** contracts but cannot bid yet.
- Timer counts down; phase auto-advances when timer expires or all players are ready.

### Phase 2 — Action Deployment
- Player's action card hand becomes interactive.
- Clicking a card opens `CardPlayModal`:
  - **Face-up**: select target country or trade (visible to all).
  - **Face-down**: immediately placed without revealing type (bluffing mechanic).
- Show played cards on the map as overlays on their target country.
- Played face-down cards show a mystery icon to opponents.

### Phase 3 — Bidding
- `BidForm` activates per contract; players can bid on **up to 5 contracts** per round.
- Each bid requires a **price** (€/MWh) and **volume** (MWh).
- Vickrey auction UI note: tell players they should bid their *true valuation* (display a brief tooltip explaining the second-price mechanic).
- Show a running tally of how many bids the player has placed (e.g., "3 / 5 bids used").
- Timer auto-submits when expired.

### Phase 4 — Resolution & Routing
- Action cards resolve: animate their effects on the map (e.g., a broken conduct line flashes red, a boosted country glows).
- Contracts award: show a toast per won contract with price paid (second-highest bid).
- **Route Energy**: for each won contract, player selects a path across the map using `ConductLine` components. Clicking countries/conducts builds the route array.
- Show cost of routing; warn if a conduct is broken or over capacity.
- Shortfall penalty displayed if volume cannot be fulfilled.

---

## Map (EuropeMap.tsx) — Detailed Spec

Use `react-simple-maps` with a GeoJSON source for Europe. Render:

1. **Country fills** — base dark fill; tint by dominant energy type when contracts are active.
2. **Conduct lines** — SVG `<line>` or `<path>` between neighboring country centroids:
   - Color: green (healthy) / red (broken) / yellow (discounted).
   - Stroke width proportional to `volume_capacity`.
   - On hover: tooltip with `base_cost`, `volume_capacity`, `is_broken`.
3. **Country markers** — small icon cluster per country showing:
   - Energy type icons (wind turbine, sun, water drop, flame, atom).
   - Number of open contracts.
   - Player ownership indicator if a player dominates contracts there.
4. **Route overlay** — when routing phase is active, highlight the player's selected path in their player color.

Countries to include (matching game data):
`DE, FR, ES, PT, IT, NL, BE, DK, NO, SE, FI, PL, CZ, AT, CH`

---

## Boardgame.io Integration

### Game Definition (`GameDefinition.ts`)

```ts
import { INVALID_MOVE } from 'boardgame.io/core';

export const EnergyGame = {
  name: 'energy-market',

  setup: (ctx): GameState => ({ /* initial state */ }),

  phases: {
    forecasting: { start: true, next: 'actionDeployment', ... },
    actionDeployment: { next: 'bidding', ... },
    bidding: { next: 'resolution', ... },
    resolution: { next: 'forecasting', ... },
  },

  moves: {
    submitBid: (G, ctx, tradeId, price, volume) => { ... },
    playActionCard: (G, ctx, cardId, targetCountryId, faceDown) => { ... },
    routeEnergy: (G, ctx, contractId, route) => { ... },
    buyActionCard: (G, ctx) => { ... },
    markReady: (G, ctx) => { ... },
  },
};
```

### Client Setup (`App.tsx`)

```tsx
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { EnergyGame } from './game/GameDefinition';
import { GameBoard } from './components/board/GameBoard';

const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: SocketIO({ server: 'http://localhost:8000' }),
  debug: false,
});
```

### Board Component Interface

```tsx
// GameBoard.tsx receives these props from boardgame.io
interface BoardProps {
  G: GameState;           // Full game state
  ctx: Ctx;               // Phase, turn, playerID, etc.
  moves: {                // Bound move functions
    submitBid: (tradeId: string, price: number, volume: number) => void;
    playActionCard: (cardId: string, target?: string, faceDown?: boolean) => void;
    routeEnergy: (contractId: string, route: RouteStep[]) => void;
    buyActionCard: () => void;
    markReady: () => void;
  };
  playerID: string;
  isActive: boolean;      // Whether it's this player's turn to act
  isMultiplayer: boolean;
}
```

---

## TypeScript Types (`game/types.ts`)

Mirror the backend Python models exactly:

```ts
export type EnergyType = 'Wind' | 'Solar' | 'Water' | 'Fossil' | 'Nuclear';

export type ActionCardType =
  | 'POLAR_VORTEX' | 'HEAT_DOME' | 'MONSOON' | 'DEAD_CALM'
  | 'BOOST_ENERGY' | 'NERF_ENERGY'
  | 'CUT_CONDUCT' | 'FIX_CONDUCT' | 'DISCOUNT_CONDUCT'
  | 'NOPE_CARD';

export interface Bid {
  player_id: string;
  price: number;
  volume: number;
}

export interface Contract {
  contract_id: string;
  origin_country: string;
  energy_type: EnergyType;
  available_volume: number;
  base_price: number;
  bids: Bid[];
  delivery_country: string; // default "GER"
}

export interface Conduct {
  origin: string;
  destination: string;
  base_cost: number;
  volume_capacity: number;
  is_broken: boolean;
}

export interface GameState {
  phase: number;
  contracts: Record<string, Contract>;
  player_balances: Record<string, number>;
  ready_players: string[];
  conducts: Conduct[];
  // Frontend additions (derived or local):
  forecast?: ForecastCard;
  action_cards: Record<string, ActionCardInstance[]>; // keyed by player_id
  played_cards: PlayedCard[];
}

export interface ActionCardInstance {
  card_id: string;
  type: ActionCardType;
  face_down: boolean;
}

export interface PlayedCard {
  player_id: string;
  card: ActionCardInstance;
  target_country?: string;
  target_trade_id?: string;
  rounds_remaining: number; // effects last up to 3 rounds, decreasing probability
}

export interface ForecastCard {
  description: string;         // e.g., "Cold front likely in Scandinavia"
  affected_country: string;
  probability: number;         // 0–1
  weather_feature: WeatherFeature;
  direction: 'increase' | 'decrease';
}

export type WeatherFeature =
  | 'temperature_2m (°C)'
  | 'wind_speed_10m (km/h)'
  | 'cloud_cover (%)'
  | 'precipitation (mm)';

export interface RouteStep {
  originCountryId: string;
  conductId: string;
}
```

---

## Action Card Specifications

Each card type needs a UI label, icon, and description string:

| Card Type | Label | Effect Description |
|---|---|---|
| `POLAR_VORTEX` | ❄️ Polar Vortex | Forces extreme cold in target country. Boosts heating demand, hurts solar/wind. |
| `HEAT_DOME` | 🔆 Heat Dome | Forces extreme heat. Boosts cooling demand, boosts solar. |
| `MONSOON` | 🌧️ Monsoon | Heavy precipitation. Boosts hydro, hurts solar. |
| `DEAD_CALM` | 🌫️ Dead Calm | No wind. Severely reduces wind energy production. |
| `BOOST_ENERGY` | ⚡ Energy Boost | Increases production volume of target energy type in target country. |
| `NERF_ENERGY` | 📉 Sabotage | Decreases production volume of target energy type. |
| `CUT_CONDUCT` | ✂️ Cut Line | Breaks a conduct between two countries for 1–2 rounds. |
| `FIX_CONDUCT` | 🔧 Emergency Repair | Immediately fixes a broken conduct. |
| `DISCOUNT_CONDUCT` | 💸 Transit Deal | Reduces routing cost on a conduct for 1–3 rounds. |
| `NOPE_CARD` | 🚫 Nope | Cancels another player's action card before it resolves. |

---

## Visual Design Guidelines

- **Color palette**: Near-black background (`#0a0c0f`), electric cyan for Wind (`#00e5ff`), amber for Solar (`#ffb300`), blue for Water (`#2979ff`), orange-red for Fossil (`#ff5722`), lime for Nuclear (`#76ff03`). Player colors: 6 distinct neon hues.
- **Typography**: Monospaced font for all data values (prices, volumes, balances). A condensed sans-serif for labels and headers.
- **Map**: Dark base map, country borders in `#1e2a38`, active countries glow with their energy type color.
- **Cards**: Physical card metaphor with slight drop shadow and tilt on hover.
- **Animations**: 
  - Conduct lines pulse when energy is routing through them.
  - Cards "fly" to the map when played.
  - Balance changes animate with a number ticker.
  - Broken conducts show a red flash + crack SVG overlay.

---

## Timer Behavior

Each phase has a maximum duration (set server-side). The frontend must:

1. Display a `Timer` progress bar in the `PhaseHeader`.
2. When the timer hits zero, automatically call `moves.markReady()` on behalf of the player (equivalent to the server-side `RESOLVE_ROUND` WS message).
3. Warn the player at 10 seconds remaining with a visual pulse.

---

## Routing UX Flow (Phase 4)

For each won contract that needs routing:

1. Display the contract's origin and delivery country.
2. Highlight the origin country on the map.
3. Player clicks neighboring countries in sequence to build a path.
4. Each click adds a `RouteStep`; the conduct between the last selected country and the new one is automatically inferred.
5. Show running cost of the route as countries are selected.
6. If a selected conduct is broken or over capacity, show an error state and disallow that step.
7. "Confirm Route" button calls `moves.routeEnergy(contractId, route)`.
8. If the player cannot build a valid route (all paths blocked), display the shortfall penalty amount and a "Accept Penalty" button.

---

## Lobby / Pre-Game Screen

- Players enter a Game ID and a display name.
- Show connected players list (max 6).
- "Start Game" button visible only to the host (first player to connect).
- On start: server initializes `GameState` with random conducts, random starting time in dataset, and deals each player 1 random weather action card + 1,000,000 €.

---

## Key UX Constraints

- **Phase gating**: All interactive elements (BidForm, CardPlayModal, RouteOverlay) must be disabled outside their respective phases. Use `isActive` and `ctx.phase` to gate interactions.
- **Simultaneous turns**: Boardgame.io's `activePlayers` with `Stage` support should be used so all players act simultaneously in each phase.
- **Bid privacy**: A player's bid amounts must never be shown to other players until resolution. Only bid *count* per contract is visible during the bidding phase.
- **Responsive**: The game must be playable on a 1280×800 minimum viewport. The map takes 60% of the screen width; the right panel (contracts, HUD) takes 40%.
- **Accessibility**: All interactive elements must have keyboard focus states and ARIA labels.

---

## Deliverables Checklist

- [x] `GameDefinition.ts` — basic structure and phases defined
- [ ] `GameDefinition.ts` — full move logic and phase transitions
- [ ] `EuropeMap.tsx` — countries + conduct lines + markers rendering
- [ ] `ContractList.tsx` + `ContractCard.tsx` + `BidForm.tsx`
- [ ] `ActionCardHand.tsx` + `ActionCardTile.tsx` + `CardPlayModal.tsx`
- [ ] `ForecastPanel.tsx`
- [ ] `PlayerHUD.tsx` (balance, ready button, bid counter)
- [ ] `PhaseHeader.tsx` + `Timer.tsx`
- [ ] `RouteOverlay.tsx` + routing click logic in `EuropeMap.tsx`
- [ ] `PlayerList.tsx` + `Toast.tsx`
- [x] All TypeScript types in `game/types.ts`
- [x] Lobby / pre-game screen
- [x] Boardgame.io `Client` wired in `App.tsx`
- [x] Full visual design system (CSS variables, energy colors, typography)

---

## Progress Report

### Completed
- **Project Scaffolding**: Created directory structure for `game`, `components`, `hooks`, and `utils`.
- **Type Definitions**: Implemented `src/game/types.ts` with all core game entities.
- **Game Core**: Set up `src/game/GameDefinition.ts` with basic phase structure.
- **UI Framework**: Wired `boardgame.io` React Client in `src/App.tsx`.
- **Design System**: Established CSS variables and base styles in `src/index.css`.
- **Dependencies**: Installed `boardgame.io` and `react-simple-maps`.
- *Map Implementation*: Setup the basic europe map
- Implement the general UI layout as described in the spec.
- Create the initial login screen and lobby for players to join.

### Next Steps (Missing)
