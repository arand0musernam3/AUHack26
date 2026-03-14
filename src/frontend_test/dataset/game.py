import pandas as pd
import os
import glob
import random

# ==========================================
# 1. CONFIGURATION & MAPPING
# ==========================================
GEN_MAPPING = {
    'WIND ONSHORE': 'Wind',
    'WIND OFFSHORE': 'Wind',
    'SOLAR': 'Solar',
    'HYDRO PUMPED STORAGE': 'Water',
    'HYDRO RUN-OF-RIVER AND POUNDAGE': 'Water',
    'HYDRO WATER RESERVOIR': 'Water',
    'HARD COAL': 'Fossil',
    'BROWN COAL/LIGNITE': 'Fossil',
    'GAS': 'Fossil',
    'OIL': 'Fossil',
    'BIOMASS': 'Fossil',
    'NUCLEAR': 'Nuclear'
}

WEATHER_FEATURES = ['temperature_2m (°C)', 'wind_speed_10m (km/h)', 'cloud_cover (%)', 'precipitation (mm)']


# ==========================================
# 2. DATA LOADING & PREPROCESSING
# ==========================================
def load_country_data(country_code, base_dir="."):
    """Loads and merges the split CSVs from their respective folders."""
    print(f"Loading data for {country_code}...")

    weather_prefix = 'DK' if country_code == 'DK1' else country_code
    weather_pattern = os.path.join(base_dir, 'weather', f'{weather_prefix}-open-meteo-*.csv')
    weather_files = glob.glob(weather_pattern)

    if not weather_files:
        print(f"  -> Missing weather file for {country_code}.")
        return None

    weather_path = weather_files[0]
    load_path = os.path.join(base_dir, 'total-load', f'{country_code}-total-load.csv')
    price_path = os.path.join(base_dir, 'spot-price', f'{country_code}-spot-price.csv')
    gen_path = os.path.join(base_dir, 'generation', f'{country_code}-generation.csv')

    try:
        weather = pd.read_csv(weather_path, skiprows=2, parse_dates=['time'])
        consumption = pd.read_csv(load_path, parse_dates=['time'])
        price = pd.read_csv(price_path, parse_dates=['time'])
        gen = pd.read_csv(gen_path, parse_dates=['time'])
    except FileNotFoundError as e:
        print(f"  -> Missing file for {country_code}: {e}")
        return None

    gen['game_type'] = gen['type'].map(GEN_MAPPING)
    gen = gen.dropna(subset=['game_type'])
    gen_pivot = gen.groupby(['time', 'game_type'])['value (MW)'].sum().unstack(fill_value=0).reset_index()

    consumption = consumption.rename(columns={'value (MW)': 'consumption_MW'})
    price = price.rename(columns={'value (EUR/MWh)': 'price_EUR'})

    df = weather[['time'] + WEATHER_FEATURES].copy()
    df = pd.merge(df, consumption[['time', 'consumption_MW']], on='time', how='inner')
    df = pd.merge(df, price[['time', 'price_EUR']], on='time', how='inner')
    df = pd.merge(df, gen_pivot, on='time', how='inner')

    df['hour'] = df['time'].dt.hour
    df['month'] = df['time'].dt.month
    df['day_of_year'] = df['time'].dt.dayofyear
    df['country_code'] = country_code

    for category in set(GEN_MAPPING.values()):
        if category not in df.columns:
            df[category] = 0.0

    return df


# ==========================================
# 3. GAME MECHANICS
# ==========================================
def apply_game_modifiers(df, powerup_type):
    modified_df = df.copy()

    # NOTE: Since you are using a single row dataframe in testing, this applies nicely.
    """
Powerup 1: The Polar Vortex (Winter focus)

    Weather Modifier: temperature_2m drops by 15°C; wind_speed_100m increases by 30%; cloud_cover goes to 100%.

    Strategic Impact:

        Advantage (Wind): High wind speeds cause a massive spike in wind generation.

        Disadvantage (Solar): Complete cloud cover kills solar output.

        Disadvantage (Fossil): Extreme cold causes natural gas pipeline pressure drops and freezes coal reserves (simulating supply chain failure).

        Consumption: Massive spike due to emergency heating. Players can use this to overload an opponent's grid and drive spot prices (price_EUR) through the roof.

Powerup 2: The Heat Dome (Summer focus)

    Weather Modifier: temperature_2m increases by 12°C; precipitation drops to 0 mm; cloud_cover drops to 0%.

    Strategic Impact:

        Advantage (Solar): Perfectly clear skies maximize solar output.

        Disadvantage (Water): Simulates flash droughts, reducing run-of-river and reservoir levels.

        Disadvantage (Nuclear): In Europe (especially France/FR), nuclear plants rely on river water for cooling. During severe heatwaves, river temperatures get too high to discharge cooling water, forcing reactors to throttle down.

        Consumption: High spike due to air conditioning.

Powerup 3: The Torrential Monsoon

    Weather Modifier: precipitation increases by 20 mm/h; wind_speed_100m drops by 40%; cloud_cover goes to 90%.

    Strategic Impact:

        Advantage (Water): Fills reservoirs and maximizes hydro production.

        Advantage (Fossil): With wind and solar crippled, baseload fossil fuels become highly profitable to fill the gap.

        Disadvantage (Wind & Solar): Low winds and high clouds cripple the renewable sector.

        Consumption: Slight decrease (people stay indoors, temperatures usually moderate).

Powerup 4: The Stagnant Anticyclone (Dead Calm)

    Weather Modifier: wind_speed_100m drops to 0 km/h; cloud_cover drops to 10%; temperature_2m normalizes to a mild 20°C.

    Strategic Impact:

        Advantage (Nuclear & Fossil): The ultimate baseload buff. With no wind, these traditional power plants dictate the market.

        Advantage (Solar): Clear skies provide good daytime generation.

        Disadvantage (Wind): Complete stand-still for wind turbines (the "Dunkelflaute" effect, though without the darkness).

        Consumption: Baseline/Low. Mild weather means neither heating nor heavy AC is needed.
    """
    modifiers = {
        'POLAR_VORTEX': {'Wind': 1.30, 'Solar': 0.10, 'Fossil': 0.95, 'Nuclear': 1.0, 'Water': 1.0, 'Consumption': 1.15,
                         'Price': 1.20},
        'HEAT_DOME': {'Wind': 0.80, 'Solar': 1.50, 'Fossil': 1.05, 'Nuclear': 0.85, 'Water': 0.70, 'Consumption': 1.10,
                      'Price': 1.15},
        'MONSOON': {'Wind': 0.60, 'Solar': 0.20, 'Fossil': 1.10, 'Nuclear': 1.0, 'Water': 1.40, 'Consumption': 0.95,
                    'Price': 1.05},
        'DEAD_CALM': {'Wind': 0.10, 'Solar': 1.20, 'Fossil': 1.10, 'Nuclear': 1.10, 'Water': 1.0, 'Consumption': 0.90,
                      'Price': 0.95}
    }

    mods = modifiers.get(powerup_type)
    if not mods: return modified_df

    # Apply modifiers directly to the game categories
    modified_df['consumption_MW'] *= mods['Consumption']
    modified_df['price_EUR'] *= mods['Price']

    for gen_type in ['Wind', 'Solar', 'Fossil', 'Nuclear', 'Water']:
        if gen_type in modified_df.columns:
            modified_df[gen_type] *= mods[gen_type]

    return modified_df


# ==========================================
# 4. MAIN EXECUTION & TESTING
# ==========================================
def main():
    # Pick a country from your dataset list
    target_country = 'PL'
    base_directory = '.'

    df = load_country_data(target_country, base_dir=base_directory)

    if df is None or df.empty:
        print(f"\nCould not load data for {target_country}. Please check your directory structure.")
        return

    # Grab a random index from the dataframe
    random_idx = random.randint(0, len(df) - 1)

    # Extract that single row as a new DataFrame
    base_state_df = df.iloc[[random_idx]].copy()

    # Define the columns we want to monitor
    monitoring_cols = ['consumption_MW', 'price_EUR', 'Fossil', 'Nuclear', 'Water', 'Wind', 'Solar']
    existing_cols = [col for col in monitoring_cols if col in base_state_df.columns]

    timestamp = base_state_df['time'].iloc[0]

    print("\n========================================================")
    print(f" BASELINE STATE: {target_country} | Time: {timestamp}")
    print("========================================================")

    for col in existing_cols:
        val = base_state_df[col].iloc[0]
        unit = "EUR" if "price" in col else "MW"
        print(f"{col:>15}: {val:10.2f} {unit}")

    powerups = ['POLAR_VORTEX', 'HEAT_DOME', 'MONSOON', 'DEAD_CALM']

    print("\n========================================================")
    print(" APPLYING MODIFIERS ")
    print("========================================================")

    for powerup in powerups:
        mod_df = apply_game_modifiers(base_state_df, powerup)

        print(f"\n--- Output: {powerup} ---")
        for col in existing_cols:
            val = mod_df[col].iloc[0]
            unit = "EUR" if "price" in col else "MW"
            print(f"{col:>15}: {val:10.2f} {unit}")


if __name__ == "__main__":
    main()