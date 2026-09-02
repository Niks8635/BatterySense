from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = '127.0.0.1'
    PORT: int = 8000
    DATA_RETENTION_HOURS: int = 24
    TELEMETRY_INTERVAL_CPU: float = 1.0
    TELEMETRY_INTERVAL_RAM: float = 1.0
    TELEMETRY_INTERVAL_BATTERY: float = 5.0
    TELEMETRY_INTERVAL_DISK: float = 10.0
    TELEMETRY_INTERVAL_GPU: float = 5.0
    DATABASE_PATH: str = 'batterysense.db'
    CORS_ORIGINS: str = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000'

settings = Settings()
