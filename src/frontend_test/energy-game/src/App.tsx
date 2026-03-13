import React, { useState, useEffect, useRef } from "react";

// --- 1. Type Definitions ---
interface Bid {
  player_id: string;
  price: number;
  volume: number;
}

interface Contract {
  contract_id: string;
  origin_country: string;
  available_volume: number;
  base_price: number;
  bids: Bid[];
}

interface GameState {
  phase: number;
  contracts: Record<string, Contract>;
  player_balances: Record<string, number>;
  ready_players: string[];
}

const WS_URL = "ws://127.0.0.1:8000/ws";

export default function App() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bids, setBids] = useState<
    Record<string, { price: number; volume: number }>
  >({});
  const ws = useRef<WebSocket | null>(null);

  // --- 2. Connection Management ---
  useEffect(() => {
    const id = prompt("Enter your Player ID (e.g., Player1):");
    if (!id) return;
    setPlayerId(id);

    ws.current = new WebSocket(`${WS_URL}/${id}`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "STATE_UPDATE") {
        setGameState(message.data);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  // --- 3. Interaction Logic ---
  const handleBidChange = (
    contractId: string,
    field: "price" | "volume",
    value: string
  ) => {
    setBids((prev) => ({
      ...prev,
      [contractId]: {
        ...prev[contractId],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const submitBids = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const formattedBids = Object.entries(bids).map(([contract_id, data]) => ({
      contract_id,
      price: data.price,
      volume: data.volume,
    }));

    ws.current.send(
      JSON.stringify({
        action: "SUBMIT_BIDS",
        bids: formattedBids,
      })
    );
  };

  // --- 4. Render Logic ---
  if (!playerId) return <div>Please refresh and enter a Player ID.</div>;
  if (!gameState) return <div>Connecting to Central Bank server...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Energy Market - Player: {playerId}</h1>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ padding: "10px", border: "1px solid black" }}>
          <strong>Current Phase:</strong> {gameState.phase}
        </div>
        <div style={{ padding: "10px", border: "1px solid black" }}>
          <strong>Balance:</strong> €
          {gameState.player_balances[playerId]?.toLocaleString() || 0}
        </div>
      </div>

      {gameState.phase === 3 && (
        <div>
          <h2>Phase 3: Bidding Market</h2>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Origin</th>
                <th>Volume Available</th>
                <th>Base Price</th>
                <th>Your Bid Volume</th>
                <th>Your Bid Price</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(gameState.contracts).map((contract) => (
                <tr key={contract.contract_id}>
                  <td>{contract.contract_id}</td>
                  <td>{contract.origin_country}</td>
                  <td>{contract.available_volume}</td>
                  <td>€{contract.base_price}</td>
                  <td>
                    <input
                      type="number"
                      onChange={(e) =>
                        handleBidChange(
                          contract.contract_id,
                          "volume",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      onChange={(e) =>
                        handleBidChange(
                          contract.contract_id,
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={submitBids}
            disabled={gameState.ready_players.includes(playerId)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            {gameState.ready_players.includes(playerId)
              ? "Waiting for others..."
              : "Submit Bids"}
          </button>
        </div>
      )}

      {gameState.phase === 4 && (
        <div>
          <h2>Phase 4: Resolution</h2>
          <p>
            The market has cleared. Awaiting the server to advance to the next
            day...
          </p>
          {/* A robust data table outlining clearing prices and routing costs goes here */}
        </div>
      )}
    </div>
  );
}
