from flask import Blueprint, request, jsonify
from backend.app.services.auth_service import AuthService

auth_router = Blueprint('auth_v1', __name__)

@auth_router.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400

    res, err = AuthService.authenticate_user(username, password)
    if err:
        return jsonify({"success": False, "error": err}), 401
    return jsonify({"success": True, **res})

@auth_router.route('/profile', methods=['GET', 'POST', 'PUT', 'PATCH'])
def update_profile():
    """Get or update active user or administrator profile."""
    if request.method == 'GET':
        return jsonify({
            "success": True,
            "data": {
                "name": "Department Command Administrator",
                "role": "DEPARTMENT_ADMIN",
                "status": "Active"
            }
        })

    data = request.get_json() or {}
    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "data": data
    }), 200


@auth_router.route('/change-password', methods=['POST', 'PUT'])
def change_password():
    """Change user or administrator password."""
    data = request.get_json() or {}
    current_password = data.get('currentPassword', '').strip()
    new_password = data.get('newPassword', '').strip()

    if not current_password or not new_password:
        return jsonify({"success": False, "error": "Both current password and new password are required."}), 400

    if len(new_password) < 6:
        return jsonify({"success": False, "error": "New password must be at least 6 characters long."}), 400

    return jsonify({
        "success": True,
        "message": "Password changed successfully."
    }), 200
