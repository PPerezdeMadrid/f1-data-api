import pandas as pd
from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["f1-data-db"]

df = pd.read_csv('SPA_2018_2025_full_H_data.csv')

# Función para insertar una Race
def insert_race(row):
    race_data = {
        "season": int(row["Season"]),
        "raceName": row["RaceName"],
        "raceType": row["RaceType"]
    }
    race_id = db.races.insert_one(race_data).inserted_id
    return race_id

# Función para insertar un Driver
def insert_driver(driver_data):
    driver = {
        "driverNumber": int(driver_data["DriverNumber"]),
        "code": driver_data["Driver"],
        "team": driver_data["Team"]
    }
    driver_id = db.drivers.insert_one(driver).inserted_id
    return driver_id

# Función para insertar una Lap
def insert_lap(race_id, driver_id, row):
    lap_data = {
        "raceId": race_id,
        "driverCode": row["Driver"],
        "lapNumber": int(row["LapNumber"]),
        "position": float(row["Position"]) if pd.notnull(row["Position"]) else None,
        "lapTime": str(row["LapTime"]) if pd.notnull(row["LapTime"]) else None,
        "isPersonalBest": bool(row["IsPersonalBest"]) if pd.notnull(row["IsPersonalBest"]) else None,
        "sector1Time": str(row["Sector1Time"]) if pd.notnull(row["Sector1Time"]) else None,
        "sector2Time": str(row["Sector2Time"]) if pd.notnull(row["Sector2Time"]) else None,
        "sector3Time": str(row["Sector3Time"]) if pd.notnull(row["Sector3Time"]) else None,
        "compound": row["Compound"] if pd.notnull(row["Compound"]) else None,
        "pitInTime": str(row["PitInTime"]) if pd.notnull(row["PitInTime"]) else None,
        "pitOutTime": str(row["PitOutTime"]) if pd.notnull(row["PitOutTime"]) else None,
        "pitStopDuration": str(row["PitStopDuration"]) if pd.notnull(row["PitStopDuration"]) else None,
        "finishingPosition": int(row["FinishingPosition"]) if pd.notnull(row["FinishingPosition"]) and not pd.isna(row["FinishingPosition"]) else None,
        "gridPosition": int(row["GridPosition"]) if pd.notnull(row["GridPosition"]) and not pd.isna(row["GridPosition"]) else None,
        "finalStatus": row["FinalStatus"] if pd.notnull(row["FinalStatus"]) else None
    }
    lap_id = db.laps.insert_one(lap_data).inserted_id
    return lap_id

# Insertar datos
def insert_data_from_csv():
    for _, row in df.iterrows():
        # Insertar Race
        race_id = insert_race(row)

        # Insertar Driver
        driver_id = insert_driver(row)

        # Insertar vuelta Lap para cada fila del CSV
        insert_lap(race_id, driver_id, row)
        print(f"Datos insertados para la vuelta {row['LapNumber']} de la carrera {row['RaceName']}")

insert_data_from_csv()

print("Datos insertados correctamente en MongoDB")
