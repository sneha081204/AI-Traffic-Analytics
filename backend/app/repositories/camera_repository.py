from backend.app.core.database import db
from backend.app.models.camera import Camera

class CameraRepository:
    @staticmethod
    def get_all():
        return [c.to_dict() for c in Camera.query.all()]

    @staticmethod
    def create_camera(name: str, location: str, rtsp_url: str = None, fps: float = 30.0):
        camera = Camera(name=name, location=location, rtsp_url=rtsp_url, fps=fps)
        db.session.add(camera)
        db.session.commit()
        return camera
