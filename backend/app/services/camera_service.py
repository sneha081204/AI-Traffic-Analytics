from backend.app.repositories.camera_repository import CameraRepository

class CameraService:
    @staticmethod
    def list_cameras():
        return CameraRepository.get_all()

    @staticmethod
    def register_camera(name: str, location: str, rtsp_url: str = None, fps: float = 30.0):
        return CameraRepository.create_camera(name, location, rtsp_url, fps).to_dict()
