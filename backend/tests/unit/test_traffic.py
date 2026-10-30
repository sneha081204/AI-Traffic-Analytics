from backend.app.repositories.traffic_repository import TrafficRepository

def test_create_and_get_violation(app):
    with app.app_context():
        v = TrafficRepository.create_violation(
            vehicle_track_id=1,
            vehicle_type="motorcycle",
            vehicle_number="KA01AB1234",
            violation_type="No Helmet",
            helmet_type="No helmet",
            confidence=0.95,
            date_str="2026-10-05",
            time_str="12:00:00",
            location="Test Junction",
            evidence_image="test_ev.jpg"
        )
        assert v.id is not None
        assert v.vehicle_track_id == 1
        assert TrafficRepository.exists_for_track_id(1) is True
        assert TrafficRepository.exists_for_track_id(999) is False
