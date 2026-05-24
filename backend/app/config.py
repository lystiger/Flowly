from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "GloveFlow Backend"
    APP_ENV: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    DATA_MODE: str = "mock"
    SERIAL_PORT: str = "COM3"
    SERIAL_BAUDRATE: int = 115200
    
    WS_BROADCAST_HZ: int = 30
    MAX_ROLLING_WINDOW: int = 300
    
    DATABASE_URL: str = "sqlite:///./gloveflow.db"

settings = Settings()
