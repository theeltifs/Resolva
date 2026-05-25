from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    resend_api_key: str = ""
    human_agent_email: str = ""
    database_url: str = "sqlite:///./resolva.db"
    chroma_db_path: str = "./chroma_db"
    confidence_threshold: float = 0.65
    upload_api_key: str = "changeme-set-in-env"
    max_upload_size_mb: int = 10

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
