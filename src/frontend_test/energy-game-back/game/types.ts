export type EnergyType = 'Wind' | 'Solar' | 'Water' | 'Fossil' | 'Nuclear';

export type ActionCardType =
  | 'POLAR_VORTEX' | 'HEAT_DOME' | 'MONSOON' | 'DEAD_CALM'
  | 'BOOST_ENERGY' | 'NERF_ENERGY'
  | 'CUT_CONDUCT' | 'FIX_CONDUCT' | 'DISCOUNT_CONDUCT'
  | 'NOPE_CARD';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export interface Bid {
  player_id: string;
  price: number;
  volume: number;
}

export interface Contract {
  contract_id: string;
  origin_country: string;
  energy_type: EnergyType;
  available_volume: number;
  base_price: number;
  bids: Bid[];
  delivery_country: string; // default "GER"
}

export interface Conduct {
  origin: string;
  destination: string;
  base_cost: number;
  volume_capacity: number;
  is_broken: boolean;
}

export interface ActionCardInstance {
  card_id: string;
  type: ActionCardType;
  face_down: boolean;
}

export interface PlayedCard {
  player_id: string;
  card: ActionCardInstance;
  target_country?: string;
  target_trade_id?: string;
  rounds_remaining: number; // effects last up to 3 rounds, decreasing probability
}

export type WeatherFeature =
  | 'temperature_2m (°C)'
  | 'wind_speed_10m (km/h)'
  | 'cloud_cover (%)'
  | 'precipitation (mm)';

export interface ForecastCard {
  description: string;         // e.g., "Cold front likely in Scandinavia"
  affected_country: string;
  probability: number;         // 0–1
  weather_feature: WeatherFeature;
  direction: 'increase' | 'decrease';
}

export interface GameState {
  phase_number: number;
  contracts: Record<string, Contract>;
  player_balances: Record<string, number>;
  ready_players: string[];
  conducts: Conduct[];
  // Frontend additions (derived or local):
  forecast?: ForecastCard;
  action_cards: Record<string, ActionCardInstance[]>; // keyed by player_id
  played_cards: PlayedCard[];
  current_period: DayPeriod;
  periods_completed: DayPeriod[];
  phase_deadline: number | null;  // Unix ms timestamp, null when no timer is active
}
export interface RouteStep {
  originCountryId: string;
  conductId: string;
}

export interface RouteStep {
  originCountryId: string;
  conductId: string;
}
