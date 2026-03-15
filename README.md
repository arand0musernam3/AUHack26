# ⚡ ENERGY MARKET: Strategic Trading Simulation

Welcome to **Energy Market**, a high-stakes multiplayer board game where you step into the role of a Grid Operator. Your goal is to dominate the European energy market by predicting weather patterns, manipulating infrastructure, and outbidding your rivals.

---

## 🎮 GAME OVERVIEW
The game spans **5 Days**. Each day consists of **3 Periods** (Morning, Afternoon, Evening). 
Players compete to accumulate the highest balance by the end of Day 5 through energy speculation.

### The Core Loop
1.  **Bidding Phase**: Auction for energy contracts across Europe.
2.  **Action Deployment**: Sabotage pipes or trigger weather anomalies.
3.  **Resolution Phase**: View the daily operational report and see who won what.
4.  **Settlement**: Contracts are "delivered" on their specific delivery day, and profits/losses are realized based on real-world dataset prices modified by player actions.

---

## 📈 TRADING MECHANICS

### 1. Buying (Going Long)
*   **Goal**: Profit from rising energy prices.
*   **Action**: Place a standard bid on a contract.
*   **Calculation**: `Profit = (Market Price - Your Bid Price) * Volume`.
*   **Strategy**: Buy when you expect a "Heat Dome" or "Polar Vortex" to drive up consumption and prices.

### 2. Shorting (Speculating Down)
*   **Goal**: Profit from falling energy prices.
*   **Action**: Place a "Short" bid. You are essentially selling energy you don't own yet, hoping to buy it back cheaper.
*   **Calculation**: `Profit = (Your Bid Price - Market Price) * Volume`.
*   **Strategy**: Short when you expect a "Monsoon" or "Dead Calm" to flood the market with cheap energy or tank demand.

### 3. The Sliding Window Contracts
The market maintains exactly **27 open contracts** (9 countries × 3 delivery slots).
*   For every country, there is always one contract for **Today**, one for **Tomorrow**, and one for the **Day After**.
*   **Lost Opportunity**: If a "Today" contract isn't bid on by the end of the day, it is deleted. New contracts are only generated to fill the 3-day forward-looking gap.

---

## 🌪️ OPERATOR ARSENAL (Action Cards)
Cards are your primary way to manipulate the market. You can acquire "Intel Cards" for **€20,000**.

| Card Type | Effect | Duration |
| :--- | :--- | :--- |
| **Polar Vortex** | Wind +30%, Solar -90%, Consumption +15%, Prices +20% | Multiple Days |
| **Heat Dome** | Solar +50%, Wind -20%, Water -30%, Consumption +10% | Multiple Days |
| **Monsoon** | Water +40%, Wind -40%, Solar -80% | Multiple Days |
| **Dead Calm** | Wind -90%, Solar +20%, Consumption -10% | Multiple Days |
| **Boost/Nerf** | Increases or decreases local energy prices by 50% | Multiple Days |
| **Cut Conduct** | Severs a pipe, blocking energy transit | 1-2 Rounds |
| **Fix Conduct** | Immediately repairs a severed pipe | Instant |
| **Discount** | Reduces transit fees on a pipe for 1-3 Rounds | Multiple Rounds |

---

## 🧪 THE CALCULATIONS

### Market Price Calculation
The settlement price is derived from real European energy datasets (Generation, Load, Weather) and adjusted by a linear pricing model:
`Price = Base + (K_Load * Actual_Load) - (K_Gen * Total_Generation) + (K_Scarcity * Type_Scarcity)`

*   **Load**: Higher demand = Higher price.
*   **Generation**: Higher supply = Lower price.
*   **Scarcity**: If the specific energy type (e.g., Wind) is underperforming compared to the average, its specific contracts become more valuable.

### Phase Transitions
*   **Contracts refreshed**: Only at the end of the **Day** (after Period 3 Resolution).
*   **Evaluation**: Positions are settled only on their `delivery_day`. If you buy a Day 3 contract on Day 1, you must wait until the end of Day 3 to see your money.

---

## 🛠️ TECHNICAL SETUP
*   **Frontend**: React + TypeScript + Vite.
*   **State Engine**: `boardgame.io` (handles synchronization, moves, and phases).
*   **Map**: `react-simple-maps` using TopoJSON for European borders.
*   **Data**: Real CSV datasets located in `e a look, but it should be f/dataset` (Generation, Price, Load, Weather).

**To start the simulation:**
```bash
# Terminal 1: Backend Server
cd energy-game-back && \
source /usr/share/nvm/init-nvm.sh && \
nvm use 18 && \
npx tsx server.ts

# Terminal 2: Frontend Client
cd energy-game && npx vite --host
```

---

## 💡 PRO-TIPS FOR NEW PLAYERS
1.  **Check the Forecast**: Hover over countries on the map to see the 3-day strategic forecast before bidding.
2.  **Diversify**: Don't just bid on Today. Secure future contracts (Day 4 or 5) and then use your action cards on those days to guarantee a profit.
3.  **Sabotage**: If a rival has a massive Long position in France, cut the pipes leading to Germany to trap their energy and tank the local price.
4.  **Read the Report**: The Daily Operational Report shows you exactly who bid what—use this to sniff out your opponents' strategies.

---
*Vibe coded with ❤️ during AUHack26.*
