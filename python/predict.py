import pandas as pd
import joblib
import json
import sys

MODEL_PATH = 'models/modelo_precio.joblib'
METADATA_PATH = 'models/metadata.json'

def predict(data):
    """Carga el modelo y realiza una predicción."""
    try:
        # Cargar modelo y metadatos
        model = joblib.load(MODEL_PATH)
        with open(METADATA_PATH, 'r') as f:
            metadata = json.load(f)
        
        # Convertir el JSON de entrada a un DataFrame de pandas
        df = pd.DataFrame([data])
        
        # Asegurar que el DataFrame tenga todas las columnas esperadas por el modelo
        # y en el orden correcto, rellenando con 0 las que falten (ej. comodidades).
        expected_columns = metadata['columns']
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        df = df[expected_columns]

        # Realizar la predicción
        prediction = model.predict(df)
        
        return {"precio_predicho": float(prediction[0])}

    except FileNotFoundError:
        # Fallback si el modelo no existe: devuelve un precio fijo
        return {"precio_predicho": 1500.0, "error": "Modelo no encontrado, usando valor por defecto."}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Lee los datos desde los argumentos de la línea de comandos
    if len(sys.argv) > 1:
        input_data = json.loads(sys.argv[1])
        result = predict(input_data)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No se proporcionaron datos de entrada."}))
