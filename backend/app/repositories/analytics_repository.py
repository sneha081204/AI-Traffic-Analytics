from backend.app.core.database import db
from backend.app.models.traffic import Violation
from sqlalchemy import func

class AnalyticsRepository:
    @staticmethod
    def get_timeline():
        results = db.session.query(
            Violation.date,
            Violation.violation_type,
            func.count(Violation.id)
        ).group_by(Violation.date, Violation.violation_type).all()

        timeline_data = {}
        for date_str, v_type, count in results:
            if date_str not in timeline_data:
                timeline_data[date_str] = {"No Helmet": 0, "Invalid Helmet": 0, "No Seatbelt": 0}
            timeline_data[date_str][v_type] = count

        return timeline_data
