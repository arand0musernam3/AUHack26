# BACKEND.md — Energy Market Game: Server

## Overview

The backend is a **boardgame.io `Server`** node — a Koa-based HTTP + WebSocket server that:
- Runs all game logic authoritatively (moves, phase transitions, `endIf`)
- Keeps all connected clients in sync via socket.io
- Exposes a REST Lobby API for creating and joining matches
- Persists match state to a database

**You write zero networking code.** boardgame.io handles all socket transport, state broadcasting, and move validation. Your only job is the `server.ts` entry point and optional custom middleware.

---

## Repository Layout

```
server/
├── server.ts              # Entry point — Server() setup and run()
├── tsconfig.server.json   # Separate tsconfig (commonjs target)
├── package.json           # { "type": "commonjs" } override for Node
└── db/
    └── FlatFileDB.ts      # Optional: simple JSON file persistence for dev
```

The `GameDefinition.ts` and `types.ts` files are **shared** between client and server — keep them in `src/game/` and import from there. The server does not duplicate any game logic.

---

## Dependencies

```bash
npm install boardgame.io
npm install --save-dev ts-node tsup
```

No extra packages are needed. boardgame.io bundles Koa, socket.io, and the Lobby API internally.

---

## `server.ts`

```ts
import { Server, Origins } from 'boardgame.io/server';
import { EnergyGame } from '../src/game/GameDefinition';

const server = Server({
  games: [EnergyGame],

  origins: [
    // Development
    Origins.LOCALHOST,
    // Production — replace with your deployed frontend URL
    'https://your-game-frontend.com',
  ],

  // Optional: separate Lobby API port so game WS traffic is isolated
  // apiPort: 8001,

  // Optional: plug in a real DB (see DB section below)
  // db: new FlatFileDB(),

  // Optional: authenticate moves server-side
  generateCredentials: (ctx) => {
    // Called when a player joins a match — return a token they must echo back
    return crypto.randomUUID();
  },
  authenticateCredentials: (credentials, playerMetadata) => {
    return credentials === playerMetadata.credentials;
  },
});

const PORT = Number(process.env.PORT) || 8000;

server.run(PORT, () => {
  console.log(`boardgame.io server running on port ${PORT}`);
});
```

---

## What the Server Gives You for Free

### REST Lobby API (built-in)

boardgame.io automatically exposes these endpoints on the same port:

| Method | Path | Description |
|---|---|---|
| `GET` | `/games/energy-market` | List all active matches |
| `POST` | `/games/energy-market/create` | Create a new match |
| `POST` | `/games/energy-market/:matchID/join` | Join a match as a playerID |
| `POST` | `/games/energy-market/:matchID/leave` | Leave a match |
| `GET` | `/games/energy-market/:matchID` | Get match metadata |

**Create a match** (call from your lobby UI):
```ts
// POST /games/energy-market/create
// Body:
{
  "numPlayers": 4
}
// Response:
{
  "matchID": "abc123"
}
```

**Join a match** (call from your lobby UI after create):
```ts
// POST /games/energy-market/abc123/join
// Body:
{
  "playerID": "0",      // 0-indexed string
  "playerName": "Alice"
}
// Response:
{
  "playerCredentials": "uuid-token"  // Store this — sent with every move
}
```

Store `matchID`, `playerID`, and `playerCredentials` in `localStorage` after joining. Pass them to the boardgame.io `Client`:

```tsx
// App.tsx
const EnergyClient = Client({
  game: EnergyGame,
  board: GameBoard,
  multiplayer: SocketIO({ server: 'http://localhost:8000' }),
});

// Render with match context
<EnergyClient
  matchID={matchID}
  playerID={playerID}
  credentials={playerCredentials}
/>
```

### WebSocket Transport (built-in)

Once a client connects with a valid `matchID` + `playerID`, boardgame.io:
- Syncs the full `GameState` to the joining client immediately
- Broadcasts all move results to every client in the same match in real time
- Enforces that only the correct `playerID` can call each move (using credentials)
- Runs `endIf` after every move to automatically advance phases

You never call socket.io directly from the frontend — all of that is handled by `moves.*` calls through the boardgame.io React client.

---

## TypeScript Build Setup

Because Vite (your frontend bundler) uses `"type": "module"` but boardgame.io's server requires CommonJS, you need a separate tsconfig and package.json for the server build.

**`server/tsconfig.server.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "outDir": "../build/server",
    "rootDir": "..",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["../src/game/**/*", "./**/*"]
}
```

**`server/package.json`** (placed in the build output dir by the build script):
```json
{ "type": "commonjs" }
```

**Root `package.json` scripts**:
```json
{
  "scripts": {
    "dev:server": "ts-node -r tsconfig-paths/register --project server/tsconfig.server.json server/server.ts",
    "build:server": "tsc -p server/tsconfig.server.json && echo '{\"type\":\"commonjs\"}' > build/server/package.json",
    "start:server": "node build/server/server/server.js",
    "dev:client": "vite",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

Install helpers:
```bash
npm install --save-dev concurrently ts-node tsconfig-paths
```

---

## Database / Persistence

### Development (default): in-memory

boardgame.io uses an in-memory store by default. Match state is lost when the server restarts. This is fine during development.

### Production option A: flat-file JSON (simplest)

There is no official flat-file adapter, but you can implement the `StorageAPI.Async` interface in ~50 lines:

```ts
// server/db/FlatFileDB.ts
import { StorageAPI } from 'boardgame.io';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('./data');

export class FlatFileDB extends StorageAPI.Async {
  async fetch(matchID: string, opts: any) {
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, `${matchID}.json`), 'utf-8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  async setState(matchID: string, state: any) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const existing = await this.fetch(matchID, {});
    await fs.writeFile(
      path.join(DATA_DIR, `${matchID}.json`),
      JSON.stringify({ ...existing, state })
    );
  }

  async setMetadata(matchID: string, metadata: any) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const existing = await this.fetch(matchID, {});
    await fs.writeFile(
      path.join(DATA_DIR, `${matchID}.json`),
      JSON.stringify({ ...existing, metadata })
    );
  }

  async listMatches(opts?: any) { return []; }
  async wipe(matchID: string) {
    await fs.unlink(path.join(DATA_DIR, `${matchID}.json`)).catch(() => {});
  }
}
```

Pass it to the server:
```ts
import { FlatFileDB } from './db/FlatFileDB';
const server = Server({ games: [EnergyGame], db: new FlatFileDB(), ... });
```

### Production option B: boardgame.io-firebase (recommended for real deployment)

```bash
npm install @boardgame.io/firebase
```

```ts
import { Firestore } from '@boardgame.io/firebase';
const server = Server({
  games: [EnergyGame],
  db: new Firestore({ config: { projectId: 'your-project' } }),
  ...
});
```

---

## Lobby UI Integration (Frontend Side)

Your lobby screen (`src/components/Lobby.tsx`) needs to call the Lobby API directly via `fetch` before handing off to the game client. Here is the minimal pattern:

```ts
// src/hooks/useLobby.ts

const LOBBY_SERVER = 'http://localhost:8000';
const GAME_NAME = 'energy-market';

export const createMatch = async (numPlayers: number): Promise<string> => {
  const res = await fetch(`${LOBBY_SERVER}/games/${GAME_NAME}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numPlayers }),
  });
  const { matchID } = await res.json();
  return matchID;
};

export const joinMatch = async (
  matchID: string,
  playerID: string,
  playerName: string
): Promise<string> => {
  const res = await fetch(`${LOBBY_SERVER}/games/${GAME_NAME}/${matchID}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerID, playerName }),
  });
  const { playerCredentials } = await res.json();
  return playerCredentials;
};

export const listMatches = async () => {
  const res = await fetch(`${LOBBY_SERVER}/games/${GAME_NAME}`);
  return res.json(); // { matches: [...] }
};
```

**Lobby flow**:
1. Player arrives → `listMatches()` → show open matches.
2. Host clicks "Create" → `createMatch(numPlayers)` → get `matchID`.
3. Host + guests click "Join" → `joinMatch(matchID, playerID, playerName)` → get `playerCredentials`.
4. Store `{ matchID, playerID, playerCredentials }` in `localStorage`.
5. Render `<EnergyClient matchID={matchID} playerID={playerID} credentials={playerCredentials} />`.

---

## Phase Timer (Server-Side Enforcement)

boardgame.io does not have a built-in timer. You have two options:

### Option A: Client-side timer (simpler, recommended for now)

Each client runs a countdown independently. When it hits zero, it calls `moves.markReady()`. The server advances the phase once `endIf` is satisfied (all players ready or `ready_players.length >= numPlayers`). This works reliably because `markReady` is idempotent.

### Option B: Server-side timer via `onBegin` + bot turn (advanced)

Use boardgame.io's `turn.moveLimit` or set a timeout in `onBegin` using a Node `setTimeout` that calls the server's internal move API. This is complex and brittle — stick with Option A during development.

---

## CORS Configuration

```ts
import { Origins } from 'boardgame.io/server';

const server = Server({
  games: [EnergyGame],
  origins: [
    Origins.LOCALHOST,        // http://localhost:* (all ports)
    Origins.LOCALHOST_IN_DEVELOPMENT, // only during NODE_ENV=development
    'https://yourdomain.com', // exact production origin
  ],
});
```

For the Lobby REST API specifically (if you separate ports):
```ts
const server = Server({
  games: [EnergyGame],
  origins: [Origins.LOCALHOST],
  apiOrigins: [Origins.LOCALHOST], // defaults to same as origins
  apiPort: 8001, // optional: split API onto different port
});
```

---

## Environment Variables

Create a `.env` file at the root:

```env
PORT=8000
NODE_ENV=development
# For production DB:
FIREBASE_PROJECT_ID=your-project-id
```

Read in `server.ts`:
```ts
const PORT = Number(process.env.PORT) || 8000;
```

---

## Key Architectural Notes

**The server owns all game logic.** Moves defined in `GameDefinition.ts` run on the server, not the client. The client sends a move intent via socket; the server validates, applies it to `G`, and broadcasts the new state to all clients. Never put side effects (API calls, timers) inside move functions.

**`playerView` for bid privacy.** To hide other players' bid amounts during the bidding phase, add a `playerView` function to `EnergyGame`:

```ts
export const EnergyGame = {
  // ...
  playerView: (G: GameState, ctx: any, playerID: string): GameState => {
    if (ctx.phase !== 'resolution') {
      // Redact other players' bid prices/volumes during bidding
      const sanitizedContracts = Object.fromEntries(
        Object.entries(G.contracts).map(([id, contract]) => [
          id,
          {
            ...contract,
            bids: contract.bids.map(bid =>
              bid.player_id === playerID
                ? bid                          // own bids: full detail
                : { player_id: bid.player_id, price: -1, volume: -1 } // others: redacted
            ),
          },
        ])
      );
      return { ...G, contracts: sanitizedContracts };
    }
    return G; // resolution phase: reveal everything
  },
};
```

This runs server-side on every state broadcast — each client only receives their own view of `G`.

**`action_cards` privacy.** Similarly, redact other players' card hands in `playerView`:
```ts
const sanitizedCards = Object.fromEntries(
  Object.entries(G.action_cards).map(([pid, cards]) => [
    pid,
    pid === playerID
      ? cards                    // own hand: full detail
      : cards.map(c => c.face_down
          ? { ...c, type: 'HIDDEN' as any }   // face-down: hide type
          : c                                   // face-up: visible
        ),
  ])
);
```

---

## Deliverables Checklist

- [ ] `server/server.ts` — `Server()` setup with CORS, credentials, and `run()`
- [ ] `server/tsconfig.server.json` — CommonJS target, includes `src/game/**`
- [ ] Root `package.json` scripts — `dev`, `dev:server`, `build:server`, `start:server`
- [ ] `src/hooks/useLobby.ts` — `createMatch`, `joinMatch`, `listMatches`
- [ ] `playerView` in `GameDefinition.ts` — bid + action card privacy
- [ ] `.env` with `PORT` and `NODE_ENV`
- [ ] (Optional) `server/db/FlatFileDB.ts` for dev persistence
