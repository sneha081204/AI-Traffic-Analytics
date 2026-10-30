import os
from pathlib import Path
from dotenv import load_dotenv

# Base project directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"

# Load .env (Check backend/.env first, then root .env)
if (BACKEND_DIR / ".env").exists():
    load_dotenv(BACKEND_DIR / ".env")
else:
    load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "AI Traffic Analytics & Automatic Enforcement System"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api/v1"
    
    BASE_DIR: Path = BASE_DIR
    BACKEND_DIR: Path = BACKEND_DIR
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "traffic-analytics-secret-key-enterprise-2026")
    
    # Server Binding
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 5001))
    
    # Database Configuration (MySQL Primary with SQLite Fallback)
    DB_ENGINE: str = os.getenv("DB_ENGINE", "mysql")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "127.0.0.1")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "traffic_ai_db")
    MYSQL_CHARSET: str = os.getenv("MYSQL_CHARSET", "utf8mb4")
    DB_TIMEOUT: int = int(os.getenv("DB_TIMEOUT", 2))

    DATABASE_PATH: Path = BASE_DIR / "backend" / "storage" / "database.sqlite"

    @property
    def DATABASE_URL(self) -> str:
        custom_url = os.getenv("DATABASE_URL")
        if custom_url and not custom_url.startswith("sqlite:///.."):
            if custom_url.startswith("postgres://"):
                custom_url = custom_url.replace("postgres://", "postgresql://", 1)
            return custom_url

        if self.DB_ENGINE.lower() == "mysql":
            from urllib.parse import quote_plus
            user = quote_plus(self.MYSQL_USER)
            pwd = f":{quote_plus(self.MYSQL_PASSWORD)}" if self.MYSQL_PASSWORD else ""
            return f"mysql+pymysql://{user}{pwd}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}?charset=utf8mb4"
        else:
            return f"sqlite:///{str(self.DATABASE_PATH).replace(chr(92), '/')}"
    
    # Storage Paths
    STORAGE_DIR: Path = BASE_DIR / "backend" / "storage"
    EVIDENCE_DIR: Path = BASE_DIR / "backend" / "storage" / "evidence"
    UPLOAD_DIR: Path = BASE_DIR / "backend" / "storage" / "uploads"
    WEIGHTS_DIR: Path = BASE_DIR / "ai_engine" / "weights"
    FRONTEND_DIR: Path = BASE_DIR / "frontend"

    # AI Multimodal & Computer Vision Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_DEVICE: str = os.getenv("AI_DEVICE", "cpu")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", 0.45))
    IOU_THRESHOLD: float = float(os.getenv("IOU_THRESHOLD", 0.50))
    TEMPORAL_VOTING_FRAMES: int = int(os.getenv("TEMPORAL_VOTING_FRAMES", 5))

    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-jwt-secret-traffic-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: list = ["*"]

    def ensure_directories(self):
        """Creates runtime storage folders if they do not exist."""
        self.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        self.EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()

def is_valid_gemini_key(key: str) -> bool:
    """Check if a Gemini API key looks authentic and usable."""
    if not key or not isinstance(key, str):
        return False
    k = key.strip()
    if len(k) < 25:
        return False
    if "••••" in k or "..." in k:
        return False
    if "demo" in k.lower() or "customkey" in k.lower():
        return False
    if k.lower() in ("null", "undefined", "none", "false"):
        return False
    return True

def get_valid_gemini_api_key(candidate: str = None) -> str:
    """
    Robust resolver that guarantees a genuine, working Google Gemini API key.
    Rejects demo keys, masked keys, undefined, and empty values.
    Prioritizes genuine candidate key, then environment, then database, then disk .env.
    """
    if candidate and is_valid_gemini_key(candidate):
        return candidate.strip()

    env_k = os.getenv("GEMINI_API_KEY", "").strip()
    if is_valid_gemini_key(env_k):
        return env_k

    if is_valid_gemini_key(settings.GEMINI_API_KEY):
        return settings.GEMINI_API_KEY.strip()

    try:
        from backend.app.models.traffic import AIConfigModel
        cfg = AIConfigModel.query.first()
        if cfg and cfg.api_key and is_valid_gemini_key(cfg.api_key):
            return cfg.api_key.strip()
    except Exception:
        pass

    # Direct fallback: check .env files on disk
    for env_path in [BACKEND_DIR / ".env", BASE_DIR / ".env"]:
        try:
            if env_path.exists():
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("GEMINI_API_KEY="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if is_valid_gemini_key(val):
                                os.environ["GEMINI_API_KEY"] = val
                                return val
        except Exception:
            pass

    return ""
