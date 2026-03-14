import React, { useState, useEffect, useRef, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Line, Marker, ZoomableGroup } from "react-simple-maps";

// --- 1. Constants & Map Data ---
// Switched to a hyper-stable global CDN. The projectionConfig will zoom us in on Europe.
const WORLD_TOPO_JSON = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const COUNTRY_COORDS: Record<string, [number, number]> = {
  FR: [2.2137, 46.2276],
  DE: [10.4515, 51.1657],
  PL: [19.1451, 51.9194],
  DK1: [9.5018, 56.2639], 
  DK2: [11.5018, 55.2639],
  NL: [5.2913, 52.1326],
  BE: [4.4699, 50.5039],
  AT: [14.5501, 47.5162],
  CH: [8.2275, 46.8182],
  CZ: [15.4730, 49.8175]
};

// --- 2. Type Definitions ---
interface Bid { player_id: string; total_bid_price: number; }
interface Conduct { origin: string; destination: string; base_cost: number; volume_capacity: number; is_broken: boolean; }
interface Contract {
  contract_id: string; contract_type: "BUY_FROM" | "SELL_TO"; target_country: string;
  energy_type: string; volume: number; base_price_per_mw: number;
  total_base_price: number; execution_round: number; bids: Bid[];
}
interface GameState {
  current_round: number; phase: number; current_timestamp: string;
  contracts: Record<string, Contract>; player_balances: Record<string, number>;
  player_portfolios: Record<string, Contract[]>; conducts: Conduct[]; ready_players: string[];
}
type SortConfig = { key: keyof Contract; direction: "asc" | "desc"; } | null;

const WS_URL = "ws://127.0.0.1:8000/ws";

export default function App() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // Bidding & Sorting State
  const [bids, setBids] = useState<Record<string, number>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  // Routing UI State
  const [routeOrigin, setRouteOrigin] = useState<string>("");
  const [routeDest, setRouteDest] = useState<string>("");
  const [routeVolume, setRouteVolume] = useState<number>(0);
  const [tollBid, setTollBid] = useState<number>(1);
  const [plannedRoutes, setPlannedRoutes] = useState<any[]>([]);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const id = prompt("Enter your Player ID:");
    if (!id) return;
    setPlayerId(id);

    ws.current = new WebSocket(`${WS_URL}/${id}`);
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "STATE_UPDATE") setGameState(message.data);
      else if (message.error) alert(`Server Error: ${message.error}`);
    };
    return () => ws.current?.close();
  }, []);

  // --- 3. Netting Math ---
  const netPositions = useMemo(() => {
    if (!gameState || !playerId) return {};
    const portfolio = gameState.player_portfolios[playerId] || [];
    const maturing = portfolio.filter(c => c.execution_round <= gameState.current_round);
    
    const positions: Record<string, number> = {};
    maturing.forEach(c => {
      if (!positions[c.target_country]) positions[c.target_country] = 0;
      positions[c.target_country] += c.contract_type === "BUY_FROM" ? c.volume : -c.volume;
    });
    return positions;
  }, [gameState, playerId]);

  // --- 4. Interactions: Bidding ---
  const handleBidChange = (contractId: string, value: string) => {
    setBids(prev => ({ ...prev, [contractId]: parseFloat(value) || 0 }));
  };

  const submitBids = () => {
    const formattedBids = Object.entries(bids)
      .filter(([_, total_bid_price]) => total_bid_price > 0)
      .map(([contract_id, total_bid_price]) => ({ contract_id, total_bid_price }));

    if (formattedBids.length > 5) return alert("Maximum 5 bids allowed per round.");
    ws.current?.send(JSON.stringify({ action: "SUBMIT_BIDS", bids: formattedBids }));
    setBids({}); // clear inputs after submitting
  };

  const requestSort = (key: keyof Contract) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedContracts = useMemo(() => {
    if (!gameState?.contracts) return [];
    let sortable = Object.values(gameState.contracts);
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [gameState?.contracts, sortConfig]);

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Contract }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
      <th onClick={() => requestSort(sortKey)} style={{ padding: "8px", cursor: "pointer", borderBottom: "2px solid #ccc" }}>
        {label} {isSorted ? (sortConfig.direction === "asc" ? "🔼" : "🔽") : "↕️"}
      </th>
    );
  };

  // --- 5. Interactions: Routing ---
  const addPlannedRoute = () => {
    if (!routeOrigin || !routeDest || routeVolume <= 0 || tollBid < 1) return alert("Invalid route details. Minimum toll bid is 1x.");
    setPlannedRoutes(prev => [...prev, { origin: routeOrigin, dest: routeDest, volume: routeVolume, toll_bid: tollBid }]);
    setRouteOrigin(""); setRouteDest(""); setRouteVolume(0); setTollBid(1);
  };

  const submitRoutes = () => {
    ws.current?.send(JSON.stringify({ action: "SUBMIT_ROUTES", routes: plannedRoutes }));
    setPlannedRoutes([]);
  };

  if (!playerId || !gameState) return <div style={{ padding: "20px" }}>Loading grid...</div>;
  const myPortfolio = gameState.player_portfolios[playerId] || [];

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1600px", margin: "0 auto" }}>
      
      {/* TOP SECTION: Flex layout for Stats + Map */}
      <div style={{ display: "flex", gap: "20px", height: "65vh" }}>
        
        {/* LEFT COLUMN: Controls & Net Positions */}
        <div style={{ width: "350px", display: "flex", flexDirection: "column", gap: "15px", overflowY: "auto" }}>
          <div style={{ padding: "15px", border: "1px solid #ccc", background: "#f8f9fa", borderRadius: "8px" }}>
            <h2 style={{ margin: "0 0 10px 0" }}>Player: {playerId}</h2>
            <p style={{ margin: "5px 0" }}><strong>Round:</strong> {gameState.current_round} | <strong>Phase:</strong> {gameState.phase}</p>
            <p style={{ margin: "5px 0", fontSize: "0.9em", color: "#666" }}>
              {gameState.current_timestamp ? new Date(gameState.current_timestamp).toLocaleDateString() : ""}
            </p>
            <h3 style={{ color: "green", margin: "10px 0 0 0" }}>Balance: €{Math.floor(gameState.player_balances[playerId] || 0).toLocaleString()}</h3>
          </div>

          <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 5px 0" }}>Today's Net Positions</h3>
            <p style={{ fontSize: "0.85em", color: "#666", margin: "0 0 10px 0" }}>Resolve negatives to avoid 5x Central Market penalties.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {Object.entries(netPositions).length === 0 && <li style={{ color: "#999" }}>No maturing contracts today.</li>}
              {Object.entries(netPositions).map(([country, mw]) => (
                <li key={country} style={{ padding: "5px 0", fontWeight: "bold", color: mw < 0 ? "#dc3545" : mw > 0 ? "#28a745" : "gray" }}>
                  {country}: {mw > 0 ? `+${mw}` : mw} MW
                </li>
              ))}
            </ul>
          </div>

          {gameState.phase === 5 && (
            <div style={{ padding: "15px", border: "2px solid #007bff", background: "#e9f2ff", borderRadius: "8px" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Plan Routes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <select value={routeOrigin} onChange={e => setRouteOrigin(e.target.value)} style={{ padding: "5px" }}>
                  <option value="">Origin (Surplus Node)...</option>
                  {Object.keys(COUNTRY_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={routeDest} onChange={e => setRouteDest(e.target.value)} style={{ padding: "5px" }}>
                  <option value="">Destination (Deficit Node)...</option>
                  {Object.keys(COUNTRY_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Volume (MW)" value={routeVolume || ""} onChange={e => setRouteVolume(Number(e.target.value))} style={{ padding: "5px" }} />
                <input type="number" placeholder="Toll Multiplier (e.g. 1.5)" value={tollBid || ""} onChange={e => setTollBid(Number(e.target.value))} style={{ padding: "5px" }} />
                <button onClick={addPlannedRoute} style={{ padding: "8px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Add to Queue</button>
              </div>

              {plannedRoutes.length > 0 && (
                <div style={{ marginTop: "15px", borderTop: "1px solid #b3d7ff", paddingTop: "10px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>Queued Routes:</h4>
                  <ul style={{ fontSize: "0.85em", paddingLeft: "20px", margin: "0 0 10px 0" }}>
                    {plannedRoutes.map((r, i) => (
                      <li key={i}>{r.origin} ➔ {r.dest} | {r.volume}MW @ {r.toll_bid}x toll</li>
                    ))}
                  </ul>
                  <button onClick={submitRoutes} disabled={gameState.ready_players.includes(playerId)} style={{ width: "100%", padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                    {gameState.ready_players.includes(playerId) ? "WAITING..." : "SUBMIT ROUTING BIDS"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: The Interactive Map */}
        <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "8px", position: "relative", background: "#cce5ff", overflow: "hidden" }}>
          <ComposableMap projection="geoAzimuthalEqualArea" projectionConfig={{ scale: 1200, center: [10, 51] }} style={{ width: "100%", height: "100%" }}>
            <ZoomableGroup>
              <Geographies geography={WORLD_TOPO_JSON}>
                {({ geographies }) => geographies.map(geo => (
                  <Geography key={geo.rsmKey} geography={geo} fill="#f0f0f0" stroke="#d6d6da" strokeWidth={0.5} />
                ))}
              </Geographies>

              {gameState.conducts.map((conduct, i) => {
                const fromCoord = COUNTRY_COORDS[conduct.origin];
                const toCoord = COUNTRY_COORDS[conduct.destination];
                if (!fromCoord || !toCoord) return null;
                return (
                  <g key={i}>
                    <Line from={fromCoord} to={toCoord} stroke={conduct.is_broken ? "#ff4d4d" : "#ff9900"} strokeWidth={Math.max(1, conduct.volume_capacity / 30)} strokeOpacity={0.6} />
                    <circle cx={(fromCoord[0] + toCoord[0]) / 2} cy={(fromCoord[1] + toCoord[1]) / 2} r={4} fill="#333" style={{ cursor: "pointer" }}>
                      <title>{`${conduct.origin}➔${conduct.destination}\nCap: ${conduct.volume_capacity}MW\nCost: €${conduct.base_cost}/MW`}</title>
                    </circle>
                  </g>
                );
              })}

              {Object.entries(COUNTRY_COORDS).map(([country, coords]) => {
                const netPos = netPositions[country] || 0;
                return (
                  <Marker key={country} coordinates={coords}>
                    <circle r={12} fill={netPos < 0 ? "#dc3545" : netPos > 0 ? "#28a745" : "#6c757d"} stroke="#fff" strokeWidth={2} />
                    <text textAnchor="middle" y={4} fill="#fff" fontSize={10} fontWeight="bold">{country}</text>
                    {netPos !== 0 && (
                      <text textAnchor="middle" y={-16} fill={netPos < 0 ? "#dc3545" : "#28a745"} fontSize={12} fontWeight="bold" stroke="#fff" strokeWidth={0.5}>
                        {netPos > 0 ? `+${netPos}` : netPos}
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Map Legend */}
          <div style={{ position: "absolute", bottom: 15, left: 15, background: "rgba(255,255,255,0.9)", padding: "10px", borderRadius: "5px", fontSize: "0.85em", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h4 style={{ margin: "0 0 5px 0" }}>Grid Legend</h4>
            <div style={{ margin: "3px 0" }}><span style={{ color: "#ff9900", fontWeight: "bold" }}>───</span> Active Line (Width = Cap)</div>
            <div style={{ margin: "3px 0" }}><span style={{ color: "#dc3545", fontWeight: "bold" }}>●</span> Deficit (Needs Energy)</div>
            <div style={{ margin: "3px 0" }}><span style={{ color: "#28a745", fontWeight: "bold" }}>●</span> Surplus (Has Energy)</div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Tables */}
      <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "30px" }}>
        
        {/* Portfolio Table */}
        <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>Your Active Portfolio</h2>
          {myPortfolio.length === 0 ? <p style={{ color: "#666" }}>No active forwards contracts.</p> : (
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc", background: "#f8f9fa" }}>
                  <th style={{ padding: "8px" }}>Type</th>
                  <th style={{ padding: "8px" }}>Target Node</th>
                  <th style={{ padding: "8px" }}>Energy Source</th>
                  <th style={{ padding: "8px" }}>Volume</th>
                  <th style={{ padding: "8px" }}>Executes In</th>
                </tr>
              </thead>
              <tbody>
                {myPortfolio.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px", color: c.contract_type === "BUY_FROM" ? "green" : "red", fontWeight: "bold" }}>
                      {c.contract_type === "BUY_FROM" ? "RECEIVE (+)" : "DELIVER (-)"}
                    </td>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>{c.target_country}</td>
                    <td style={{ padding: "8px" }}>{c.energy_type}</td>
                    <td style={{ padding: "8px" }}>{c.volume} MW</td>
                    <td style={{ padding: "8px" }}>Round {c.execution_round}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bidding Market Table (Phase 3 only) */}
        {gameState.phase === 3 && (
          <div style={{ padding: "15px", border: "2px solid #ccc", borderRadius: "8px", background: "#fff" }}>
            <h2 style={{ marginTop: 0 }}>Central Market - Forward Contracts</h2>
            <p style={{ color: "#666", fontSize: "0.9em" }}>Place your total € bid for the entire contract volume. Click headers to sort.</p>
            
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "0.95em" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
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
                {sortedContracts.map((contract) => (
                  <tr key={contract.contract_id} style={{ borderBottom: "1px solid #eee" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: "8px", color: "#666", fontSize: "0.85em" }}>{contract.contract_id}</td>
                    <td style={{ padding: "8px", color: contract.contract_type === "BUY_FROM" ? "green" : "red", fontWeight: "bold" }}>
                      {contract.contract_type.replace("_", " ")}
                    </td>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>{contract.target_country}</td>
                    <td style={{ padding: "8px" }}>{contract.energy_type}</td>
                    <td style={{ padding: "8px" }}>{contract.volume} MW</td>
                    <td style={{ padding: "8px" }}>
                      €{contract.total_base_price.toLocaleString()} <br/>
                      <span style={{ color: "#888", fontSize: "0.85em" }}>(€{contract.base_price_per_mw}/MW)</span>
                    </td>
                    <td style={{ padding: "8px" }}>Round {contract.execution_round}</td>
                    <td style={{ padding: "8px" }}>
                      <input
                        type="number"
                        placeholder={`min ~€${contract.total_base_price}`}
                        value={bids[contract.contract_id] || ""}
                        onChange={(e) => handleBidChange(contract.contract_id, e.target.value)}
                        style={{ padding: "6px", width: "120px", borderRadius: "4px", border: "1px solid #ccc" }}
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
                marginTop: "20px", padding: "12px 24px", fontSize: "1em",
                cursor: gameState.ready_players.includes(playerId) ? "not-allowed" : "pointer",
                background: gameState.ready_players.includes(playerId) ? "#6c757d" : "#28a745",
                color: "white", border: "none", borderRadius: "5px", fontWeight: "bold"
              }}
            >
              {gameState.ready_players.includes(playerId) ? "Waiting for others..." : "SUBMIT BIDS"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}