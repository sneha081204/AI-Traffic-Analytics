from flask import jsonify
from backend.app.exceptions.base import AppException

def register_exception_handlers(app):
    @app.errorhandler(AppException)
    def handle_app_exception(error):
        return jsonify({
            "success": False,
            "error": error.message
        }), error.status_code

    @app.errorhandler(404)
    def handle_404(error):
        return jsonify({
            "success": False,
            "error": "Endpoint not found"
        }), 404

    @app.errorhandler(500)
    def handle_500(error):
        return jsonify({
            "success": False,
            "error": "Internal Server Error"
        }), 500
