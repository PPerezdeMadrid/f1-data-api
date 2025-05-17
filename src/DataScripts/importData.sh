#!/bin/bash

DB_NAME="f1-data"
JSON_DIR="." 

echo "Importando drivers..."
mongoimport --db "$DB_NAME" --collection drivers --file "$JSON_DIR/drivers.json" --jsonArray --drop

echo "Importando laps..."
mongoimport --db "$DB_NAME" --collection laps --file "$JSON_DIR/laps.json" --jsonArray --drop

echo "Importando races..."
mongoimport --db "$DB_NAME" --collection races --file "$JSON_DIR/races.json" --jsonArray --drop

echo "Importación completada."
