from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)


class Settings(BaseSettings):
    # LLM Settings (Groq)
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", alias="GROQ_MODEL")

    # Database Settings
    database_path: str = Field(default="./warehouse.db", alias="DATABASE_PATH")

    # Pinecone Vector / Memory Settings
    pinecone_api_key: str = Field(default="", alias="PINECONE_API_KEY")
    pinecone_environment: str = Field(default="us-east1", alias="PINECONE_ENVIRONMENT")
    pinecone_index_name: str = Field(default="vanna-memory", alias="PINECONE_INDEX_NAME")

    # Embedding Settings (e.g. HuggingFace / FastEmbed / OpenAI)
    embedding_model: str = Field(default="all-MiniLM-L6-v2", alias="EMBEDDING_MODEL")

    # Server Settings
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8001, alias="PORT")

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
