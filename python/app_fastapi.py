from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd
import joblib
import json

# --- Configuración ---
MODEL_PATH = 'models/modelo_precio.joblib'
METADATA_PATH = 'models/metadata.json'

# --- Carga de Modelo y Metadatos ---
try:
    model = joblib.load(MODEL_PATH)
    with open(METADATA_PATH, 'r') as f:
        metadata = json.load(f)
    EXPECTED_COLUMNS = metadata['columns']
except FileNotFoundError:
    model = None
    EXPECTED_COLUMNS = []
    print("ADVERTENCIA: Modelo no encontrado. La API devolverá valores por defecto.")

# --- Definición de la App ---
app = FastAPI(
    title="API de Estimación de Precios - PrediRent",
    description="Un microservicio para predecir el precio de alquiler de propiedades."
)

# --- Esquema de Datos de Entrada (Pydantic) ---
class PropertyFeatures(BaseModel):
    TipoPropiedad: str
    TipoAlojamiento: str
    Distrito: str
    Provincia: str
    NumHuespedes: int = Field(..., alias='huespedes')
    NumHabitaciones: int = Field(..., alias='habitaciones')
    NumCamas: int = Field(..., alias='camas')
    NumBanos: int = Field(..., alias='baños')
    comodidades: Optional[List[str]] = []
    # Añade cualquier otro campo que tu modelo espere

# --- Endpoint de Predicción ---
@app.post("/predict")
def predict_price(features: PropertyFeatures):
    """
    Recibe las características de una propiedad y devuelve el precio de alquiler predicho.
    """
    if not model:
        return {"precio_predicho": 1500.0, "error": "Modelo no entrenado, usando valor por defecto."}

    try:
        # Convertir el objeto Pydantic a un diccionario y luego a DataFrame
        data_dict = features.dict(by_alias=True)
        
        # Aplanar las comodidades en formato one-hot
        for comodidad in data_dict.pop('comodidades', []):
            data_dict[comodidad] = 1

        df = pd.DataFrame([data_dict])

        # Asegurar que el DataFrame tenga todas las columnas esperadas
        for col in EXPECTED_COLUMNS:
            if col not in df.columns:
                df[col] = 0
        df = df[EXPECTED_COLUMNS]

        # Realizar la predicción
        prediction = model.predict(df)
        
        return {"precio_predicho": float(prediction[0])}
    
    except Exception as e:
        return {"error": f"Error durante la predicción: {str(e)}"}

# --- Endpoint de Health Check ---
@app.get("/")
def read_root():
    return {"status": "API del estimador de precios funcionando"}
