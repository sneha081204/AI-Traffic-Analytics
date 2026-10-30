from backend.app.repositories.traffic_repository import TrafficRepository
from backend.app.repositories.analytics_repository import AnalyticsRepository

class AnalyticsService:
    @staticmethod
    def get_summary_kpi():
        return TrafficRepository.get_stats()

    @staticmethod
    def get_time_series_timeline():
        return AnalyticsRepository.get_timeline()
