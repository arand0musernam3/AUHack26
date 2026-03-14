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


class ContractType(str, Enum):
    BUY_FROM = "BUY_FROM"
    SELL_TO = "SELL_TO"


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
    total_bid_price: float


class Contract(BaseModel):
    contract_id: str
    contract_type: ContractType
    target_country: str
    energy_type: EnergyType
    volume: float
    base_price_per_mw: float
    total_base_price: float
    execution_round: int
    bids: List[Bid] = []


class Conduct(BaseModel):
    origin: str
    destination: str
    base_cost: float
    volume_capacity: float
    is_broken: bool = False


class GameState(BaseModel):
    current_round: int = 1
    phase: int = 3
    current_timestamp: str = ""
    contracts: Dict[str, Contract] = {}
    player_balances: Dict[str, float] = {}
    player_portfolios: Dict[str, List[Contract]] = defaultdict(list)
    ready_players: set = set()
    conducts: List[Conduct] = []


# ==========================================
# 2. HISTORICAL DATA ENGINE
# ==========================================
class EnergyDataEngine:
    def __init__(self, base_dir: str = "."):
        self.base_dir = base_dir
        self.country_data: Dict[str, pd.DataFrame] = {}
        self.active_countries: List[str] = []
        self.current_time: Optional[pd.Timestamp] = None

        self.GEN_MAPPING = {
            'WIND ONSHORE': EnergyType.WIND.value, 'WIND OFFSHORE': EnergyType.WIND.value,
            'SOLAR': EnergyType.SOLAR.value, 'HYDRO PUMPED STORAGE': EnergyType.WATER.value,
            'HYDRO RUN-OF-RIVER AND POUNDAGE': EnergyType.WATER.value, 'HYDRO WATER RESERVOIR': EnergyType.WATER.value,
            'HARD COAL': EnergyType.FOSSIL.value, 'BROWN COAL/LIGNITE': EnergyType.FOSSIL.value,
            'GAS': EnergyType.FOSSIL.value, 'OIL': EnergyType.FOSSIL.value, 'BIOMASS': EnergyType.FOSSIL.value,
            'NUCLEAR': EnergyType.NUCLEAR.value
        }
        self.WEATHER_FEATURES = ['temperature_2m (°C)', 'wind_speed_10m (km/h)', 'cloud_cover (%)',
                                 'precipitation (mm)']

    def discover_countries(self):
        gen_path = os.path.join(self.base_dir, "generation", "*-generation.csv")
        for f in glob.glob(gen_path):
            self.active_countries.append(os.path.basename(f).replace("-generation.csv", ""))
        print(f"Discovered {len(self.active_countries)} countries: {self.active_countries}")

    def load_all_data(self):
        print("Loading data from all countries...")
        for country in self.active_countries:
            weather_prefix = 'DK' if country == 'DK1' else country
            w_files = glob.glob(os.path.join(self.base_dir, 'weather', f'{weather_prefix}-open-meteo-*.csv'))
            if not w_files: continue

            try:
                weather = pd.read_csv(w_files[0], skiprows=2, parse_dates=['time'])
                consumption = pd.read_csv(os.path.join(self.base_dir, 'total-load', f'{country}-total-load.csv'),
                                          parse_dates=['time'])
                price = pd.read_csv(os.path.join(self.base_dir, 'spot-price', f'{country}-spot-price.csv'),
                                    parse_dates=['time'])
                gen = pd.read_csv(os.path.join(self.base_dir, 'generation', f'{country}-generation.csv'),
                                  parse_dates=['time'])

                gen['game_type'] = gen['type'].map(self.GEN_MAPPING)
                gen_pivot = gen.dropna(subset=['game_type']).groupby(['time', 'game_type'])['value (MW)'].sum().unstack(
                    fill_value=0).reset_index()

                df = weather[['time'] + self.WEATHER_FEATURES].copy()
                df = pd.merge(df, consumption.rename(columns={'value (MW)': 'consumption_MW'}), on='time', how='inner')
                df = pd.merge(df, price.rename(columns={'value (EUR/MWh)': 'price_EUR'}), on='time', how='inner')
                df = pd.merge(df, gen_pivot, on='time', how='inner')
                self.country_data[country] = df
            except Exception:
                pass
            print("Country: ", country, df)

    def load_conduct_graph(self) -> List[Conduct]:
        conducts, max_flows = [], {}
        print("Generating Conduct Graph from flow data...")
        for file in glob.glob(os.path.join(self.base_dir, "flows", "*-physical-flows-in.csv")):
            try:
                df = pd.read_csv(file, usecols=['zone', 'value (MW)']).dropna()
                for zone_str, max_val in df.groupby('zone')['value (MW)'].max().items():
                    if '->' in str(zone_str):
                        origin, dest = [x.strip() for x in str(zone_str).split('->')]
                        edge = (origin, dest)
                        if edge not in max_flows or max_val > max_flows[edge]:
                            max_flows[edge] = max_val
            except Exception:
                pass

        for (origin, dest), max_mw in max_flows.items():
            cap = max(10.0, max_mw / 20.0)
            conducts.append(Conduct(
                origin=origin, destination=dest,
                base_cost=max(1.0, round(5.0 - (cap / 100.0), 2)), volume_capacity=round(cap, 1)
            ))
        print(f"Generated {len(conducts)} interconnecting conducts.")
        return conducts

    def pick_random_start_time(self):
        if not self.active_countries: return None
        df = self.country_data[self.active_countries[0]]
        self.current_time = df.iloc[random.randint(0, int(len(df) * 0.95))]['time']
        return self.current_time

    def advance_time(self, days=1):
        """Advances the historical dataset forward by X days to simulate progressing game rounds."""
        if self.current_time:
            self.current_time += pd.Timedelta(days=days)

    def generate_contracts_for_round(self, current_round: int) -> Dict[str, Contract]:
        contracts = {}
        if self.current_time is None: return contracts

        for country in self.active_countries:
            df = self.country_data.get(country)
            if df is None or df.empty: continue

            row = df[df['time'] == self.current_time]
            if row.empty: continue
            row = row.iloc[0]

            gen_types = {e: row[e.value] for e in EnergyType if e.value in row and row[e.value] > 0}
            sorted_gen = [k for k, v in sorted(gen_types.items(), key=lambda x: x[1], reverse=True)]
            selected_sources = sorted_gen[:3] if len(sorted_gen) >= 3 else (sorted_gen * 3)[:3]
            if not selected_sources: selected_sources = [EnergyType.FOSSIL, EnergyType.WIND, EnergyType.SOLAR]

            base_price = row.get('price_EUR', 40.0)

            for i in range(3):
                c_id = f"{country}_{current_round}_{i + 1}"
                e_type = selected_sources[i]
                volume = round(max(10.0, min(gen_types.get(e_type, 1000.0) / 20.0, 150.0)), 1)
                c_type = random.choice(list(ContractType))
                price_per_mw = round(base_price + random.uniform(-5.0, 5.0), 2)

                contracts[c_id] = Contract(
                    contract_id=c_id,
                    contract_type=c_type,
                    target_country=country,
                    energy_type=e_type,
                    volume=volume,
                    base_price_per_mw=price_per_mw,
                    total_base_price=round(volume * price_per_mw, 2),
                    execution_round=current_round + random.randint(1, 3)
                )
        return contracts


# ==========================================
# 3. ROUTING & SETTLEMENT ENGINE
# ==========================================
class RoutingEngine:
    def __init__(self, conducts: List[Conduct]):
        self.conducts = conducts
        self.current_capacities = {id(c): c.volume_capacity for c in conducts}

    def _build_graph(self) -> Dict[str, List[Dict]]:
        graph = defaultdict(list)
        for c in self.conducts:
            if not c.is_broken and self.current_capacities[id(c)] > 0:
                graph[c.origin].append({'dest': c.destination, 'cost': c.base_cost, 'ref': c})
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
        if origin == dest: return 0.0, 0.0

        remaining, total_routing_cost = volume, 0.0
        graph = self._build_graph()

        while remaining > 0:
            path, bottleneck, path_cost = self._find_path(graph, origin, dest)
            if not path or bottleneck <= 0: break

            push_vol = min(remaining, bottleneck)
            final_cost = self.calculate_subpoly_cost(len(path) + 1, path_cost)
            total_routing_cost += (final_cost * push_vol)
            remaining -= push_vol

            for edge in path: self.current_capacities[id(edge['ref'])] -= push_vol
            graph = self._build_graph()

        return remaining, total_routing_cost


def settle_maturing_contracts(state: GameState):
    """Phase 5: Execute contracts maturing this round and apply Central Market penalties."""
    router = RoutingEngine(state.conducts)

    for player_id, portfolio in state.player_portfolios.items():
        maturing_contracts = [c for c in portfolio if c.execution_round <= state.current_round]
        if not maturing_contracts: continue

        state.player_portfolios[player_id] = [c for c in portfolio if c.execution_round > state.current_round]

        buys = [c for c in maturing_contracts if c.contract_type == ContractType.BUY_FROM]
        sells = [c for c in maturing_contracts if c.contract_type == ContractType.SELL_TO]

        for sell_contract in sells:
            owed = sell_contract.volume
            for buy_contract in buys:
                if owed <= 0 or buy_contract.volume <= 0: continue

                transfer_vol = min(owed, buy_contract.volume)
                shortfall, routing_cost = router.route_energy(buy_contract.target_country, sell_contract.target_country,
                                                              transfer_vol)

                successfully_routed = transfer_vol - shortfall
                owed -= successfully_routed
                buy_contract.volume -= successfully_routed
                state.player_balances[player_id] -= routing_cost

            if owed > 0:
                emergency_price = owed * (sell_contract.base_price_per_mw * 5.0)
                state.player_balances[player_id] -= emergency_price

        for buy_contract in buys:
            if buy_contract.volume > 0:
                dump_revenue = buy_contract.volume * (buy_contract.base_price_per_mw * 0.10)
                state.player_balances[player_id] += dump_revenue


# ==========================================
# 4. INITIALIZATION & WEBSOCKET SETUP
# ==========================================
data_engine = EnergyDataEngine(base_dir="../../dataset")
data_engine.discover_countries()
data_engine.load_all_data()
data_engine.pick_random_start_time()

MATCH_STATE = GameState()
MATCH_STATE.conducts = data_engine.load_conduct_graph()
MATCH_STATE.contracts = data_engine.generate_contracts_for_round(MATCH_STATE.current_round)

state_lock = asyncio.Lock()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, ws: WebSocket, p_id: str):
        await ws.accept()
        self.active_connections[p_id] = ws
        if p_id not in MATCH_STATE.player_balances: MATCH_STATE.player_balances[p_id] = 1000000.0

    def disconnect(self, p_id: str):
        if p_id in self.active_connections: del self.active_connections[p_id]

    async def broadcast_state(self):
        # Update timestamp string right before sending
        MATCH_STATE.current_timestamp = str(data_engine.current_time) if data_engine.current_time else ""
        msg = json.dumps({"type": "STATE_UPDATE", "data": jsonable_encoder(MATCH_STATE)})
        for conn in list(self.active_connections.values()):
            try:
                await conn.send_text(msg)
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
                continue

            async with state_lock:
                if payload.get("action") == "SUBMIT_BIDS" and MATCH_STATE.phase == 3:

                    bids = payload.get("bids", [])
                    if len(bids) > 5:
                        await websocket.send_text(json.dumps({"error": "Maximum 5 bids allowed."}))
                        continue

                    total_exposure = sum(b["total_bid_price"] for b in bids)
                    if total_exposure > MATCH_STATE.player_balances[player_id]:
                        await websocket.send_text(json.dumps({"error": "Insufficient capital for these bids."}))
                        continue

                    for bid_data in bids:
                        c_id = bid_data["contract_id"]
                        if c_id in MATCH_STATE.contracts:
                            MATCH_STATE.contracts[c_id].bids.append(
                                Bid(player_id=player_id, total_bid_price=bid_data["total_bid_price"]))

                    MATCH_STATE.ready_players.add(player_id)

                    if len(MATCH_STATE.ready_players) >= len(manager.active_connections) and len(
                            manager.active_connections) > 0:

                        unsold_pool = {}

                        # Phase 4: Auction Resolution
                        for cid, contract in MATCH_STATE.contracts.items():
                            if not contract.bids:
                                # TIME DECAY LOGIC
                                # If it executes next round, it expires from the bidding pool (too late to buy/sell)
                                if contract.execution_round <= MATCH_STATE.current_round + 1:
                                    continue

                                    # MARGIN COMPRESSION
                                if contract.contract_type == ContractType.BUY_FROM:
                                    # It becomes 5% more expensive to acquire
                                    contract.base_price_per_mw = round(contract.base_price_per_mw * 1.05, 2)
                                else:
                                    # You get paid 5% less to deliver it
                                    contract.base_price_per_mw = round(contract.base_price_per_mw * 0.95, 2)

                                contract.total_base_price = round(contract.volume * contract.base_price_per_mw, 2)
                                unsold_pool[cid] = contract
                                continue

                            sorted_bids = sorted(contract.bids, key=lambda x: x.total_bid_price, reverse=True)
                            highest_bid_val = sorted_bids[0].total_bid_price
                            top_bidders = [b for b in sorted_bids if b.total_bid_price == highest_bid_val]

                            if len(top_bidders) > 1:
                                split_volume = contract.volume / len(top_bidders)
                                split_cost = highest_bid_val / len(top_bidders)
                                for b in top_bidders:
                                    MATCH_STATE.player_balances[b.player_id] -= split_cost
                                    split_contract = contract.model_copy(update={"volume": split_volume, "bids": []})
                                    MATCH_STATE.player_portfolios[b.player_id].append(split_contract)
                            else:
                                winner = top_bidders[0]
                                MATCH_STATE.player_balances[winner.player_id] -= winner.total_bid_price
                                won_contract = contract.model_copy(update={"bids": []})
                                MATCH_STATE.player_portfolios[winner.player_id].append(won_contract)

                        # Phase 5: Physical Settlement & Penalties
                        settle_maturing_contracts(MATCH_STATE)

                        # Prepare for next round
                        MATCH_STATE.current_round += 1
                        data_engine.advance_time(days=1)  # Move the historical dataset forward 1 day

                        # Merge the decaying unsold contracts with the brand new ones
                        new_contracts = data_engine.generate_contracts_for_round(MATCH_STATE.current_round)
                        MATCH_STATE.contracts = {**unsold_pool, **new_contracts}
                        MATCH_STATE.ready_players.clear()

                await manager.broadcast_state()

    except WebSocketDisconnect:
        manager.disconnect(player_id)
        await manager.broadcast_state()