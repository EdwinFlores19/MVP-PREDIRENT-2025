import json
from predict import predict

def test_prediction():
    """Prueba la función de predicción con un ejemplo."""
    print("--- Ejecutando prueba local del script de predicción ---")
    
    # Datos de ejemplo que simulan una propiedad
    sample_data = {
        "TipoPropiedad": "Apartamento",
        "TipoAlojamiento": "entero",
        "Distrito": "Miraflores",
        "Provincia": "Lima",
        "huespedes": 2,
        "habitaciones": 1,
        "camas": 1,
        "baños": 1,
        "comodidades": ["Wifi", "Cocina"]
    }
    
    print("Datos de entrada:", json.dumps(sample_data, indent=2))
    
    result = predict(sample_data)
    
    print("Resultado de la predicción:", json.dumps(result, indent=2))
    
    if 'error' in result:
        print("❌ La prueba falló.")
    elif 'precio_predicho' in result:
        print("✅ La prueba se completó exitosamente.")
    else:
        print("⚠️ La prueba se completó, pero el resultado no tiene el formato esperado.")

if __name__ == "__main__":
    test_prediction()
