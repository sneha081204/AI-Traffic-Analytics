from flask import request, jsonify
from backend.app.core.security import decode_access_token

def get_current_user():
    """Dependency to extract authenticated user from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    return decode_access_token(token)

def require_auth(f):
    """Decorator to enforce JWT token authorization."""
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"success": False, "error": "Unauthorized access"}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper
