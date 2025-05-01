import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Configuraciones de la aplicación"""
    
    # Configuración de la API
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Excel AI API"
    
    # Directorio temporal para archivos
    TEMP_DIR: str = "temp_files"
    
    # Token de Hugging Face
    HUGGINGFACE_API_KEY: str = os.environ.get("HUGGINGFACE_API_KEY", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
