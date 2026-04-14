from __future__ import annotations

import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


def _default_sqlite_url() -> str:
    sqlite_path = (BASE_DIR / "lingua.db").resolve()
    return f"sqlite:///{sqlite_path.as_posix()}"


def get_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL", "").strip()
    if not raw_url:
        return _default_sqlite_url()

    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg2://", 1)

    if raw_url.startswith("postgresql://") and "+psycopg2" not in raw_url:
        return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    return raw_url


def get_allowed_origins() -> list[str]:
    defaults = [
        "http://localhost:5173",
        "https://ai-translator-snowy-ten.vercel.app",
    ]
    extra_origins = [
        origin.strip()
        for origin in os.getenv("CORS_ALLOW_ORIGINS", "").split(",")
        if origin.strip()
    ]
    return list(dict.fromkeys([*defaults, *extra_origins]))


def get_origin_regex() -> str:
    return os.getenv("CORS_ALLOW_ORIGIN_REGEX", r"https://.*\.vercel\.app")


def get_jwt_secret_key() -> tuple[str, bool]:
    secret = (os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or "").strip()
    if secret:
        return secret, False
    return secrets.token_urlsafe(48), True


DATABASE_URL = get_database_url()
ALLOWED_ORIGINS = get_allowed_origins()
ALLOWED_ORIGIN_REGEX = get_origin_regex()
JWT_SECRET_KEY, JWT_SECRET_KEY_IS_EPHEMERAL = get_jwt_secret_key()
GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()
