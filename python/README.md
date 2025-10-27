# Proyecto de Estimación de Precios - PrediRent

Este directorio contiene el código para entrenar y servir un modelo de machine learning que predice los precios de alquiler.

## 1. Configuración del Entorno

Se recomienda encarecidamente utilizar un entorno virtual para aislar las dependencias de este proyecto.

```bash
# Navega a la carpeta 'python'
cd python

# Crea un entorno virtual
python -m venv venv

# Activa el entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
# source venv/bin/activate
```

## 2. Instalación de Dependencias

Una vez que el entorno virtual esté activado, instala todas las librerías necesarias desde `requirements.txt`.

```bash
pip install -r requirements.txt
```

## 3. Configuración de la Base de Datos

El script de entrenamiento necesita acceso a la base de datos de SQL Server. Puedes configurar la cadena de conexión de dos maneras:

**a) (Recomendado) Usando un archivo `.env`:**

Crea un archivo llamado `.env` dentro de la carpeta `python/` y añade la siguiente línea, reemplazando los placeholders con tus credenciales reales:

```
DB_CONNECTION_STRING="DRIVER={ODBC Driver 17 for SQL Server};SERVER=127.0.0.1;DATABASE=PrediRentDB;UID=tu_usuario;PWD=tu_contraseña"
```

**b) Usando `config.yaml`:**

Renombra `config_example.yaml` a `config.yaml` y edita la cadena de conexión directamente en ese archivo.

## 4. Entrenamiento del Modelo

Con el entorno activado y la base de datos configurada, puedes entrenar el modelo ejecutando:

```bash
python train_model.py
```

Este proceso hará lo siguiente:
- Se conectará a la base de datos.
- Cargará y preprocesará los datos de las propiedades.
- Entrenará un modelo `XGBoost`.
- Guardará el modelo entrenado en `python/models/modelo_precio.joblib`.
- Guardará los metadatos (columnas y métricas) en `python/models/metadata.json`.

## 5. Servir el Modelo con FastAPI

Para exponer el modelo como una API, puedes usar FastAPI. Desde la carpeta `python/`, ejecuta:

```bash
uvicorn app_fastapi:app --host 0.0.0.0 --port 8000 --reload
```

La API estará disponible en `http://localhost:8000`.

## 6. Cómo se Integra con Node.js

El backend de Node.js (en `Controller/controllers/estimador.controller.js`) decide cómo obtener una predicción basado en la variable de entorno `USE_FASTAPI` en el archivo `.env` principal del proyecto:

- **Si `USE_FASTAPI=true`:** Node.js hará una petición HTTP a la API de FastAPI en `http://localhost:8000/predict`.
- **Si `USE_FASTAPI=false` (o no está definida):** Node.js ejecutará el script `python/predict.py` como un proceso hijo, pasando los datos como un argumento de línea de comandos.
