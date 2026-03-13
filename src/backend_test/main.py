import asyncio
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder

# Missing Authentication: This WebSocket endpoint blindly accepts any player_id from the URL parameter. 
# This allows trivial spoofing. You must implement a JWT hand-off during the initial HTTP upgrade request.

# No Bid Validation: The SUBMIT_BIDS logic currently does not verify if a player actually has the capital 
# to cover their bids, nor does it enforce the maximum limit of 5 bids per player as defined in your rules.

# Graph Decoupling: The resolve_auction function deducts capital for the contracts, but completely ignores 
# the O(1) routing cost matrix we established.

app = FastAPI()

# --- 1. Core Data Models ---
class Bid(BaseModel):
    player_id: str
    price: float
    volume: float

class Contract(BaseModel):
    contract_id: str
    origin_country: str
    available_volume: float
    base_price: float
    bids: List[Bid] = []

class GameState(BaseModel):
    phase: int = 1 # 1: Forecast, 2: Action, 3: Bidding, 4: Resolution
    contracts: Dict[str, Contract] = {}
    player_balances: Dict[str, float] = {}
    ready_players: set = set()

# --- 2. ML Model Stub ---
class EnergyPricingModel:
    def __init__(self):
        # Load your .pkl, .pt, or ONNX model here
        self.is_loaded = True

    def predict_daily_contracts(self) -> Dict[str, Contract]:
        # Stub: Replace with actual inference logic
        return {
            "GER_1": Contract(contract_id="GER_1", origin_country="Germany", available_volume=100.0, base_price=45.5),
            "FRA_1": Contract(contract_id="FRA_1", origin_country="France", available_volume=80.0, base_price=30.0)
        }

pricing_model = EnergyPricingModel()

MATCH_STATE = GameState()
MATCH_STATE.phase = 3 # Fast-forward to Bidding phase for testing
MATCH_STATE.contracts = pricing_model.predict_daily_contracts() # Populate the market
state_lock = asyncio.Lock()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        
        # --- Fix 3: Prevent Balance Wiping ---
        if player_id not in MATCH_STATE.player_balances:
            MATCH_STATE.player_balances[player_id] = 1000000.0 

    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]

    async def broadcast_state(self):
        # Safely serialize Pydantic V2 models for WebSocket transmission
        state_dict = jsonable_encoder(MATCH_STATE)
        state_dict['ready_players'] = list(MATCH_STATE.ready_players)
        message = json.dumps({"type": "STATE_UPDATE", "data": state_dict})
        
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

# --- 4. Mathematical Resolution (Uniform-Price Auction) ---
def resolve_auction(contract: Contract) -> Dict:
    if not contract.bids:
        return {"winners": [], "clearing_price": 0.0}

    # Sort bids descending by price
    sorted_bids = sorted(contract.bids, key=lambda x: x.price, reverse=True)
    
    fulfilled_volume = 0.0
    clearing_price = 0.0
    winners = []

    for bid in sorted_bids:
        if fulfilled_volume >= contract.available_volume:
            break
        
        allocated = min(bid.volume, contract.available_volume - fulfilled_volume)
        fulfilled_volume += allocated
        clearing_price = bid.price # The lowest accepted bid sets the price
        winners.append({"player_id": bid.player_id, "allocated_volume": allocated})

    return {"winners": winners, "clearing_price": clearing_price}

# --- 5. WebSocket Endpoint ---
@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await manager.connect(websocket, player_id)
    await manager.broadcast_state()
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            async with state_lock:
                # Handle Phase 3: Bidding Submission
                if payload["action"] == "SUBMIT_BIDS" and MATCH_STATE.phase == 3:
                    for bid_data in payload["bids"]:
                        contract_id = bid_data["contract_id"]
                        if contract_id in MATCH_STATE.contracts:
                            MATCH_STATE.contracts[contract_id].bids.append(
                                Bid(player_id=player_id, price=bid_data["price"], volume=bid_data["volume"])
                            )
                    
                    MATCH_STATE.ready_players.add(player_id)
                    
                    # Advance to Phase 4 if all connected players are ready
                    if len(MATCH_STATE.ready_players) >= len(manager.active_connections):
                        MATCH_STATE.phase = 4
                        for cid, contract in MATCH_STATE.contracts.items():
                            # Execute resolution mathematics
                            result = resolve_auction(contract)
                            # Apply financial deductions based on clearing price
                            for winner in result["winners"]:
                                cost = winner["allocated_volume"] * result["clearing_price"]
                                MATCH_STATE.player_balances[winner["player_id"]] -= cost
                        
                        MATCH_STATE.ready_players.clear()
                
                await manager.broadcast_state()

    except WebSocketDisconnect:
        manager.disconnect(player_id)
        await manager.broadcast_state()