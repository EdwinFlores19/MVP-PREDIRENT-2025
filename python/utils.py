import os
import yaml
from sqlalchemy import create_engine
from dotenv import load_dotenv

def load_env_config():
    """Carga la configuración desde un archivo .env o config.yaml."""
    load_dotenv()
    conn_str = os.getenv("DB_CONNECTION_STRING")
    if conn_str:
        return {"db_connection": conn_str}
    
    if os.path.exists('config.yaml'):
        with open('config.yaml', 'r') as f:
            return yaml.safe_load(f)
    return None

def get_sqlalchemy_engine():
    """Crea y devuelve un motor de SQLAlchemy."""
    config = load_env_config()
    if not config or 'db_connection' not in config:
        raise ValueError("No se encontró la cadena de conexión a la base de datos.")
    
    engine = create_engine(config['db_connection'])
    return engine
