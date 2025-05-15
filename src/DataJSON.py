import os
import csv
import json
import re

BASE_DIR = '../SPA_DATA'         # Directorio principal con subcarpetas
SALIDA_DIR = 'DataJSON'       # Carpeta de salida para los JSON

def extraer_anio(nombre_archivo):
    """Extrae el año del nombre del archivo usando regex."""
    match = re.search(r'_(\d{4})_', nombre_archivo)
    if match:
        return int(match.group(1))
    else:
        return None

def procesar_csv(ruta_csv, anio):
    """Lee un CSV y agrega el campo año a cada fila."""
    with open(ruta_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        datos = []
        for fila in reader:
            fila['año'] = anio
            datos.append(fila)
        return datos

def procesar_subcarpeta(carpeta):
    """Procesa todos los CSV en una subcarpeta y genera un JSON unificado."""
    ruta_completa = os.path.join(BASE_DIR, carpeta)
    datos_totales = []

    for archivo in os.listdir(ruta_completa):
        if archivo.endswith('.csv'):
            anio = extraer_anio(archivo)
            if anio:
                ruta_csv = os.path.join(ruta_completa, archivo)
                datos = procesar_csv(ruta_csv, anio)
                datos_totales.extend(datos)
                print(f"  ✔ Procesado: {archivo} ({len(datos)} filas)")
            else:
                print(f"  ⚠️ No se detectó el año en: {archivo}")

    if datos_totales:
        os.makedirs(SALIDA_DIR, exist_ok=True)  # Crea la carpeta si no existe
        salida_json = os.path.join(SALIDA_DIR, f"{carpeta}.json")
        with open(salida_json, 'w', encoding='utf-8') as f_out:
            json.dump(datos_totales, f_out, ensure_ascii=False, indent=2)
        print(f" Guardado: {salida_json} ({len(datos_totales)} objetos)\n")
    else:
        print(f"⚠️ No se generó JSON para {carpeta}, sin datos válidos.\n")

def main():
    print(f"📂 Procesando subcarpetas en: {BASE_DIR}\n")
    for carpeta in os.listdir(BASE_DIR):
        ruta = os.path.join(BASE_DIR, carpeta)
        if os.path.isdir(ruta):
            print(f"Subcarpeta: {carpeta}")
            procesar_subcarpeta(carpeta)

if __name__ == '__main__':
    main()
