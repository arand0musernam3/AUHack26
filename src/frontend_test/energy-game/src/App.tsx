import React, { useState, useEffect, useRef, useMemo } from "react";

// --- 1. Type Definitions ---
interface Bid {
  player_id: string;
  total_bid_price: number;
}

interface Contract {
  contract_id: string;
  contract_type: "BUY_FROM" | "SELL_TO";
  target_country: string;
  energy_type: string;
  volume: number;
  base_price_per_mw: number;
  total_base_price: number;
  execution_round: number;
  bids: Bid[];
}

interface GameState {
  current_round: number;
  phase: number;
  current_timestamp: string;
  contracts: Record<string, Contract>;
  player_balances: Record<string, number>;
  player_portfolios: Record<string, Contract[]>;
  ready_players: string[];
}

type SortConfig = {
  key: keyof Contract;
  direction: "asc" | "desc";
} | null;

const WS_URL = "ws://127.0.0.1:8000/ws";

export default function App() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bids, setBids] = useState<Record<string, number>>({});
  
  // New state to track how the table is sorted
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
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
      } else if (message.error) {
        alert(`Server Error: ${message.error}`);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  // --- 3. Interaction & Sorting Logic ---
  const handleBidChange = (contractId: string, value: string) => {
    setBids((prev) => ({
      ...prev,
      [contractId]: parseFloat(value) || 0,
    }));
  };

  const submitBids = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const formattedBids = Object.entries(bids)
      .filter(([_, total_bid_price]) => total_bid_price > 0)
      .map(([contract_id, total_bid_price]) => ({
        contract_id,
        total_bid_price,
      }));

    if (formattedBids.length > 5) {
      alert("You can only bid on a maximum of 5 contracts per round.");
      return;
    }

    ws.current.send(
      JSON.stringify({
        action: "SUBMIT_BIDS",
        bids: formattedBids,
      })
    );
  };

  // Helper function to handle header clicks
  const requestSort = (key: keyof Contract) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Dynamically sort contracts based on current SortConfig
  const sortedContracts = useMemo(() => {
    if (!gameState?.contracts) return [];
    
    let sortableContracts = Object.values(gameState.contracts);
    
    if (sortConfig !== null) {
      sortableContracts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableContracts;
  }, [gameState?.contracts, sortConfig]);

  // Helper component for table headers to show up/down arrows
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Contract }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
      <th 
        onClick={() => requestSort(sortKey)} 
        style={{ padding: "8px", cursor: "pointer", userSelect: "none", borderBottom: "2px solid #ccc" }}
      >
        {label} {isSorted ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕️"}
      </th>
    );
  };

  // --- 4. Render Logic ---
  if (!playerId) return <div>Please refresh and enter a Player ID.</div>;
  if (!gameState) return <div>Connecting to Central Bank server...</div>;

  const myPortfolio = gameState.player_portfolios[playerId] || [];

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Energy Market - Player: {playerId}</h1>
      
      {/* Top Status Bar */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ padding: "10px", border: "1px solid black", background: "#f0f0f0" }}>
          <strong>Round:</strong> {gameState.current_round}
        </div>
        <div style={{ padding: "10px", border: "1px solid black", background: "#f0f0f0" }}>
          <strong>Date:</strong> {new Date(gameState.current_timestamp).toLocaleDateString()}
        </div>
        <div style={{ padding: "10px", border: "1px solid black" }}>
          <strong>Phase:</strong> {gameState.phase}
        </div>
        <div style={{ padding: "10px", border: "2px solid green", fontWeight: "bold" }}>
          <strong>Balance:</strong> €{Math.floor(gameState.player_balances[playerId] || 0).toLocaleString()}
        </div>
      </div>

      {/* Player Portfolio Section */}
      <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h2>Your Active Portfolio</h2>
        {myPortfolio.length === 0 ? (
          <p>No active forwards contracts.</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th>Type</th>
                <th>Target</th>
                <th>Energy</th>
                <th>Volume</th>
                <th>Executes In (Round)</th>
              </tr>
            </thead>
            <tbody>
              {myPortfolio.map((c, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ color: c.contract_type === "BUY_FROM" ? "green" : "red", fontWeight: "bold" }}>
                    {c.contract_type === "BUY_FROM" ? "RECEIVE" : "DELIVER"}
                  </td>
                  <td>{c.target_country}</td>
                  <td>{c.energy_type}</td>
                  <td>{c.volume} MW</td>
                  <td>Round {c.execution_round}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bidding Market Section */}
      {gameState.phase === 3 && (
        <div>
          <h2>Central Market - Forward Contracts</h2>
          <p><em>Place your total € bid for the entire contract volume. Max 5 bids. Click headers to sort.</em></p>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <SortableHeader label="ID" sortKey="contract_id" />
                <SortableHeader label="Type" sortKey="contract_type" />
                <SortableHeader label="Target" sortKey="target_country" />
                <SortableHeader label="Source" sortKey="energy_type" />
                <SortableHeader label="Volume" sortKey="volume" />
                <SortableHeader label="Base Value" sortKey="total_base_price" />
                <SortableHeader label="Maturity" sortKey="execution_round" />
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Your Bid (€ Total)</th>
              </tr>
            </thead>
            <tbody>
              {/* Mapping over sortedContracts instead of Object.values directly */}
              {sortedContracts.map((contract) => (
                <tr key={contract.contract_id} style={{ borderBottom: "1px solid #ccc", transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: "8px", fontSize: "0.8em", color: "#666" }}>{contract.contract_id}</td>
                  <td style={{ padding: "8px", color: contract.contract_type === "BUY_FROM" ? "green" : "red", fontWeight: "bold" }}>
                    {contract.contract_type.replace("_", " ")}
                  </td>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>{contract.target_country}</td>
                  <td style={{ padding: "8px" }}>{contract.energy_type}</td>
                  <td style={{ padding: "8px" }}>{contract.volume} MW</td>
                  <td style={{ padding: "8px" }}>
                    €{contract.total_base_price.toLocaleString()} <br/>
                    <small style={{ color: "#666" }}>(€{contract.base_price_per_mw}/MW)</small>
                  </td>
                  <td style={{ padding: "8px" }}>Round {contract.execution_round}</td>
                  <td style={{ padding: "8px" }}>
                    <input
                      type="number"
                      placeholder={`min ~€${contract.total_base_price}`}
                      value={bids[contract.contract_id] || ""}
                      onChange={(e) => handleBidChange(contract.contract_id, e.target.value)}
                      style={{ padding: "5px", width: "120px" }}
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
              cursor: gameState.ready_players.includes(playerId) ? "not-allowed" : "pointer",
              background: gameState.ready_players.includes(playerId) ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold"
            }}
          >
            {gameState.ready_players.includes(playerId)
              ? "Waiting for others..."
              : "Submit Bids"}
          </button>
        </div>
      )}
    </div>
  );
}