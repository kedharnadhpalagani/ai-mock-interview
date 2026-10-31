import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI MOCK INTERVIEW — VIGNAN'S UNIVERSITY"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # MongoDB Atlas
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "vignan_ai_interview_db"

    # JWT Authentication
    JWT_SECRET: str = "vignan_quantum_aurora_secret_key_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    PASSWORD_RESET_EXPIRE_MINUTES: int = 15     # 15 minutes
    OTP_EXPIRE_MINUTES: int = 5                 # 5 minutes
    OTP_RESEND_COOLDOWN_SECONDS: int = 60       # 60 seconds
    OTP_MAX_ATTEMPTS: int = 5

    # Email Service (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Vignan Mock Interview <onboarding@resend.dev>"

    # AI Service (Google Gemini Live API)
    AI_PROVIDER_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.0-flash"

    # Initial Admin Bootstrap (Supplied on Render)
    ADMIN_USERNAME: str = ""
    ADMIN_INITIAL_PASSWORD: str = ""

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000,http://localhost:5173,https://*.vercel.app"

    # Storage (Cloudinary or local data URI fallback)
    STORAGE_CONFIGURATION: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.FRONTEND_ORIGIN:
            return ["*"]
        return [origin.strip() for origin in self.FRONTEND_ORIGIN.split(",") if origin.strip()]

settings = Settings()
