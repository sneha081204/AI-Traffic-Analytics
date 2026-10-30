import hashlib
import hmac
import time
import base64
import json
from backend.app.core.config import settings

def hash_password(password: str) -> str:
    """Hashes password with salt using SHA-256."""
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against hash."""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_in_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """Generates a lightweight JWT-style secure access token."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload_data = dict(data)
    payload_data["exp"] = int(time.time()) + (expires_in_minutes * 60)
    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        settings.JWT_SECRET.encode(),
        f"{header}.{payload}".encode(),
        hashlib.sha256
    ).digest()
    sig_str = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header}.{payload}.{sig_str}"

def decode_access_token(token: str) -> dict:
    """Decodes and verifies token signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, sig = parts
        
        expected_sig = hmac.new(
            settings.JWT_SECRET.encode(),
            f"{header}.{payload}".encode(),
            hashlib.sha256
        ).digest()
        expected_sig_str = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(sig, expected_sig_str):
            return None
            
        payload_bytes = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
        data = json.loads(payload_bytes)
        
        if data.get("exp", 0) < time.time():
            return None
        return data
    except Exception:
        return None
