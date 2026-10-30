import time
import cv2
import numpy as np
from pathlib import Path
from ai_engine.detectors.vehicle_person_detector import VehiclePersonDetector
from ai_engine.detectors.helmet_analyzer import HelmetAnalyzer
from ai_engine.detectors.seatbelt_analyzer import SeatbeltAnalyzer
from ai_engine.detectors.plate_ocr import PlateOCRDetector
from ai_engine.core.tracker import ByteTrackTracker
from ai_engine.core.temporal_validator import TemporalViolationValidator
from ai_engine.evidence.evidence_builder import EvidenceBuilder
from backend.app.core.config import settings as Config
from backend.app.repositories.traffic_repository import TrafficRepository
from backend.app.core.logging import logger

class TrafficAnalyticsPipeline:
    """
    Master AI Computer Vision Pipeline:
    Orchestrates Detection ➔ Tracking ➔ Rider/Driver Association ➔
    Violation Analysis ➔ Temporal Debouncing ➔ Plate OCR ➔ Evidence Creation ➔ DB Persistence.
    """
    def __init__(self, location="Junction 04 - Smart Highway"):
        self.location = location
        self.detector = VehiclePersonDetector()
        self.tracker = ByteTrackTracker()
        self.helmet_analyzer = HelmetAnalyzer()
        self.seatbelt_analyzer = SeatbeltAnalyzer()
        self.plate_ocr = PlateOCRDetector()
        self.temporal_validator = TemporalViolationValidator(required_confirm_frames=4)
        self.evidence_builder = EvidenceBuilder()

    def process_video(self, video_source, frame_callback=None, status_callback=None, app_context=None):
        """
        Processes video stream or file frame-by-frame.
        - frame_callback(jpeg_bytes): called every frame for web UI live streaming
        - status_callback(dict): updates processing statistics (fps, progress, count)
        """
        cap = cv2.VideoCapture(str(video_source))
        if not cap.isOpened():
            logger.error(f"Failed to open video source: {video_source}")
            return

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1000
        fps_source = cap.get(cv2.CAP_PROP_FPS) or 30.0
        frame_idx = 0
        violations_count = 0
        start_time = time.time()

        # Check if running under a Flask app context for DB operations
        from backend.app.main import create_app
        flask_app = create_app()

        # Reset session states
        self.temporal_validator.reset()
        TrafficRepository.reset_track_session()

        logger.info(f"Starting AI Pipeline on: {video_source} ({total_frames} frames)")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            h, w = frame.shape[:2]

            # 1. Detect Vehicles & Persons
            vehicles, persons = self.detector.detect(frame)

            # 2. Track Vehicles across frames with ByteTrack
            active_tracks = self.tracker.update(vehicles)

            # Periodic memory cleanup every 45 frames
            if frame_idx % 45 == 0:
                self.temporal_validator.cleanup_expired_tracks(
                    [t.track_id for t in active_tracks],
                    current_frame=frame_idx
                )

            # Copy frame for visual display annotations
            display_frame = frame.copy()

            # Keep track of assigned persons in this frame to avoid counting same person for multiple vehicles
            assigned_person_indices = set()

            # 3. Analyze each tracked vehicle
            for track in active_tracks:
                tid = track.track_id
                v_type = track.cls_name
                v_box = track.bbox

                # Draw base vehicle tracker box
                vx1, vy1, vx2, vy2 = v_box
                cv2.rectangle(display_frame, (vx1, vy1), (vx2, vy2), (0, 255, 255), 2)
                cv2.putText(display_frame, f"{v_type.upper()} #{tid}", (vx1, max(18, vy1 - 6)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

                # Skip detailed analysis if this vehicle already has a confirmed logged violation
                if self.temporal_validator.is_already_confirmed(tid):
                    continue

                violation_detected = False
                violation_type = None
                helmet_type = "N/A"
                violation_box = None
                conf = 0.0

                # MOTORCYCLE PIPELINE: Rider association + Helmet detection + Triple Riding
                if v_type == 'motorcycle':
                    # Find unassigned persons overlapping this motorcycle seat region
                    mx1, my1, mx2, my2 = v_box
                    associated_indices = [
                        idx for idx, p in enumerate(persons)
                        if idx not in assigned_person_indices and
                        (mx1 <= (p['bbox'][0] + p['bbox'][2]) / 2 <= mx2) and
                        (p['bbox'][1] < my2 and p['bbox'][3] > my1)
                    ]

                    if len(associated_indices) >= 3:
                        violation_detected = True
                        violation_type = "Triple riding"
                        violation_box = v_box
                        conf = 0.94
                        helmet_type = "Triple Riding"
                        for idx in associated_indices:
                            assigned_person_indices.add(idx)
                    else:
                        unassigned_persons = [persons[idx] for idx in range(len(persons)) if idx not in assigned_person_indices]
                        rider = self.helmet_analyzer.associate_rider_to_motorcycle(v_box, unassigned_persons)
                        if rider:
                            rx1, ry1, rx2, ry2 = rider['bbox']
                            cv2.rectangle(display_frame, (rx1, ry1), (rx2, ry2), (255, 200, 0), 1)

                            status, is_violation, v_name, head_box, h_conf = self.helmet_analyzer.analyze_rider_helmet(frame, rider['bbox'])
                            helmet_type = status
                            
                            if is_violation:
                                violation_detected = True
                                violation_type = v_name
                                violation_box = head_box
                                conf = h_conf

                # CAR PIPELINE: Driver torso extraction + Seatbelt detection
                elif v_type == 'car':
                    is_wearing, is_violation, v_name, torso_box, s_conf = self.seatbelt_analyzer.analyze_driver_seatbelt(frame, v_box)
                    if is_violation:
                        violation_detected = True
                        violation_type = v_name
                        violation_box = torso_box
                        conf = s_conf

                # 4. Temporal Multi-Frame Voting & Confirmation
                if violation_detected:
                    is_confirmed = self.temporal_validator.add_vote(tid, violation_type, conf, frame_idx)

                    if is_confirmed:
                        # 5. Locate License Plate and Run OCR
                        plate_text, plate_box, p_conf = self.plate_ocr.detect_and_read(frame, v_box)
                        avg_conf = self.temporal_validator.get_average_confidence(tid, violation_type)

                        # 6. Generate Composite Evidence Image
                        evidence_file, date_str, time_str = self.evidence_builder.generate_evidence_image(
                            frame=frame,
                            vehicle_track_id=tid,
                            vehicle_type=v_type,
                            vehicle_box=v_box,
                            violation_type=violation_type,
                            violation_box=violation_box,
                            plate_text=plate_text,
                            plate_box=plate_box,
                            confidence=avg_conf,
                            location=self.location
                        )

                        # 7. Persist to Database with transaction isolation
                        try:
                            with flask_app.app_context():
                                TrafficRepository.create_violation(
                                    vehicle_track_id=tid,
                                    vehicle_type=v_type,
                                    vehicle_number=plate_text,
                                    violation_type=violation_type,
                                    helmet_type=helmet_type,
                                    confidence=avg_conf,
                                    date_str=date_str,
                                    time_str=time_str,
                                    location=self.location,
                                    evidence_image=evidence_file
                                )
                        except Exception as persist_err:
                            logger.error(f"[AI Pipeline] Error writing violation to database: {persist_err}")

                        violations_count += 1
                        logger.info(f"[CONFIRMED VIOLATION] Track #{tid} | {v_type.upper()} | {violation_type} | Plate: {plate_text}")

            # Calculate FPS and status
            elapsed = time.time() - start_time
            current_fps = round(frame_idx / (elapsed + 1e-6), 1)

            # Draw HUD on display frame
            cv2.rectangle(display_frame, (10, 10), (320, 85), (0, 0, 0), -1)
            cv2.rectangle(display_frame, (10, 10), (320, 85), (0, 255, 255), 1)
            cv2.putText(display_frame, f"AI TRAFFIC ANALYTICS", (20, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            cv2.putText(display_frame, f"FPS: {current_fps} | Frame: {frame_idx}/{total_frames}", (20, 54), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
            cv2.putText(display_frame, f"Violations Logged: {violations_count}", (20, 74), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 100, 255), 1)

            # Stream frame to web UI
            if frame_callback is not None:
                _, jpeg = cv2.imencode('.jpg', display_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
                frame_callback(jpeg.tobytes())

            # Update status callback
            if status_callback is not None and frame_idx % 5 == 0:
                progress = int((frame_idx / total_frames) * 100)
                status_callback(
                    fps=current_fps,
                    processed_frames=frame_idx,
                    total_frames=total_frames,
                    progress_percent=min(99, progress),
                    violations_detected=violations_count
                )

        cap.release()
        logger.info(f"AI Pipeline completed. Total violations: {violations_count}")
