from flask import Blueprint, jsonify
from backend.app.models.user import User

users_router = Blueprint('users_v1', __name__)

@users_router.route('/', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify({"success": True, "data": [u.to_dict() for u in users]})
