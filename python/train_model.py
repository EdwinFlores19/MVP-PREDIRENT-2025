import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from utils import get_sqlalchemy_engine

# --- CONFIGURACIÓN ---
TARGET_COLUMN = 'PrecioPublicado'
CATEGORICAL_FEATURES = ['TipoPropiedad', 'TipoAlojamiento', 'Distrito', 'Provincia']
NUMERICAL_FEATURES = ['NumHuespedes', 'NumHabitaciones', 'NumCamas', 'NumBanos']
# Las comodidades y otros se tratarán por separado

MODEL_PATH = 'models/modelo_precio.joblib'
METADATA_PATH = 'models/metadata.json'

def train_model():
    """Función principal para entrenar y guardar el modelo."""
    print("--- Iniciando el proceso de entrenamiento del modelo ---")

    try:
        engine = get_sqlalchemy_engine()
        print("✅ Conexión a la base de datos establecida.")
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}")
        return

    # --- 1. Carga de Datos ---
    query = """
        SELECT 
            p.PrecioPublicado, p.TipoPropiedad, p.TipoAlojamiento, p.Distrito, p.Provincia,
            p.NumHuespedes, p.NumHabitaciones, p.NumCamas, p.NumBanos,
            c.Nombre AS Comodidad
        FROM dbo.Propiedades p
        LEFT JOIN dbo.PropiedadComodidades pc ON p.PropiedadID = pc.PropiedadID
        LEFT JOIN dbo.Comodidades c ON pc.ComodidadID = c.ComodidadID
        WHERE p.Pais = 'PE' AND p.PrecioPublicado IS NOT NULL
    """
    print("Cargando datos desde la base de datos...")
    df = pd.read_sql(query, engine)
    print(f"Cargados {len(df)} registros.")

    # --- 2. Preprocesamiento ---
    print("Iniciando preprocesamiento de datos...")
    
    # Pivotar comodidades para tenerlas como columnas binarias
    if not df['Comodidad'].isnull().all():
        df_comodidades = df.pivot_table(index=df.index, columns='Comodidad', aggfunc=lambda x: 1, fill_value=0)
        df = df.join(df_comodidades).drop(columns=['Comodidad'])
        df = df.loc[:,~df.columns.duplicated()]
    
    binary_features = [col for col in df.columns if col not in CATEGORICAL_FEATURES + NUMERICAL_FEATURES + [TARGET_COLUMN]]
    all_features = CATEGORICAL_FEATURES + NUMERICAL_FEATURES + binary_features

    X = df[all_features]
    y = df[TARGET_COLUMN]

    # --- 3. División de Datos ---
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Datos divididos: {len(X_train)} para entrenamiento, {len(X_test)} para prueba.")

    # --- 4. Creación del Pipeline de Preprocesamiento ---
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERICAL_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES),
            ('passthrough', 'passthrough', binary_features)
        ])

    # --- 5. Entrenamiento del Modelo ---
    print("Entrenando el modelo XGBoost...")
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', XGBRegressor(objective='reg:squarederror', random_state=42))
    ])

    model_pipeline.fit(X_train, y_train)
    print("✅ Modelo entrenado exitosamente.")

    # --- 6. Evaluación ---
    print("Evaluando el modelo...")
    y_pred = model_pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    print(f"  - Mean Absolute Error (MAE): {mae:.2f}")
    print(f"  - Root Mean Squared Error (RMSE): {rmse:.2f}")

    # --- 7. Guardado del Modelo y Metadatos ---
    print(f"Guardando el modelo en {MODEL_PATH}...")
    joblib.dump(model_pipeline, MODEL_PATH)

    metadata = {
        'columns': all_features,
        'metrics': {
            'mae': mae,
            'rmse': rmse
        }
    }
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=4)
    print(f"Metadatos guardados en {METADATA_PATH}.")

    print("--- Proceso de entrenamiento finalizado ---")

if __name__ == "__main__":
    train_model()
