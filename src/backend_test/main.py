import asyncio
import json
import math
import heapq
import os
import glob
import random
import pandas as pd
from enum import Enum
from typing import Dict, List, Optional, Tuple
from collections import defaultdict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder

app = FastAPI()


# ==========================================
# 1. CORE DATA MODELS
# ==========================================
class EnergyType(str, Enum):
    WIND = "Wind"
    SOLAR = "Solar"
    WATER = "Water"
    FOSSIL = "Fossil"
    NUCLEAR = "Nuclear"


class ActionCardType(str, Enum):
    POLAR_VORTEX = "POLAR_VORTEX"
    HEAT_DOME = "HEAT_DOME"
    MONSOON = "MONSOON"
    DEAD_CALM = "DEAD_CALM"
    BOOST_ENERGY = "BOOST_ENERGY"
    NERF_ENERGY = "NERF_ENERGY"
    CUT_CONDUCT = "CUT_CONDUCT"
    FIX_CONDUCT = "FIX_CONDUCT"
    DISCOUNT_CONDUCT = "DISCOUNT_CONDUCT"
    NOPE_CARD = "NOPE_CARD"


class Bid(BaseModel):
    player_id: str
    price: float
    volume: float


class Contract(BaseModel):
    contract_id: str
    origin_country: str
    energy_type: EnergyType
    available_volume: float
    base_price: float
    bids: List[Bid] = []
    delivery_country: str = "GER"  # Default stub, to be determined by game rules


class Conduct(BaseModel):
    origin: str
    destination: str
    base_cost: float
    volume_capacity: float
    is_broken: bool = False


class GameState(BaseModel):
    phase: int = 1
    contracts: Dict[str, Contract] = {}
    player_balances: Dict[str, float] = {}
    ready_players: set = set()
    conducts: List[Conduct] = []


# ==========================================
# 2. HISTORICAL DATA & WEATHER ENGINE
# ==========================================
class EnergyDataEngine:
    def __init__(self, base_dir: str = "."):
        self.base_dir = base_dir
        self.country_data: Dict[str, pd.DataFrame] = {}
        self.active_countries: List[str] = []

        self.GEN_MAPPING = {
            'WIND ONSHORE': EnergyType.WIND.value,
            'WIND OFFSHORE': EnergyType.WIND.value,
            'SOLAR': EnergyType.SOLAR.value,
            'HYDRO PUMPED STORAGE': EnergyType.WATER.value,
            'HYDRO RUN-OF-RIVER AND POUNDAGE': EnergyType.WATER.value,
            'HYDRO WATER RESERVOIR': EnergyType.WATER.value,
            'HARD COAL': EnergyType.FOSSIL.value,
            'BROWN COAL/LIGNITE': EnergyType.FOSSIL.value,
            'GAS': EnergyType.FOSSIL.value,
            'OIL': EnergyType.FOSSIL.value,
            'BIOMASS': EnergyType.FOSSIL.value,
            'NUCLEAR': EnergyType.NUCLEAR.value
        }

        self.WEATHER_FEATURES = ['temperature_2m (°C)', 'wind_speed_10m (km/h)', 'cloud_cover (%)',
                                 'precipitation (mm)']

    def discover_countries(self):
        """Scans the generation folder to determine playable countries."""
        gen_path = os.path.join(self.base_dir, "generation", "*-generation.csv")
        files = glob.glob(gen_path)
        for f in files:
            basename = os.path.basename(f)
            country_code = basename.replace("-generation.csv", "")
            self.active_countries.append(country_code)
        print(f"Discovered {len(self.active_countries)} countries: {self.active_countries}")

    def load_conduct_graph(self) -> List[Conduct]:
        """Parses flow files to generate the interconnected grid."""
        conducts = []
        seen_edges = set()
        flow_path = os.path.join(self.base_dir, "flows", "*-physical-flows-in.csv")
        flow_files = glob.glob(flow_path)

        print("Generating Conduct Graph from flow data...")
        for file in flow_files:
            try:
                # Read only the 'zone' column to save memory and speed up startup
                df = pd.read_csv(file, usecols=['zone'])
                unique_zones = df['zone'].dropna().unique()

                for zone_str in unique_zones:
                    if '->' in str(zone_str):
                        origin, dest = str(zone_str).split('->')
                        origin = origin.strip()
                        dest = dest.strip()

                        edge = (origin, dest)
                        # We only create a conduct if we haven't seen this pair before
                        if edge not in seen_edges:
                            seen_edges.add(edge)
                            # Generate random capacities and costs for replayability
                            conducts.append(Conduct(
                                origin=origin,
                                destination=dest,
                                base_cost=round(random.uniform(1.0, 5.0), 2), # todo modify values
                                volume_capacity=round(random.uniform(50.0, 300.0), 1) # todo modify values
                            ))
            except Exception as e:
                print(f"Error parsing flows in {file}: {e}")

        print(f"Generated {len(conducts)} interconnecting conducts.")
        return conducts

    def generate_daily_contracts(self) -> Dict[str, Contract]:
        """Generates 3 random contracts per discovered country for Phase 1."""
        contracts = {}
        for country in self.active_countries:
            for i in range(1, 4):
                c_id = f"{country}_{i}"
                contracts[c_id] = Contract(
                    contract_id=c_id,
                    origin_country=country,
                    energy_type=random.choice(list(EnergyType)),
                    available_volume=round(random.uniform(20.0, 100.0), 1),
                    base_price=round(random.uniform(10.0, 80.0), 2),
                    # Randomizing a destination for testing routing logic
                    delivery_country=random.choice([c for c in self.active_countries if c != country])
                )
        return contracts


# ==========================================
# 3. GRAPH & ROUTING ENGINE
# ==========================================
class RoutingEngine:
    def __init__(self, conducts: List[Conduct]):
        self.conducts = conducts
        self.current_capacities = {id(c): c.volume_capacity for c in conducts}

    def _build_graph(self) -> Dict[str, List[Dict]]:
        graph = defaultdict(list)
        for c in self.conducts:
            if c.is_broken or self.current_capacities[id(c)] <= 0:
                continue
            graph[c.origin].append({'dest': c.destination, 'cost': c.base_cost, 'ref': c})
            # Assuming interconnectors are bidirecitonal based on typical energy grids
            graph[c.destination].append({'dest': c.origin, 'cost': c.base_cost, 'ref': c})
        return graph

    def _find_path(self, graph, start, end):
        pq = [(0.0, start, [])]
        visited = set()
        while pq:
            cost, node, path = heapq.heappop(pq)
            if node in visited: continue
            visited.add(node)
            if node == end:
                bottleneck = min(self.current_capacities[id(e['ref'])] for e in path) if path else 0
                return path, bottleneck, cost
            for edge in graph.get(node, []):
                if edge['dest'] not in visited:
                    heapq.heappush(pq, (cost + edge['cost'], edge['dest'], path + [edge]))
        return None, 0.0, 0.0

    def calculate_subpoly_cost(self, n_nodes: int, base_cost: float) -> float:
        return base_cost * (n_nodes * math.log(n_nodes) + 1) if n_nodes > 1 else base_cost

    def route_energy(self, origin: str, dest: str, volume: float) -> Tuple[float, float]:
        graph = self._build_graph()
        remaining = volume
        total_routing_cost = 0.0

        while remaining > 0:
            path, bottleneck, path_cost = self._find_path(graph, origin, dest)
            if not path or bottleneck <= 0:
                break

            push_vol = min(remaining, bottleneck)
            n_nodes = len(path) + 1
            final_cost = self.calculate_subpoly_cost(n_nodes, path_cost)

            total_routing_cost += (final_cost * push_vol)
            remaining -= push_vol

            for edge in path:
                self.current_capacities[id(edge['ref'])] -= push_vol
            graph = self._build_graph()

        return remaining, total_routing_cost

    # ==========================================


# 4. STATE INITIALIZATION & WEBSOCKET SETUP
# ==========================================
# Initialize Data Engine and dynamically load map
data_engine = EnergyDataEngine(base_dir="../../dataset")
data_engine.discover_countries()
dynamic_conducts = data_engine.load_conduct_graph()
dynamic_contracts = data_engine.generate_daily_contracts()

MATCH_STATE = GameState()
MATCH_STATE.phase = 3
MATCH_STATE.conducts = dynamic_conducts
MATCH_STATE.contracts = dynamic_contracts

state_lock = asyncio.Lock()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        if player_id not in MATCH_STATE.player_balances:
            MATCH_STATE.player_balances[player_id] = 1000000.0

    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]

    async def broadcast_state(self):
        state_dict = jsonable_encoder(MATCH_STATE)
        state_dict['ready_players'] = list(MATCH_STATE.ready_players)
        message = json.dumps({"type": "STATE_UPDATE", "data": state_dict})

        for connection in list(self.active_connections.values()):
            try:
                await connection.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


# ==========================================
# 5. WEBSOCKET ENDPOINT
# ==========================================
@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await manager.connect(websocket, player_id)
    await manager.broadcast_state()

    try:
        while True:
            data = await websocket.receive_text()

            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON payload"}))
                continue

            async with state_lock:
                if payload.get("action") == "SUBMIT_BIDS" and MATCH_STATE.phase == 3:

                    bids = payload.get("bids", [])

                    if len(bids) > 5:
                        await websocket.send_text(json.dumps({"error": "Maximum 5 bids allowed."}))
                        continue

                    total_exposure = sum(b["volume"] * b["price"] for b in bids)
                    if total_exposure > MATCH_STATE.player_balances[player_id]:
                        await websocket.send_text(json.dumps({"error": "Insufficient capital for these bids."}))
                        continue

                    for bid_data in bids:
                        contract_id = bid_data["contract_id"]
                        if contract_id in MATCH_STATE.contracts:
                            MATCH_STATE.contracts[contract_id].bids.append(
                                Bid(player_id=player_id, price=bid_data["price"], volume=bid_data["volume"])
                            )

                    MATCH_STATE.ready_players.add(player_id)

                    if len(MATCH_STATE.ready_players) >= len(manager.active_connections) and len(
                            manager.active_connections) > 0:
                        MATCH_STATE.phase = 4
                        router = RoutingEngine(MATCH_STATE.conducts)

                        for cid, contract in MATCH_STATE.contracts.items():
                            if not contract.bids: continue

                            sorted_bids = sorted(contract.bids, key=lambda x: x.price, reverse=True)
                            winning_bid = sorted_bids[0]
                            clearing_price = sorted_bids[1].price if len(sorted_bids) > 1 else contract.base_price

                            shortfall, routing_cost = router.route_energy(
                                origin=contract.origin_country,
                                dest=contract.delivery_country,
                                volume=winning_bid.volume
                            )

                            total_cost = (winning_bid.volume * clearing_price) + routing_cost
                            penalty = (shortfall * clearing_price) * 2.0

                            MATCH_STATE.player_balances[winning_bid.player_id] -= (total_cost + penalty)

                        MATCH_STATE.ready_players.clear()

                await manager.broadcast_state()

    except WebSocketDisconnect:
        manager.disconnect(player_id)
        await manager.broadcast_state()