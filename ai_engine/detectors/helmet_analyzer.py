import os
import cv2
import numpy as np
import torch
import torch.nn as nn
from ai_engine.core.geometry_utils import calculate_iou, get_upper_body_crop, clip_box_to_image
from ai_engine.config import AIConfig

try:
    from ai_engine.train_traffic_model import HalfHelmetCNN
except ImportError:
    class HalfHelmetCNN(nn.Module):
        def __init__(self, num_classes=3):
            super(HalfHelmetCNN, self).__init__()
            self.features = nn.Sequential(
                nn.Conv2d(3, 32, kernel_size=3, padding=1),
                nn.BatchNorm2d(32),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=2, stride=2),
                nn.Conv2d(32, 64, kernel_size=3, padding=1),
                nn.BatchNorm2d(64),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=2, stride=2),
                nn.Conv2d(64, 128, kernel_size=3, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(kernel_size=2, stride=2),
                nn.Conv2d(128, 128, kernel_size=3, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.AdaptiveAvgPool2d((4, 4))
            )
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(128 * 4 * 4, 128),
                nn.ReLU(inplace=True),
                nn.Dropout(0.35),
                nn.Linear(128, num_classes)
            )
        def forward(self, x):
            return self.classifier(self.features(x))


class HelmetAnalyzer:
    """
    Analyzes motorcycle riders for helmet compliance:
    1. Associates motorcycle bounding box with the rider's person bounding box.
    2. Isolates the rider's head / upper-torso region.
    3. Employs a dedicated PyTorch Deep Neural Classifier (HalfHelmetCNN) alongside
       optical chin-bar & dual-color skin spatial decomposition.
    4. Detects:
       - 'Full-face helmet' (BIS certified IS 4151 compliant with continuous rigid chin bar)
       - 'Wearing non-standard / half helmet' (Cap helmet, open face, chin-exposed helmet - Section 129 / 194D)
       - 'No helmet' / 'Riding without a helmet' (Bare head)
    """
    def __init__(self, conf_thresh=AIConfig.HELMET_CONF_THRESH):
        self.conf_thresh = conf_thresh
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self._load_classifier()

    def _load_classifier(self):
        """Loads the trained Half-Helmet deep learning model checkpoint."""
        possible_paths = [
            os.path.join(os.getcwd(), "ai_engine", "weights", "half_helmet_model.pt"),
            os.path.join(os.getcwd(), "ai_engine", "weights", "best.pt"),
            os.path.join(os.path.dirname(__file__), "..", "weights", "half_helmet_model.pt"),
            os.path.join(os.path.dirname(__file__), "..", "weights", "best.pt")
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    checkpoint = torch.load(p, map_location=self.device)
                    model = HalfHelmetCNN(num_classes=3).to(self.device)
                    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                        model.load_state_dict(checkpoint["model_state_dict"])
                    else:
                        model.load_state_dict(checkpoint)
                    model.eval()
                    self.model = model
                    print(f"[HelmetAnalyzer] Successfully loaded trained HalfHelmetCNN weights from '{p}'")
                    break
                except Exception as e:
                    print(f"[HelmetAnalyzer] Warning loading weights from '{p}': {e}")

    def associate_rider_to_motorcycle(self, motorcycle_bbox, person_detections):
        """
        Finds the person riding this specific motorcycle based on vertical alignment and IoU overlap.
        """
        mx1, my1, mx2, my2 = motorcycle_bbox
        best_rider = None
        max_overlap = 0.0

        for person in person_detections:
            px1, py1, px2, py2 = person['bbox']
            
            p_center_x = (px1 + px2) / 2
            if mx1 <= p_center_x <= mx2:
                overlap_iou = calculate_iou(motorcycle_bbox, person['bbox'])
                if py1 < my2 and py2 > my1:
                    overlap_metric = overlap_iou + 0.5 * (1.0 if py1 < my1 else 0.2)
                    if overlap_metric > max_overlap:
                        max_overlap = overlap_metric
                        best_rider = person

        return best_rider

    def _predict_neural_classifier(self, head_crop):
        """Runs the trained HalfHelmetCNN model on the isolated head crop."""
        if self.model is None or head_crop.size == 0:
            return None

        try:
            # Preprocess: convert BGR to RGB, resize to 64x64, normalize to [0, 1]
            rgb = cv2.cvtColor(head_crop, cv2.COLOR_BGR2RGB)
            resized = cv2.resize(rgb, (64, 64)).astype(np.float32) / 255.0
            tensor = torch.tensor(resized).permute(2, 0, 1).unsqueeze(0).to(self.device)

            with torch.no_grad():
                logits = self.model(tensor)
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
                # probs: [0: Full-face, 1: Half-helmet, 2: No-helmet]
                return probs
        except Exception as e:
            return None

    def analyze_rider_helmet(self, frame, rider_bbox):
        """
        Analyzes the head area of the rider to determine helmet status.
        Combines the trained HalfHelmetCNN model with dual-color space (YCrCb + HSV)
        and rigid chin bar spatial continuity forensics.

        Returns:
            status: 'Full-face helmet' | 'Wearing non-standard / half helmet' | 'No helmet' | 'Uncertain'
            is_violation: bool
            violation_type: str or None
            head_crop_bbox: [x1, y1, x2, y2]
            confidence: float
        """
        h, w = frame.shape[:2]
        rx1, ry1, rx2, ry2 = rider_bbox
        rw = max(1, rx2 - rx1)
        rh = max(1, ry2 - ry1)
        # Determine head crop from rider bbox
        if (rh / rw) >= 1.2:
            # Upright sitting or standing rider
            head_box = [rx1, ry1, rx2, ry1 + int(rh * 0.38)]
        elif (rh / rw) >= 0.85:
            # Slight forward lean or medium crop
            head_box = [rx1, ry1, rx1 + int(rw * 0.75), ry1 + int(rh * 0.55)]
        else:
            # Horizontal profile / close-up portrait of leaning rider
            head_box = [rx1, ry1, rx1 + int(rw * 0.65), ry1 + int(rh * 0.68)]
        head_box = clip_box_to_image(head_box, w, h)
        
        hx1, hy1, hx2, hy2 = head_box
        if (hx2 - hx1) < 12 or (hy2 - hy1) < 12:
            return "Uncertain", False, None, head_box, 0.0

        head_crop = frame[hy1:hy2, hx1:hx2]
        if head_crop.size == 0:
            return "Uncertain", False, None, head_box, 0.0

        # Run Deep Neural Half-Helmet Classifier
        neural_probs = self._predict_neural_classifier(head_crop)
        # neural_probs: [prob_full, prob_half, prob_none]

        # Optical Computer Vision Forensics
        gray_head = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray_head, cv2.CV_64F).var()

        # Dual-Color Space Skin Segmentation (Illumination-invariant YCrCb + HSV)
        ycrcb = cv2.cvtColor(head_crop, cv2.COLOR_BGR2YCrCb)
        hsv = cv2.cvtColor(head_crop, cv2.COLOR_BGR2HSV)

        skin_ycrcb = (ycrcb[:, :, 1] >= 133) & (ycrcb[:, :, 1] <= 173) & (ycrcb[:, :, 2] >= 77) & (ycrcb[:, :, 2] <= 127) & (ycrcb[:, :, 0] >= 40)
        skin_hsv = (hsv[:, :, 0] >= 0) & (hsv[:, :, 0] <= 25) & (hsv[:, :, 1] >= 25) & (hsv[:, :, 1] <= 240)
        skin_combined = skin_ycrcb & skin_hsv

        # Hair / dark tone mask
        hair_mask = (hsv[:, :, 2] <= 45) | ((hsv[:, :, 0] >= 10) & (hsv[:, :, 0] <= 30) & (hsv[:, :, 1] >= 40) & (hsv[:, :, 2] <= 70))

        # Spatial decomposition: Crown / Upper Dome (0-40%) vs Mid Face (40-65%) vs Chin/Jaw (65-100%)
        head_h = head_crop.shape[0]
        dome_split = max(1, int(head_h * 0.40))
        chin_split = max(dome_split + 1, int(head_h * 0.65))

        upper_skin = float(np.mean(skin_combined[:dome_split, :]))
        upper_hair = float(np.mean(hair_mask[:dome_split, :]))
        mid_skin = float(np.mean(skin_combined[dome_split:chin_split, :]))
        lower_skin = float(np.mean(skin_combined[chin_split:, :]))
        total_lower_skin = float(np.mean(skin_combined[dome_split:, :]))

        # Edge curvature of helmet shell
        edges = cv2.Canny(gray_head, 50, 150)
        edge_density = float(np.sum(edges > 0) / (edges.size + 1e-6))

        # Chin-bar presence analysis:
        # Full-face helmets have an opaque, continuous horizontal rigid bar at the bottom 35%
        # matching the dome shell color and low skin coverage
        chin_region = head_crop[chin_split:, :]
        chin_has_skin = lower_skin > 0.05
        has_rigid_chin_bar = (lower_skin <= 0.04) and (total_lower_skin <= 0.06)

        has_neural_helmet = (neural_probs is not None) and (neural_probs[0] + neural_probs[1] >= 0.50)
        has_neural_no_helmet = (neural_probs is not None) and (neural_probs[2] >= 0.55)

        # 1. BARE HEAD / NO HELMET VIOLATION
        if has_neural_no_helmet:
            return "No helmet", True, "Riding without a helmet", head_box, round(float(neural_probs[2]), 2)

        if not has_neural_helmet and ((upper_skin > 0.18) or (upper_hair > 0.35 and edge_density < 0.12)):
            conf = 0.94 if neural_probs is None else round(max(0.92, float(neural_probs[2])), 2)
            return "No helmet", True, "Riding without a helmet", head_box, conf

        # 2. HALF HELMET / CAP HELMET / OPEN FACE (Section 129 / 194D)
        # Deep Neural Classifier confirms half-helmet OR optical chin bar is missing
        if neural_probs is not None and neural_probs[1] >= 0.35:
            conf = round(max(0.88, float(neural_probs[1])), 2)
            return "Wearing non-standard / half helmet", True, "Wearing non-standard / half helmet", head_box, conf

        # Crown has helmet coverage, but lower face/jaw/chin lacks rigid chin bar
        if (has_neural_helmet or upper_skin < 0.12) and (not has_rigid_chin_bar or chin_has_skin or total_lower_skin > 0.05):
            return "Wearing non-standard / half helmet", True, "Wearing non-standard / half helmet", head_box, 0.95

        # 3. FULL-FACE BIS CERTIFIED HELMET (Compliant)
        if (has_neural_helmet or upper_skin < 0.10) and has_rigid_chin_bar and lower_skin <= 0.03:
            conf = round(float(neural_probs[0]), 2) if neural_probs is not None else 0.94
            return "Full-face helmet", False, None, head_box, conf

        # Safeguard default for safety enforcement: non-standard headgear
        return "Wearing non-standard / half helmet", True, "Wearing non-standard / half helmet", head_box, 0.90
