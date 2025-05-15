#!/bin/bash

# Nombre de la base de datos
DB_NAME="f1-data"
# Carpeta que contiene los JSON
JSON_DIR="DataJSON"

echo "Importando archivos JSON en MongoDB - Base de datos: $DB_NAME"

# Recorre todos los archivos .json en la carpeta
for json_file in "$JSON_DIR"/*.json; do
  # Obtiene el nombre del archivo sin extensión
  collection_name=$(basename "$json_file" .json)

  echo "Importando $json_file en la colección $collection_name..."

  mongoimport --db "$DB_NAME" \
              --collection "$collection_name" \
              --file "$json_file" \
              --jsonArray \
              --drop

  if [ $? -eq 0 ]; then
    echo "$collection_name importado correctamente."
  else
    echo "Error al importar $collection_name."
  fi
done

echo "Importación completa."
