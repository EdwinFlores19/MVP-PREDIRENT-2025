import joblib
import json
import os
from sklearn.linear_model import LinearRegression
import numpy as np

# --- CREACIÓN DE UN MODELO DUMMY ---
# Este script crea un modelo simple que siempre predice un valor fijo.
# Es un placeholder para que la integración funcione antes de entrenar el modelo real.

print("--- Creando modelo y metadatos dummy ---")

# 1. Crear un modelo simple (regresión lineal con un solo dato)
dummy_model = LinearRegression()
dummy_model.fit(np.array([[0]]), np.array([1500])) # Entrenado para predecir ~1500

# 2. Definir columnas dummy (basado en lo que el frontend podría enviar)
dummy_columns = [
    'TipoPropiedad', 'TipoAlojamiento', 'Distrito', 'Provincia',
    'NumHuespedes', 'NumHabitaciones', 'NumCamas', 'NumBanos',
    'Wifi', 'TV', 'Cocina', 'Lavadora' # Ejemplo de comodidades
]

# 3. Crear carpetas si no existen
if not os.path.exists('models'):
    os.makedirs('models')

# 4. Guardar el modelo y los metadatos
MODEL_PATH = 'models/modelo_precio.joblib'
METADATA_PATH = 'models/metadata.json'

joblib.dump(dummy_model, MODEL_PATH)
print(f"✅ Modelo dummy guardado en {MODEL_PATH}")

metadata = {
    'columns': dummy_columns,
    'metrics': {
        'mae': 0.0,
        'rmse': 0.0
    },
    'dummy': True
}
with open(METADATA_PATH, 'w') as f:
    json.dump(metadata, f, indent=4)
print(f"✅ Metadatos dummy guardados en {METADATA_PATH}")

print("--- Proceso finalizado. Ahora puedes probar la integración. ---")
