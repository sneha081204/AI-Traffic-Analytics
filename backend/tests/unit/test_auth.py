from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pwd = "securepassword123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_flow():
    payload = {"sub": "1", "username": "officer1", "role": "admin"}
    token = create_access_token(payload, expires_in_minutes=5)
    assert token is not None
    decoded = decode_access_token(token)
    assert decoded["username"] == "officer1"
    assert decoded["role"] == "admin"
