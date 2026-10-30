import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class AIConfig:
    """AI Vision Pipeline Settings"""
    DEVICE = os.getenv("AI_DEVICE", "cpu")
    
    # Model Weights
    YOLO_MODEL_PATH = str(BASE_DIR / "ai_engine" / "weights" / "yolov8n.pt")
    HELMET_MODEL_PATH = str(BASE_DIR / "ai_engine" / "weights" / "helmet_model.pt")
    SEATBELT_MODEL_PATH = str(BASE_DIR / "ai_engine" / "weights" / "seatbelt_model.pt")
    PLATE_MODEL_PATH = str(BASE_DIR / "ai_engine" / "weights" / "plate_detector.pt")

    # Detection Thresholds
    VEHICLE_CONF_THRESH = 0.40
    PERSON_CONF_THRESH = 0.40
    HELMET_CONF_THRESH = 0.45
    SEATBELT_CONF_THRESH = 0.50
    PLATE_CONF_THRESH = 0.35

    # Tracking & Temporal Debounce
    BYTE_TRACK_THRESH = 0.70
    TEMPORAL_CONFIRM_FRAMES = 5 # Require 5 consistent violation frames
    MAX_TRACK_AGE = 30 # Frames to keep lost track

    # Class IDs in standard COCO
    COCO_PERSON = 0
    COCO_BICYCLE = 1
    COCO_CAR = 2
    COCO_MOTORCYCLE = 3
    COCO_BUS = 5
    COCO_TRUCK = 7
