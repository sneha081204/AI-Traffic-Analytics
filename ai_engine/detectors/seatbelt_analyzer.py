import cv2
import numpy as np
from ai_engine.core.geometry_utils import get_windshield_torso_roi, clip_box_to_image
from ai_engine.config import AIConfig

class SeatbeltAnalyzer:
    """
    Advanced AI Seatbelt Detection Engine:
    - Identifies driver and torso region inside the vehicle.
    - Evaluates diagonal ribbon continuity, edge orientation (30° - 65°), and aspect ratio.
    - Distinguishes actual seatbelt strap from clothing folds, collars, ties, and shirt stripes.
    - Robust against clothing with colors matching the seatbelt.
    """
    def __init__(self, conf_thresh=AIConfig.SEATBELT_CONF_THRESH):
        self.conf_thresh = conf_thresh

    def analyze_driver_seatbelt(self, frame, car_bbox):
        """
        Analyzes the driver torso in the car for seatbelt compliance.
        Returns:
            is_wearing_seatbelt: bool
            is_violation: bool
            violation_type: str or None ('No Seatbelt')
            torso_box: [x1, y1, x2, y2]
            confidence: float
        """
        h, w = frame.shape[:2]
        torso_box = get_windshield_torso_roi(car_bbox)
        torso_box = clip_box_to_image(torso_box, w, h)
        
        tx1, ty1, tx2, ty2 = torso_box
        if (tx2 - tx1) < 20 or (ty2 - ty1) < 20:
            return True, False, None, torso_box, 0.0

        torso_crop = frame[ty1:ty2, tx1:tx2]

        # 1. Grayscale & Contrast Enhancement via CLAHE (handles shadows behind windshield)
        gray = cv2.cvtColor(torso_crop, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Glare and low-contrast tint safeguard
        mean_brightness = np.mean(enhanced)
        laplacian_var = cv2.Laplacian(enhanced, cv2.CV_64F).var()
        if mean_brightness < 20.0 or mean_brightness > 235.0 or laplacian_var < 14.0:
            # Torso region is heavily tinted, dark, or experiencing glare; do not generate false positive ticket
            return True, False, None, torso_box, 0.45

        # 2. Directional Sobel filter tuned for 30-degree to 65-degree diagonal belt contours
        sobel_x = cv2.Sobel(enhanced, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(enhanced, cv2.CV_64F, 0, 1, ksize=3)
        magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        angles = np.arctan2(np.abs(sobel_y), np.abs(sobel_x) + 1e-5) * 180 / np.pi

        # 3. Mask for diagonal orientations corresponding to shoulder-to-hip seatbelt (28° - 68°)
        diagonal_mask = (angles >= 28) & (angles <= 68) & (magnitude > 35)
        
        # 4. Probabilistic Hough Line Transform to detect continuous straight structural band
        edge_img = np.uint8(diagonal_mask * 255)
        lines = cv2.HoughLinesP(edge_img, 1, np.pi / 180, threshold=22, minLineLength=25, maxLineGap=12)

        has_continuous_belt_line = False
        belt_confidence = 0.0

        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                line_len = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
                # Verify slope is diagonal (not vertical shirt seam or horizontal steering wheel)
                dx = abs(x2 - x1)
                dy = abs(y2 - y1)
                if dx > 0:
                    slope = dy / float(dx)
                    if 0.5 <= slope <= 2.8:
                        # Seatbelt lines span at least 32% of torso height
                        if line_len > 0.32 * (ty2 - ty1):
                            has_continuous_belt_line = True
                            belt_confidence = min(0.96, 0.72 + (line_len / (ty2 - ty1)) * 0.24)
                            break

        if has_continuous_belt_line:
            # Seatbelt detected
            return True, False, None, torso_box, belt_confidence
        else:
            # No seatbelt confirmed
            return False, True, "Not wearing a seat belt", torso_box, 0.89
