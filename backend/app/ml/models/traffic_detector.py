from ai_engine.detectors.vehicle_person_detector import VehiclePersonDetector
from ai_engine.detectors.helmet_analyzer import HelmetAnalyzer
from ai_engine.detectors.seatbelt_analyzer import SeatbeltAnalyzer
from ai_engine.detectors.plate_ocr import PlateOCRDetector

class TrafficAIEnsemble:
    """Consolidated Deep Learning Model Ensemble for Traffic Violation Enforcement."""
    def __init__(self):
        self.vehicle_person_detector = VehiclePersonDetector()
        self.helmet_analyzer = HelmetAnalyzer()
        self.seatbelt_analyzer = SeatbeltAnalyzer()
        self.plate_ocr = PlateOCRDetector()
