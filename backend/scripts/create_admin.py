import sys
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.main import create_app
from backend.app.repositories.user_repository import UserRepository
from backend.app.core.security import hash_password

def create_admin(username, email, password):
    app = create_app()
    with app.app_context():
        existing = UserRepository.get_by_username(username)
        if existing:
            print(f"[-] Error: User '{username}' already exists.")
            return
        user = UserRepository.create_user(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            role="admin"
        )
        print(f"[+] Successfully created admin user: {user.username} ({user.email})")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Create Traffic AI Admin User")
    parser.add_argument("--username", default="admin", help="Admin username")
    parser.add_argument("--email", default="admin@traffic.gov", help="Admin email")
    parser.add_argument("--password", default="admin123", help="Admin password")
    args = parser.parse_args()
    create_admin(args.username, args.email, args.password)
