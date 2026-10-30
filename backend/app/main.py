import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from backend.app.core.config import settings
from backend.app.core.database import db
from backend.app.core.logging import logger
from backend.app.exceptions.handlers import register_exception_handlers
from backend.app.api.v1.router import api_v1_router

def create_app():
    """Application Factory Pattern for Enterprise Traffic AI Backend."""
    app = Flask(
        __name__,
        static_folder=str(settings.FRONTEND_DIR / "dist" if (settings.FRONTEND_DIR / "dist").exists() else settings.FRONTEND_DIR),
        static_url_path=""
    )
    
    # Configure app from settings
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = settings.SECRET_KEY

    # CORS Configuration
    CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["*"], methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

    @app.before_request
    def handle_preflight():
        from flask import request, Response
        if request.method == "OPTIONS":
            res = Response()
            res.headers['Access-Control-Allow-Origin'] = '*'
            res.headers['Access-Control-Allow-Headers'] = '*'
            res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            return res, 200

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        return response

    # Ensure runtime storage directories
    settings.ensure_directories()

    # Initialize Database & Tables (MySQL Primary / SQLite fallback)
    from backend.app.core.database import init_db
    init_db(app, settings)

    # Register Exception Handlers
    register_exception_handlers(app)

    # Register Versioned API V1 Router
    app.register_blueprint(api_v1_router, url_prefix=settings.API_V1_STR)


    # Health Check Endpoint
    @app.route('/api/system/health')
    @app.route('/health')
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION
        })

    # Serve Stored Evidence Images
    @app.route('/storage/evidence/<path:filename>')
    def serve_evidence(filename):
        return send_from_directory(str(settings.EVIDENCE_DIR), filename)

    logger.info(f"Initialized {settings.PROJECT_NAME} v{settings.VERSION}")
    return app

app = create_app()

if __name__ == '__main__':
    run_port = int(os.environ.get("PORT", settings.PORT))
    print("\n" + "="*70)
    print(f"[+] {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"[+] V1 API:     http://localhost:{run_port}{settings.API_V1_STR}")
    print(f"[+] Health:     http://localhost:{run_port}/api/system/health")
    print("="*70 + "\n")
    app.run(host=settings.HOST, port=run_port, debug=settings.DEBUG, threaded=True)


