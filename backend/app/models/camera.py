from datetime import datetime
from backend.app.core.database import db

class Camera(db.Model):
    """Traffic Camera Junction Device Model"""
    __tablename__ = 'cameras'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(128), nullable=False)
    location = db.Column(db.String(256), nullable=False)
    rtsp_url = db.Column(db.String(512), nullable=True)
    status = db.Column(db.String(32), default="ONLINE") # ONLINE, OFFLINE, MAINTENANCE
    fps = db.Column(db.Float, default=30.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "rtsp_url": self.rtsp_url,
            "status": self.status,
            "fps": self.fps,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
