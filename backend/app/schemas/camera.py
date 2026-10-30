from pydantic import BaseModel
from typing import Optional

class CameraCreateSchema(BaseModel):
    name: str
    location: str
    rtsp_url: Optional[str] = None
    fps: Optional[float] = 30.0

class CameraResponseSchema(BaseModel):
    id: int
    name: str
    location: str
    rtsp_url: Optional[str]
    status: str
    fps: float
