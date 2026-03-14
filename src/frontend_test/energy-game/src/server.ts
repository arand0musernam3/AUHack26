import { Server, Origins } from 'boardgame.io/server';
import { EnergyGame } from './game/GameDefinition';

const server = Server({
  games: [EnergyGame],

  origins: [
    // Development
    Origins.LOCALHOST,
    "http://localhost:5173",
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
