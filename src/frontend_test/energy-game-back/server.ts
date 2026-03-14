import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { EnergyGame } from '../energy-game/src/game/GameDefinition';
import crypto from 'node:crypto';

const server = Server({
  games: [EnergyGame],

  origins: [
    // Development
    Origins.LOCALHOST,
    "http://localhost:5173",
    "http://10.192.50.21:5173",
    // Production — replace with your deployed frontend URL
    'https://your-game-frontend.com',
  ],

  // Optional: separate Lobby API port so game WS traffic is isolated
  // apiPort: 8001,

  // Optional: plug in a real DB (see DB section below)
  // db: new FlatFileDB(),
});

const PORT = Number(process.env.PORT) || 8000;

server.run(PORT, () => {
  console.log(`boardgame.io server running on port ${PORT}`);
});
