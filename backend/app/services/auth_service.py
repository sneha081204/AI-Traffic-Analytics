from backend.app.repositories.user_repository import UserRepository
from backend.app.core.security import verify_password, hash_password, create_access_token

class AuthService:
    @staticmethod
    def authenticate_user(username: str, password: str):
        user = UserRepository.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            return None, "Invalid username or password"
        
        token = create_access_token({
            "sub": str(user.id),
            "username": user.username,
            "role": user.role
        })
        return {"access_token": token, "token_type": "bearer", "user": user.to_dict()}, None

    @staticmethod
    def register_user(username: str, email: str, password: str, role: str = "traffic_officer"):
        if UserRepository.get_by_username(username):
            return None, "Username already registered"
        if UserRepository.get_by_email(email):
            return None, "Email already registered"

        hashed = hash_password(password)
        user = UserRepository.create_user(username, email, hashed, role)
        return user.to_dict(), None
