from flask import Blueprint, jsonify
from backend.app.services.analytics_service import AnalyticsService

analytics_router = Blueprint('analytics_v1', __name__)

@analytics_router.route('/summary', methods=['GET'])
def get_summary():
    stats = AnalyticsService.get_summary_kpi()
    return jsonify({"success": True, "data": stats})

@analytics_router.route('/timeline', methods=['GET'])
def get_timeline():
    timeline = AnalyticsService.get_time_series_timeline()
    return jsonify({"success": True, "data": timeline})
