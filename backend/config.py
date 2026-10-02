from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API Keys
    google_api_key: str
    
    # App Metadata
    app_name: str
    app_version: str
    
    # Flags
    debug: bool
    
    # Database
    database_url: str
    
    # Security (CORS)
    allowed_origins: str 

    secret_key: str                           
    algorithm: str       = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

# We create a single instance of this class to use throughout the app
settings = Settings()