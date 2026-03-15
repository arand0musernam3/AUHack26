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
  delivery_day: number;
}

export interface Position {
  player_id: string;
  contract_id: string;
  origin_country: string;
  energy_type: EnergyType;
  volume: number;
  bid_price: number;
  base_price: number;
  is_short: boolean;
  day_placed: number;
  delivery_day: number;
  period_placed: DayPeriod;
}

export interface Conduct {
  origin: string;
  destination: string;
  base_cost: number;
  volume_capacity: number;
  is_broken: boolean;
  discount_active: boolean;
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
  | "DISCOUNT_CONDUCT";

export interface ActionCardInstance {
  card_id: string;
  type: ActionCardType;
  face_down: boolean;
  duration: number; // For weather/price: days. For pipes: rounds.
}

export interface PlayedCard {
  player_id: string;
  card: ActionCardInstance;
  target_country?: string;
  target_pipe?: { from: string; to: string };
}

export interface ActiveModifier {
  type: ActionCardType;
  remaining_days: number;
  original_duration: number;
}

export interface ActivePipeModifier {
  type: ActionCardType;
  remaining_rounds: number;
  target: { from: string; to: string };
}

export interface WeatherDataPoint {
  time: string;
  Wind: number;
  Solar: number;
  Water: number;
  Fossil: number;
  Nuclear: number;
  Consumption: number;
  Price: number;
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
  active_pipe_modifiers: ActivePipeModifier[];
  weather_data: CountryWeatherData;
  modified_weather_data: CountryWeatherData;
  current_date: string;
  pipes: Pipe[];
  phase_deadline: number | null;  // Unix ms timestamp, null when no timer is active
  current_day: number;
  total_days: number;
  active_countries: string[];
  positions: Position[];
  resolution_log: string[];
  auction_results: string[];
  is_game_over?: boolean;
}

export interface RouteStep {
  originCountryId: string;
  conductId: string;
  phase_deadline: number | null;
}
