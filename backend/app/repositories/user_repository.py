from backend.app.core.database import db
from backend.app.models.user import User

class UserRepository:
    @staticmethod
    def get_by_username(username: str):
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_by_email(email: str):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def create_user(username: str, email: str, hashed_password: str, role: str = "traffic_officer"):
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=role
        )
        db.session.add(user)
        db.session.commit()
        return user
