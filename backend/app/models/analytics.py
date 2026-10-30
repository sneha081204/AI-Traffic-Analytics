from datetime import datetime
from backend.app.core.database import db

class TrafficDensityLog(db.Model):
    """Hourly and Daily Aggregated Traffic Density & Flow Metrics"""
    __tablename__ = 'traffic_density_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    camera_id = db.Column(db.Integer, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    total_vehicles_counted = db.Column(db.Integer, default=0)
    motorcycle_count = db.Column(db.Integer, default=0)
    car_count = db.Column(db.Integer, default=0)
    truck_bus_count = db.Column(db.Integer, default=0)
    total_violations_recorded = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "camera_id": self.camera_id,
            "timestamp": self.timestamp.isoformat(),
            "total_vehicles_counted": self.total_vehicles_counted,
            "motorcycle_count": self.motorcycle_count,
            "car_count": self.car_count,
            "truck_bus_count": self.truck_bus_count,
            "total_violations_recorded": self.total_violations_recorded
        }
