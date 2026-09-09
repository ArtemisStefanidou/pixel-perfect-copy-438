from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    frontend_origin: str = "http://localhost:5173"

    @property
    def frontend_origins(self) -> list[str]:
        return [o.strip() for o in self.frontend_origin.split(",") if o.strip()]


settings = Settings()
