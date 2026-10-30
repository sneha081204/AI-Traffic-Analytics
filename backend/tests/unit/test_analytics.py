from backend.app.repositories.traffic_repository import TrafficRepository

def test_analytics_summary(app):
    with app.app_context():
        stats = TrafficRepository.get_stats()
        assert "total_violations" in stats
        assert "no_helmet" in stats
        assert "no_seatbelt" in stats
