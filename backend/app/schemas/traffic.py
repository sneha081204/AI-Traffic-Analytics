from pydantic import BaseModel, Field
from typing import Optional

class ViolationSchema(BaseModel):
    id: Optional[int] = None
    vehicle_track_id: int
    vehicle_type: str
    vehicle_number: Optional[str] = "UNIDENTIFIED"
    vehicle_make_model: Optional[str] = "Standard Vehicle"
    vehicle_color: Optional[str] = "Standard Tone"
    violation_type: str
    helmet_type: Optional[str] = "N/A"
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    date: str
    time: str
    location: str
    evidence_image: str
    status: str = "Confirmed"

class ViolationStatusUpdateSchema(BaseModel):
    status: str
