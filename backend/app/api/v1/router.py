from flask import Blueprint
from backend.app.api.v1.endpoints.auth import auth_router
from backend.app.api.v1.endpoints.users import users_router
from backend.app.api.v1.endpoints.traffic import traffic_router
from backend.app.api.v1.endpoints.cameras import cameras_router
from backend.app.api.v1.endpoints.analytics import analytics_router
from backend.app.api.v1.endpoints.officers import officers_router
from backend.app.api.v1.endpoints.violations import violations_router
from backend.app.api.v1.endpoints.violation_rules import rules_router
from backend.app.api.v1.endpoints.ai import ai_router
from backend.app.api.v1.endpoints.sectors import sectors_router

api_v1_router = Blueprint('api_v1', __name__)

# Register versioned endpoint groups
api_v1_router.register_blueprint(auth_router, url_prefix='/auth')
api_v1_router.register_blueprint(users_router, url_prefix='/users')
api_v1_router.register_blueprint(traffic_router, url_prefix='/traffic')
api_v1_router.register_blueprint(cameras_router, url_prefix='/cameras')
api_v1_router.register_blueprint(analytics_router, url_prefix='/analytics')
api_v1_router.register_blueprint(officers_router, url_prefix='/officers')
api_v1_router.register_blueprint(violations_router, url_prefix='/violations')
api_v1_router.register_blueprint(rules_router, url_prefix='/violation-rules')
api_v1_router.register_blueprint(ai_router, url_prefix='/ai')
api_v1_router.register_blueprint(sectors_router, url_prefix='/sectors')


