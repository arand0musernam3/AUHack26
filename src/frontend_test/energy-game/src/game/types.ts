export type EnergyType = "Wind" | "Solar" | "Water" | "Fossil" | "Nuclear";

export type DayPeriod = 1 | 2 | 3;

export interface Bid {
  player_id: string;
  price: number;
  volume: number;
}

export interface Contract {
  contract_id: string;
  origin_country: string;
  delivery_country: string;
  energy_type: EnergyType;
  available_volume: number;
  base_price: number;
  bids: Bid[];
}

export interface Conduct {
  origin: string;
  destination: string;
  base_cost: number;
  volume_capacity: number;
  is_broken: boolean;
}

export type ActionCardType =
  | "POLAR_VORTEX"
  | "HEAT_DOME"
  | "MONSOON"
  | "DEAD_CALM"
  | "BOOST_ENERGY"
  | "NERF_ENERGY"
  | "CUT_CONDUCT"
  | "FIX_CONDUCT"
  | "DISCOUNT_CONDUCT"
  | "NOPE_CARD";

export interface ActionCardInstance {
  card_id: string;
  type: ActionCardType;
  face_down: boolean;
  duration: number; // 1-3 days
}

export interface PlayedCard {
  player_id: string;
  card: ActionCardInstance;
  target_country?: string;
}

export interface ActiveModifier {
  type: ActionCardType;
  remaining_days: number;
  original_duration: number;
}

export interface RouteStep {
  country: string;
  cost: number;
}

// Data point for a single country/time
export interface WeatherDataPoint {
  time: string;
  Wind: number;
  Solar: number;
  Water: number;
  Fossil: number;
  Nuclear: number;
  Consumption: number;
  Price: number;
  
  // RAW weather stats for Tooltip only
  temperature: number;
  wind_speed: number;
  cloud_cover: number;
}

export interface WeatherDataEntry {
  current: WeatherDataPoint;
  forecast: WeatherDataPoint[];
}

export type CountryWeatherData = Record<string, WeatherDataEntry>;

export interface Pipe {
  from: string;
  to: string;
  capacity: number;
}

export interface GameState {
  phase_number: number;
  current_day: number;
  total_days: number;
  current_period: DayPeriod;
  periods_completed: DayPeriod[];
  contracts: Record<string, Contract>;
  player_balances: Record<string, number>;
  player_names: Record<string, string>;
  ready_players: string[];
  conducts: Conduct[];
  action_cards: Record<string, ActionCardInstance[]>;
  played_cards: PlayedCard[]; 
  active_modifiers: Record<string, ActiveModifier[]>; 
  weather_data: CountryWeatherData; // UNMODIFIED weather data
  modified_weather_data: CountryWeatherData; // MODIFIED weather data (for logic/UI)
  current_date: string;
  pipes: Pipe[];
  phase_deadline: number | null;
  resolution_log: string[];
}
