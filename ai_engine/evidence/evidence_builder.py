import os
import time
import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from backend.app.core.config import settings

class EvidenceBuilder:
    """
    Builds composite high-resolution evidence images containing:
    1. Full annotated scene frame with bounding boxes.
    2. Magnified crop of Rider / Driver violation region.
    3. Magnified crop of Number Plate.
    4. Structured official metadata header & footer (Date, Time, Location, Plate, Violation Type, Confidence).
    """
    def __init__(self, output_dir=settings.EVIDENCE_DIR):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_evidence_image(self, frame, vehicle_track_id, vehicle_type, vehicle_box,
                                violation_type, violation_box, plate_text, plate_box,
                                confidence, location="Sector 4 - Traffic Junction A"):
        """
        Creates and saves a composite evidence image.
        Returns:
            evidence_filename (str), timestamp_date (str), timestamp_time (str)
        """
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")
        timestamp_slug = now.strftime("%Y%m%d_%H%M%S")
        filename = f"violation_{vehicle_track_id}_{timestamp_slug}_{int(time.time()*1000)%1000}.jpg"
        save_path = self.output_dir / filename

        annotated_frame = frame.copy()
        h, w = frame.shape[:2]

        # 1. Draw vehicle bounding box (Cyan / Yellow)
        vx1, vy1, vx2, vy2 = [int(v) for v in vehicle_box]
        cv2.rectangle(annotated_frame, (vx1, vy1), (vx2, vy2), (0, 215, 255), 2)
        cv2.putText(annotated_frame, f"ID #{vehicle_track_id} {vehicle_type.upper()}",
                    (vx1, max(20, vy1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 215, 255), 2)

        # 2. Draw violation box (Red)
        if violation_box:
            bx1, by1, bx2, by2 = [int(v) for v in violation_box]
            cv2.rectangle(annotated_frame, (bx1, by1), (bx2, by2), (0, 0, 255), 2)
            cv2.putText(annotated_frame, f"! {violation_type.upper()}",
                        (bx1, max(20, by1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        # 3. Draw plate box (Green)
        if plate_box:
            px1, py1, px2, py2 = [int(v) for v in plate_box]
            cv2.rectangle(annotated_frame, (px1, py1), (px2, py2), (0, 255, 0), 2)
            cv2.putText(annotated_frame, f"PLATE: {plate_text}",
                        (px1, max(20, py1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Safe coordinate clamping helper
        def _safe_crop(box, min_w=20, min_h=15):
            if not box or len(box) < 4:
                return np.zeros((160, 240, 3), dtype=np.uint8)
            x1 = max(0, min(int(box[0]), w - 2))
            y1 = max(0, min(int(box[1]), h - 2))
            x2 = max(x1 + 1, min(int(box[2]), w))
            y2 = max(y1 + 1, min(int(box[3]), h))
            if (x2 - x1) < min_w or (y2 - y1) < min_h:
                return np.zeros((160, 240, 3), dtype=np.uint8)
            crop = frame[y1:y2, x1:x2]
            if crop.size == 0:
                return np.zeros((160, 240, 3), dtype=np.uint8)
            return cv2.resize(crop, (240, 160), interpolation=cv2.INTER_LINEAR)

        # 4. Extract safe crops for side/bottom panel
        v_crop_resized = _safe_crop(violation_box)
        p_crop_resized = _safe_crop(plate_box)

        # 5. Build Composite Evidence Canvas (800x650)
        canvas_w = 800
        canvas_h = 450 + 200  # 450px main frame + 200px bottom evidence bar
        canvas = np.zeros((canvas_h, canvas_w, 3), dtype=np.uint8)

        # Aspect-ratio preserving letterbox for main scene
        scale = min(800.0 / w, 450.0 / h)
        scaled_w = int(w * scale)
        scaled_h = int(h * scale)
        scaled_main = cv2.resize(annotated_frame, (scaled_w, scaled_h), interpolation=cv2.INTER_LINEAR)

        pad_x = (800 - scaled_w) // 2
        pad_y = (450 - scaled_h) // 2
        canvas[pad_y:pad_y + scaled_h, pad_x:pad_x + scaled_w] = scaled_main

        # Bottom section background
        cv2.rectangle(canvas, (0, 450), (800, canvas_h), (22, 27, 34), -1)
        cv2.line(canvas, (0, 450), (800, 450), (48, 54, 61), 2)

        # Paste Violation Crop
        canvas[470:630, 20:260] = v_crop_resized
        cv2.rectangle(canvas, (20, 470), (260, 630), (0, 0, 255), 2)
        cv2.putText(canvas, "VIOLATION FOCUS", (25, 465), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv2.LINE_AA)

        # Paste Plate Crop
        canvas[470:630, 280:520] = p_crop_resized
        cv2.rectangle(canvas, (280, 470), (520, 630), (0, 255, 0), 2)
        cv2.putText(canvas, "PLATE OCR FOCUS", (285, 465), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)

        # Metadata info block (Right side)
        info_x = 540
        cv2.putText(canvas, "E-VIOLATION EVIDENCE", (info_x, 480), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 215, 255), 2, cv2.LINE_AA)
        cv2.putText(canvas, f"Type:  {str(violation_type)[:26]}", (info_x, 505), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(canvas, f"Plate: {str(plate_text)[:16]}", (info_x, 528), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)
        cv2.putText(canvas, f"Track: ID #{vehicle_track_id} ({vehicle_type})", (info_x, 551), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1, cv2.LINE_AA)
        cv2.putText(canvas, f"Date:  {date_str} {time_str}", (info_x, 574), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1, cv2.LINE_AA)
        cv2.putText(canvas, f"Loc:   {str(location)[:24]}", (info_x, 597), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (200, 200, 200), 1, cv2.LINE_AA)
        cv2.putText(canvas, f"Conf:  {confidence*100:.1f}%", (info_x, 620), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (100, 255, 100), 1, cv2.LINE_AA)

        # Save image to evidence directory with optimal quality compression
        cv2.imwrite(str(save_path), canvas, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        return filename, date_str, time_str
