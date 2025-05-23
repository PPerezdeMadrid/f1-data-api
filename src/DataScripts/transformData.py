import csv
import json
from pathlib import Path

# --- Outputs ---
OUTPUT_DRIVERS_JSON = Path("drivers.json")
OUTPUT_LAPS_JSON = Path("laps.json")
OUTPUT_RACES_JSON = Path("races.json")

# --- Funciones auxiliares ---
def safe_int(value):
    try:
        return int(float(value))
    except:
        return None

def clean_str(value):
    return value.strip() if value and value.strip() else None

# --- Función para procesar drivers ---
def process_drivers(drivers_data_path, drivers_teams_path):
    driver_numbers = {}
    driver_teams = {}

    for csv_file in drivers_data_path.glob("*.csv"):
        with open(csv_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                driver = clean_str(row.get("Driver"))
                number = clean_str(row.get("DriverNumber"))
                if driver and number:
                    driver_numbers[driver] = int(number)

    for csv_file in drivers_teams_path.glob("*.csv"):
        with open(csv_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                driver = clean_str(row.get("Driver"))
                team = clean_str(row.get("Team"))
                if driver and team:
                    driver_teams[driver] = team

    drivers = []
    all_drivers = sorted(set(driver_numbers.keys()) | set(driver_teams.keys()))
    for i, driver in enumerate(all_drivers):
        entry = {
            "id_driver": i,
            "driverNumber": driver_numbers.get(driver),
            "code": driver,
            "team": driver_teams.get(driver)
        }
        if all(entry.values()):
            drivers.append(entry)

    with open(OUTPUT_DRIVERS_JSON, "w", encoding="utf-8") as f:
        json.dump(drivers, f, indent=2)

    print(f"{len(drivers)} drivers saved to {OUTPUT_DRIVERS_JSON}")

# --- Función para procesar carreras ---
def process_races(lap_file):
    unique_races = set()

    with open(lap_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                season = int(row.get("Season"))
                race_name = clean_str(row.get("RaceName"))
                race_type = clean_str(row.get("RaceType"))

                if season and race_name and race_type:
                    race_key = (season, race_name, race_type)
                    unique_races.add(race_key)
            except Exception:
                continue

    races = []
    for i, (season, race_name, race_type) in enumerate(sorted(unique_races)):
        races.append({
            "id_race": i,
            "season": season,
            "raceName": race_name,
            "raceType": race_type
        })

    with open(OUTPUT_RACES_JSON, mode="w", encoding="utf-8") as out:
        json.dump(races, out, indent=2)

    print(f"{len(races)} races saved to {OUTPUT_RACES_JSON}")

# --- Función para procesar laps ---
def process_laps(lap_file, races_path, drivers_path):
    laps = []

    # --- Cargar races.json ---
    with open(races_path, mode="r", encoding="utf-8") as f:
        races = json.load(f)
    race_lookup = {
        (race["season"], race["raceName"], race["raceType"]): race["id_race"]
        for race in races
    }

    # --- Cargar drivers.json ---
    with open(drivers_path, mode="r", encoding="utf-8") as f:
        drivers = json.load(f)
    driver_lookup = {
        driver["code"]: driver["id_driver"]
        for driver in drivers
    }

    with open(lap_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            season = safe_int(row.get("Season"))
            race_name = clean_str(row.get("RaceName"))
            race_type = clean_str(row.get("RaceType"))
            driver_code = clean_str(row.get("Driver"))

            id_race = race_lookup.get((season, race_name, race_type))
            id_driver = driver_lookup.get(driver_code)

            lap = {
                "lapNumber": safe_int(row.get("LapNumber")),
                "id_driver": id_driver,
                "position": safe_int(row.get("Position")),
                "lapTime": clean_str(row.get("LapTime")),
                "isPersonalBest": clean_str(row.get("IsPersonalBest")).lower() == "true" if clean_str(row.get("IsPersonalBest")) else False,
                "sector1Time": clean_str(row.get("Sector1Time")),
                "sector2Time": clean_str(row.get("Sector2Time")),
                "sector3Time": clean_str(row.get("Sector3Time")),
                "compound": clean_str(row.get("Compound")),
                "pitInTime": clean_str(row.get("PitInTime")),
                "pitOutTime": clean_str(row.get("PitOutTime")),
                "pitStopDuration": clean_str(row.get("PitStopDuration")),
                "finishingPosition": safe_int(row.get("FinishingPosition")),
                "gridPosition": safe_int(row.get("GridPosition")),
                "finalStatus": clean_str(row.get("FinalStatus")),
                "id_race": id_race,
            }

            if lap["lapNumber"] and lap["id_driver"] is not None and lap["id_race"] is not None:
                laps.append(lap)

    with open(OUTPUT_LAPS_JSON, "w", encoding="utf-8") as out:
        json.dump(laps, out, indent=2)

    print(f"{len(laps)} laps saved to {OUTPUT_LAPS_JSON}")

# --- Función principal ---
def main():
    DRIVERS_DATA_PATH = Path("../../SPA_DATA/drivers_data")
    DRIVERS_TEAMS_PATH = Path("../../SPA_DATA/drivers_teams")
    LAPS_FILE = Path("../../SPA_DATA/SPA_2018_2025_full_H_data.csv")

    process_drivers(DRIVERS_DATA_PATH, DRIVERS_TEAMS_PATH)
    process_races(LAPS_FILE)
    process_laps(LAPS_FILE, OUTPUT_RACES_JSON, OUTPUT_DRIVERS_JSON)

if __name__ == "__main__":
    main()
