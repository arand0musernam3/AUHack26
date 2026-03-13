import pandas as pd
import numpy as np
import os
import glob
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
import joblib

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
# 3. INDIVIDUAL MODEL TRAINING
# ==========================================
def train_country_models(df_all_countries):
    print("\nTraining Individual Gradient Boosting Models...")

    models = {}
    # We drop 'time' for training, but keep the cyclical temporal features
    features = ['hour', 'month', 'day_of_year'] + WEATHER_FEATURES
    targets = ['consumption_MW', 'price_EUR', 'Wind', 'Solar', 'Water', 'Fossil', 'Nuclear']

    for country in df_all_countries['country_code'].unique():
        print(f" -> Training model for {country}...")
        df_country = df_all_countries[df_all_countries['country_code'] == country]

        X = df_country[features]
        y = df_country[targets]

        # Using HistGradientBoosting - it's fast and handles non-linear weather well
        # We increase max_iter slightly for better fitting to the "truth"
        base_model = HistGradientBoostingRegressor(max_iter=250, random_state=42)
        model = MultiOutputRegressor(base_model)
        model.fit(X, y)  # Fitting on all data for the game engine to know as much history as possible

        # Export individual model
        filename = f'model_{country}.joblib'
        joblib.dump(model, filename)
        models[country] = model
        print(f"    [OK] Model saved.")

    print("\nAll country models trained and exported successfully!")
    return models


# ==========================================
# 4. GAME SIMULATION ENGINE
# ==========================================
def categorize_historical_weather(row):
    """Analyzes historical weather and assigns it to a game category."""
    temp = row['temperature_2m (°C)']
    wind = row['wind_speed_10m (km/h)']
    clouds = row['cloud_cover (%)']
    precip = row['precipitation (mm)']

    if temp >= 30.0 and precip < 1.0:
        return "Drought & Heatwave"
    elif wind >= 35.0 and precip > 2.0:
        return "Stormy Gale"
    elif clouds < 25.0 and wind < 15.0:
        return "Sunny Calm"
    else:
        return "Standard/Mixed"


def simulate_weather(model, historical_row, weather_archetype):
    """Applies archetype weather and lets the AI predict the grid state."""
    sim_data = historical_row.copy()

    multipliers = {
        'Wind': 1.0, 'Solar': 1.0, 'Water': 1.0, 'Fossil': 1.0, 'Nuclear': 1.0
    }

    # 1. Apply Weather Archetype Overrides
    if weather_archetype == "Sunny Calm":
        sim_data['cloud_cover (%)'] = 5.0
        sim_data['wind_speed_10m (km/h)'] = 5.0
        sim_data['temperature_2m (°C)'] = 22.0
        sim_data['precipitation (mm)'] = 0.0
    elif weather_archetype == "Stormy Gale":
        sim_data['cloud_cover (%)'] = 95.0
        sim_data['wind_speed_10m (km/h)'] = 45.0
        sim_data['temperature_2m (°C)'] = 10.0
        sim_data['precipitation (mm)'] = 15.0
    elif weather_archetype == "Drought & Heatwave":
        sim_data['cloud_cover (%)'] = 0.0
        sim_data['wind_speed_10m (km/h)'] = 5.0
        sim_data['temperature_2m (°C)'] = 35.0
        sim_data['precipitation (mm)'] = 0.0
        multipliers['Water'] = 0.3
        multipliers['Nuclear'] = 0.6
    elif weather_archetype == "Resource Blockade":
        multipliers['Fossil'] = 0.2
        multipliers['Nuclear'] = 0.1
    elif weather_archetype == "Standard/Mixed":
        sim_data['cloud_cover (%)'] = 50.0
        sim_data['wind_speed_10m (km/h)'] = 15.0
        sim_data['temperature_2m (°C)'] = 15.0
        sim_data['precipitation (mm)'] = 1.0

    # 2. AI Prediction
    features = ['hour', 'month', 'day_of_year'] + WEATHER_FEATURES
    X_predict = pd.DataFrame([sim_data])[features]
    prediction = model.predict(X_predict)[0]

    results = {
        'Consumption (MW)': prediction[0],
        'Price (EUR/MWh)': prediction[1],
        'Wind Gen': prediction[2] * multipliers['Wind'],
        'Solar Gen': prediction[3] * multipliers['Solar'],
        'Water Gen': prediction[4] * multipliers['Water'],
        'Fossil Gen': prediction[5] * multipliers['Fossil'],
        'Nuclear Gen': prediction[6] * multipliers['Nuclear']
    }

    # 3. Strict Physics & Economics Guardrails

    # Game Economy Guardrail: No negative prices or consumption
    if results['Price (EUR/MWh)'] < 0.0:
        results['Price (EUR/MWh)'] = 0.0
    if results['Consumption (MW)'] < 0.0:
        results['Consumption (MW)'] = 0.0

    # Physics Guardrail: No negative generation
    for key in ['Wind Gen', 'Solar Gen', 'Water Gen', 'Fossil Gen', 'Nuclear Gen']:
        if results[key] < 0: results[key] = 0.0

    # Astronomy Guardrail: Dynamic Daylight Rules for Europe
    month = sim_data['month']
    hour = sim_data['hour']

    if month in [11, 12, 1, 2]:  # Deep Winter
        if hour < 8 or hour > 16: results['Solar Gen'] = 0.0
    elif month in [3, 4, 9, 10]:  # Spring/Fall
        if hour < 6 or hour > 19: results['Solar Gen'] = 0.0
    else:  # Summer
        if hour < 5 or hour > 21: results['Solar Gen'] = 0.0

    # Recalculate total with the clamped values
    results['Total Gen (MW)'] = sum([
        results['Wind Gen'], results['Solar Gen'], results['Water Gen'],
        results['Fossil Gen'], results['Nuclear Gen']
    ])

    return results, sim_data


# ==========================================
# 5. BATCH VISUALIZER FOR GAME BALANCING
# ==========================================
def run_weather_visualizer(models_dict, df, target_country, target_time_str):
    print("\n" + "=" * 90)
    print(f"WEATHER MANIPULATOR: GAME BALANCE VISUALIZER")
    print(f"Target: {target_country} | Time: {target_time_str}")
    print("=" * 90)

    try:
        target_time = pd.to_datetime(target_time_str)
        historical_row = df[(df['time'] == target_time) & (df['country_code'] == target_country)].iloc[0]
    except IndexError:
        print(f"Error: Could not find data for {target_country} at {target_time_str}.")
        return

    active_model = models_dict[target_country]

    # Figure out what the weather ACTUALLY was that day
    actual_category = categorize_historical_weather(historical_row)
    print(f"Actual Historical Weather Category: ** {actual_category.upper()} **")
    print("-" * 90)

    weather_archetypes = [
        "Standard/Mixed", "Sunny Calm", "Stormy Gale",
        "Drought & Heatwave", "Resource Blockade"
    ]

    # Store the pure historical truth for comparison
    truth = {
        'Consumption (MW)': historical_row['consumption_MW'],
        'Total Gen (MW)': sum([historical_row[k] for k in ['Wind', 'Solar', 'Water', 'Fossil', 'Nuclear']]),
        'Price (EUR/MWh)': historical_row['price_EUR'],
        'Wind Gen': historical_row['Wind'],
        'Solar Gen': historical_row['Solar'],
        'Water Gen': historical_row['Water'],
        'Fossil Gen': historical_row['Fossil'],
        'Nuclear Gen': historical_row['Nuclear']
    }

    all_results = {}
    for wt in weather_archetypes:
        res, _ = simulate_weather(active_model, historical_row, wt)
        all_results[wt] = res

    # Print formatting
    metrics = [
        'Consumption (MW)', 'Total Gen (MW)', 'Price (EUR/MWh)',
        'Wind Gen', 'Solar Gen', 'Water Gen', 'Fossil Gen', 'Nuclear Gen'
    ]

    # Header
    header = f"{'Metric':<18} | {'[RAW TRUTH]':<12} | " + " | ".join([f"{wt[:12]:<12}" for wt in weather_archetypes])
    print(header)
    print("-" * len(header))

    # Rows
    for metric in metrics:
        row_str = f"{metric[:18]:<18} | {truth[metric]:<12.1f} | "
        for wt in weather_archetypes:
            val = all_results[wt][metric]
            row_str += f"{val:<12.1f} | "
        print(row_str)

    print("-" * len(header))


if __name__ == "__main__":
    country_codes = ['DE', 'DK1', 'PL']  # Testing a few varied grids
    base_directory = "."

    all_data = []
    for code in country_codes:
        df_c = load_country_data(code, base_dir=base_directory)
        if df_c is not None:
            all_data.append(df_c)

    if all_data:
        full_df = pd.concat(all_data, ignore_index=True)
        models_dictionary = train_country_models(full_df)

        print("\n" + "*" * 50)
        print("RUNNING MULTI-SEASON SCENARIO TESTS")
        print("*" * 50)

        # Let's test Germany (DE) across different times of the year to see the AI's logic
        target_country = 'DE'
        df_target = full_df[full_df['country_code'] == target_country].reset_index(drop=True)

        # We will try to pull specific indices to represent different seasons
        # (Using Try/Except in case your dataset is smaller than a full year)
        test_indices = [
            150,  # January: Winter night
            2500,  # April: Spring morning
            4500,  # July: Summer Peak Noon
            7000  # October: Autumn Evening
        ]

        for idx in test_indices:
            try:
                sample_time = df_target['time'].iloc[idx]
                run_weather_visualizer(models_dictionary, full_df, target_country, str(sample_time))
            except IndexError:
                print(f"\nSkipping index {idx} - Dataset not long enough.")

    else:
        print("No data loaded. Check your directory paths.")