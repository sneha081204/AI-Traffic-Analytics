import threading
import time
from pathlib import Path
from backend.app.repositories.traffic_repository import TrafficRepository
from backend.app.core.config import settings
from ai_engine.detectors.multimodal_vehicle_analyzer import MultimodalVehicleAIAnalyzer
from backend.app.models.traffic import Violation
from backend.app.core.database import db

# Thread-safe global streaming state for MJPEG feed
_stream_lock = threading.Lock()
_latest_frame = None
_processing_status = {
    "is_processing": False,
    "current_file": None,
    "progress_percent": 0,
    "fps": 0.0,
    "total_frames": 0,
    "processed_frames": 0,
    "violations_detected": 0
}

class TrafficService:
    @staticmethod
    def set_latest_frame(jpeg_bytes):
        global _latest_frame
        with _stream_lock:
            _latest_frame = jpeg_bytes

    @staticmethod
    def update_processing_status(**kwargs):
        global _processing_status
        with _stream_lock:
            _processing_status.update(kwargs)

    @staticmethod
    def get_processing_status():
        global _processing_status
        with _stream_lock:
            return dict(_processing_status)

    @staticmethod
    def generate_mjpeg_stream():
        """Yield MJPEG frames to client for live browser video playback."""
        global _latest_frame
        while True:
            with _stream_lock:
                frame = _latest_frame
            if frame is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.033)  # ~30 FPS

    @staticmethod
    def get_violations(violation_type=None, search=None, page=1, limit=20):
        offset = (page - 1) * limit
        records, total = TrafficRepository.get_all(violation_type, search, limit, offset)
        return {"data": records, "total": total, "page": page, "limit": limit}

    @staticmethod
    def get_violation_detail(violation_id: int):
        return TrafficRepository.get_by_id(violation_id)

    @staticmethod
    def update_violation_status(violation_id: int, new_status: str):
        record = Violation.query.get(violation_id)
        if not record:
            return None
        record.status = new_status
        db.session.commit()
        return record.to_dict()

    @staticmethod
    def run_ai_forensic_analysis(violation_id: int, api_key: str = None):
        record = Violation.query.get(violation_id)
        if not record:
            return None, "Violation record not found"

        analyzer = MultimodalVehicleAIAnalyzer(api_key=api_key or settings.GEMINI_API_KEY)
        image_path = settings.EVIDENCE_DIR / record.evidence_image

        ai_result = analyzer.analyze_violation_snapshot(
            image_path=str(image_path),
            vehicle_type=record.vehicle_type,
            violation_type=record.violation_type
        )

        if ai_result.get("vehicle_make_model"):
            record.vehicle_make_model = ai_result["vehicle_make_model"]
        if ai_result.get("vehicle_color"):
            record.vehicle_color = ai_result["vehicle_color"]
        if ai_result.get("license_plate_number") and ai_result["license_plate_number"] != "NOT VISIBLE":
            record.vehicle_number = ai_result["license_plate_number"]
        if ai_result.get("violation_summary"):
            record.violation_details = ai_result["violation_summary"]
        if ai_result.get("applicable_law"):
            record.applicable_law = ai_result["applicable_law"]
        if ai_result.get("recommended_fine"):
            record.recommended_fine = ai_result["recommended_fine"]
        if not record.challan_no:
            record.challan_no = f"ECH-2026-{record.id:05d}"

        db.session.commit()
        return record.to_dict(), None

    @staticmethod
    def generate_echallan_report(violation_id: int):
        record = Violation.query.get(violation_id)
        if not record:
            return None
        v = record.to_dict()
        return {
            "challan_reference_no": v["challan_no"],
            "issue_authority": "INTELLIGENT TRAFFIC ENFORCEMENT DIRECTORATE (ITS)",
            "timestamp": f"{v['date']} {v['time']}",
            "location": v["location"],
            "vehicle_details": {
                "track_id": f"#{v['vehicle_track_id']}",
                "type": v["vehicle_type"].upper(),
                "make_and_model": v["vehicle_make_model"],
                "color": v["vehicle_color"],
                "registration_number": v["vehicle_number"]
            },
            "offence_details": {
                "primary_violation": v["violation_type"],
                "helmet_classification": v["helmet_type"],
                "statutory_law_section": v["applicable_law"],
                "penalty_amount": v["recommended_fine"],
                "forensic_summary": v["violation_details"],
                "confidence_rating": f"{v['confidence'] * 100:.1f}%"
            },
            "evidence_media_url": v["evidence_url"],
            "status": v["status"]
        }

