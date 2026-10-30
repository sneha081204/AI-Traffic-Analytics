import os
import cv2
import numpy as np
from ai_engine.detectors.base_detector import BaseDetector
from ai_engine.config import AIConfig

class VehiclePersonDetector(BaseDetector):
    """
    Primary YOLOv8/YOLOv11 Detector for:
    - Cars, Motorcycles, Buses, Trucks
    - Persons (Riders, Drivers, Pedestrians)
    """
    def __init__(self, model_path=None, conf_thresh=AIConfig.VEHICLE_CONF_THRESH, device=AIConfig.DEVICE):
        self.model_path = model_path or AIConfig.YOLO_MODEL_PATH
        self.conf_thresh = conf_thresh
        self.device = device
        self.model = None
        self.load_model()

    def load_model(self):
        """Loads Ultralytics YOLO model."""
        try:
            from ultralytics import YOLO
            # If specified custom weights exist, use them; otherwise use standard pretrained yolov8n
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
            else:
                self.model = YOLO("yolov8n.pt")
        except Exception as e:
            print(f"[Detector Warning] Could not load YOLO weights ({e}). Running in fallback mode.")
            self.model = None

    def detect(self, frame):
        """
        Runs object detection on input frame (BGR numpy array).
        Returns:
            vehicles: list of {'bbox': [x1,y1,x2,y2], 'class': 'motorcycle'|'car', 'score': float}
            persons:  list of {'bbox': [x1,y1,x2,y2], 'score': float}
        """
        vehicles = []
        persons = []

        if self.model is None:
            return vehicles, persons

        try:
            results = self.model.predict(
                source=frame,
                conf=self.conf_thresh,
                device=self.device,
                verbose=False
            )
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].cpu().numpy().astype(int).tolist()

                    if cls_id == AIConfig.COCO_PERSON:
                        persons.append({'bbox': xyxy, 'score': conf, 'class': 'person'})
                    elif cls_id == AIConfig.COCO_MOTORCYCLE:
                        vehicles.append({'bbox': xyxy, 'score': conf, 'class': 'motorcycle'})
                    elif cls_id in (AIConfig.COCO_CAR, AIConfig.COCO_BUS, AIConfig.COCO_TRUCK):
                        vehicles.append({'bbox': xyxy, 'score': conf, 'class': 'car'})
        except Exception as e:
            print(f"[Detector Error] Inference failed: {e}")

        return vehicles, persons
