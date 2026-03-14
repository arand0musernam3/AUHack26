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
    CANCEL_CARD = "CANCEL_CARD"

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
    delivery_country: str = "GER"

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
        
        self.WEATHER_FEATURES = ['temperature_2m (°C)', 'wind_speed_10m (km/h)', 'cloud_cover (%)', 'precipitation (mm)']

    def load_country_data(self, country_code: str):
        print(f"Loading data for {country_code}...")
        weather_prefix = 'DK' if country_code == 'DK1' else country_code
        weather_pattern = os.path.join(self.base_dir, 'weather', f'{weather_prefix}-open-meteo-*.csv')
        weather_files = glob.glob(weather_pattern)

        if not weather_files:
            print(f"  -> Missing weather file for {country_code}.")
            return False

        try:
            weather = pd.read_csv(weather_files[0], skiprows=2, parse_dates=['time'])
            consumption = pd.read_csv(os.path.join(self.base_dir, 'total-load', f'{country_code}-total-load.csv'), parse_dates=['time'])
            price = pd.read_csv(os.path.join(self.base_dir, 'spot-price', f'{country_code}-spot-price.csv'), parse_dates=['time'])
            gen = pd.read_csv(os.path.join(self.base_dir, 'generation', f'{country_code}-generation.csv'), parse_dates=['time'])
        except FileNotFoundError as e:
            print(f"  -> Missing file for {country_code}: {e}")
            return False

        gen['game_type'] = gen['type'].map(self.GEN_MAPPING)
        gen = gen.dropna(subset=['game_type'])
        gen_pivot = gen.groupby(['time', 'game_type'])['value (MW)'].sum().unstack(fill_value=0).reset_index()

        df = weather[['time'] + self.WEATHER_FEATURES].copy()
        df = pd.merge(df, consumption.rename(columns={'value (MW)': 'consumption_MW'}), on='time', how='inner')
        df = pd.merge(df, price.rename(columns={'value (EUR/MWh)': 'price_EUR'}), on='time', how='inner')
        df = pd.merge(df, gen_pivot, on='time', how='inner')

        for category in set(self.GEN_MAPPING.values()):
            if category not in df.columns:
                df[category] = 0.0

        self.country_data[country_code] = df
        return True

    def apply_weather_card(self, df_row: pd.DataFrame, powerup_type: ActionCardType) -> pd.DataFrame:
        modified_df = df_row.copy()
        
        modifiers = {
            ActionCardType.POLAR_VORTEX.value: {'Wind': 1.30, 'Solar': 0.10, 'Fossil': 0.95, 'Nuclear': 1.0, 'Water': 1.0, 'Consumption': 1.15, 'Price': 1.20},
            ActionCardType.HEAT_DOME.value: {'Wind': 0.80, 'Solar': 1.50, 'Fossil': 1.05, 'Nuclear': 0.85, 'Water': 0.70, 'Consumption': 1.10, 'Price': 1.15},
            ActionCardType.MONSOON.value: {'Wind': 0.60, 'Solar': 0.20, 'Fossil': 1.10, 'Nuclear': 1.0, 'Water': 1.40, 'Consumption': 0.95, 'Price': 1.05},
            ActionCardType.DEAD_CALM.value: {'Wind': 0.10, 'Solar': 1.20, 'Fossil': 1.10, 'Nuclear': 1.10, 'Water': 1.0, 'Consumption': 0.90, 'Price': 0.95}
        }

        mods = modifiers.get(powerup_type.value)
        if not mods: return modified_df

        modified_df['consumption_MW'] *= mods['Consumption']
        modified_df['price_EUR'] *= mods['Price']

        for gen_type in [e.value for e in EnergyType]:
            if gen_type in modified_df.columns:
                modified_df[gen_type] *= mods[gen_type]

        return modified_df

data_engine = EnergyDataEngine()

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
MATCH_STATE = GameState()
MATCH_STATE.phase = 3 

# Mock Data - FIXED: Added energy_type to prevent Pydantic crashes
MATCH_STATE.conducts = [
    Conduct(origin="FRA", destination="GER", base_cost=2.0, volume_capacity=100.0),
    Conduct(origin="ESP", destination="FRA", base_cost=3.5, volume_capacity=50.0)
]
MATCH_STATE.contracts = {
    "GER_1": Contract(contract_id="GER_1", origin_country="GER", energy_type=EnergyType.FOSSIL, delivery_country="FRA", available_volume=50.0, base_price=45.5),
    "ESP_1": Contract(contract_id="ESP_1", origin_country="ESP", energy_type=EnergyType.SOLAR, delivery_country="GER", available_volume=40.0, base_price=30.0)
}

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
        
        # Create a list of connections to avoid dict modification errors during iteration
        for connection in list(self.active_connections.values()):
            try:
                await connection.send_text(message)
            except Exception:
                pass # Handle stale connections gracefully

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
                    
                    if len(MATCH_STATE.ready_players) >= len(manager.active_connections) and len(manager.active_connections) > 0:
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