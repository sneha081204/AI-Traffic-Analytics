import re
import cv2
import numpy as np
from ai_engine.core.geometry_utils import clip_box_to_image

class PlateOCRDetector:
    """
    License Plate Localization and Optical Character Recognition (OCR) Engine.
    Uses Morphological rectangular contour extraction, Bilateral edge filtering,
    Otsu binarization, and EasyOCR engine without any hardcoded synthetic data.
    """
    def __init__(self):
        self.reader = None
        self._init_ocr()

    def _init_ocr(self):
        """Lazy load EasyOCR reader if available."""
        try:
            import easyocr
            self.reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        except Exception:
            self.reader = None

    def detect_and_read(self, frame, vehicle_bbox):
        """
        Locates plate on vehicle using morphological CV, performs OCR, and formats registration string.
        Returns:
            plate_text: str (e.g. 'KA05MN4821' or 'UNIDENTIFIED_PLATE')
            plate_bbox: [x1, y1, x2, y2]
            confidence: float
        """
        h, w = frame.shape[:2]
        vx1, vy1, vx2, vy2 = vehicle_bbox
        vw = vx2 - vx1
        vh = vy2 - vy1

        # Search zone: lower 40% of the vehicle
        search_y1 = int(vy1 + 0.50 * vh)
        search_y2 = int(vy1 + 0.98 * vh)
        search_x1 = int(vx1 + 0.10 * vw)
        search_x2 = int(vx1 + 0.90 * vw)

        search_box = clip_box_to_image([search_x1, search_y1, search_x2, search_y2], w, h)
        sx1, sy1, sx2, sy2 = search_box

        if (sx2 - sx1) < 20 or (sy2 - sy1) < 15:
            return "UNIDENTIFIED", search_box, 0.0

        vehicle_roi = frame[sy1:sy2, sx1:sx2]

        # 1. Image preprocessing for plate localization
        gray_roi = cv2.cvtColor(vehicle_roi, cv2.COLOR_BGR2GRAY)
        blur = cv2.bilateralFilter(gray_roi, 11, 17, 17)
        edged = cv2.Canny(blur, 30, 200)

        # 2. Find rectangular contours with ~2:1 to 5:1 aspect ratios (standard plate geometry)
        contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

        best_plate_crop = vehicle_roi
        final_plate_box = search_box
        found_contour = False

        for c in contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) == 4:
                rx, ry, rw, rh = cv2.boundingRect(approx)
                aspect_ratio = rw / float(rh + 1e-5)
                if 1.8 <= aspect_ratio <= 6.0 and rw > 25 and rh > 12:
                    best_plate_crop = vehicle_roi[ry:ry+rh, rx:rx+rw]
                    final_plate_box = [sx1 + rx, sy1 + ry, sx1 + rx + rw, sy1 + ry + rh]
                    found_contour = True
                    break

        # 3. Enhance Plate Crop for OCR Character Segmentation with multiple binarization methods
        plate_gray = cv2.cvtColor(best_plate_crop, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        plate_enhanced = clahe.apply(plate_gray)
        plate_denoised = cv2.bilateralFilter(plate_enhanced, 9, 75, 75)
        _, plate_thresh_otsu = cv2.threshold(plate_denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        plate_thresh_adaptive = cv2.adaptiveThreshold(plate_denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

        plate_text = ""
        conf = 0.0

        if self.reader is not None:
            try:
                # Try Otsu first, then adaptive Gaussian, then enhanced grayscale
                for test_img in (plate_thresh_otsu, plate_thresh_adaptive, best_plate_crop):
                    results = self.reader.readtext(test_img)
                    if results:
                        # 2-Line stacked plate support: group tokens by vertical line (y-center)
                        lines_grouped = []
                        for r in results:
                            box, text, score = r[0], r[1], float(r[2])
                            cy = (box[0][1] + box[2][1]) / 2.0
                            cx = (box[0][0] + box[1][0]) / 2.0
                            clean_t = re.sub(r'[^A-Z0-9]', '', text.upper())
                            if clean_t:
                                lines_grouped.append((cy, cx, clean_t, score))

                        if lines_grouped:
                            # Cluster lines vertically (threshold: 18px)
                            lines_grouped.sort(key=lambda item: item[0])
                            clustered_rows = []
                            current_row = [lines_grouped[0]]
                            for item in lines_grouped[1:]:
                                if abs(item[0] - current_row[0][0]) < 18:
                                    current_row.append(item)
                                else:
                                    clustered_rows.append(current_row)
                                    current_row = [item]
                            clustered_rows.append(current_row)

                            # Sort each row horizontally
                            full_tokens = []
                            scores = []
                            for row in clustered_rows:
                                row.sort(key=lambda item: item[1])
                                for item in row:
                                    full_tokens.append(item[2])
                                    scores.append(item[3])

                            combined_raw = "".join(full_tokens)
                            if len(combined_raw) >= 4:
                                plate_text = self._normalize_indian_plate(combined_raw)
                                conf = float(np.mean(scores))
                                break
            except Exception:
                plate_text = ""

        # Pure CV Fallback if OCR text is empty
        if not plate_text:
            plate_text = "PLATE_LOCATED" if found_contour else "UNIDENTIFIED"
            conf = 0.70 if found_contour else 0.40

        return plate_text, final_plate_box, conf

    @staticmethod
    def _normalize_indian_plate(raw: str) -> str:
        """
        Applies optical character normalization for standard Indian motor vehicle plates
        [State Code 2 letters][District 2 digits][Series 1-2 letters][Unique 4 digits].
        """
        raw = re.sub(r'[^A-Z0-9]', '', raw.upper())
        if len(raw) < 4:
            return raw

        char_to_digit = {'O': '0', 'I': '1', 'Z': '2', 'S': '5', 'B': '8', 'G': '6'}
        digit_to_char = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B'}

        # Fix State Code (first 2 chars must be letters)
        p1 = raw[0]
        p2 = raw[1]
        p1 = digit_to_char.get(p1, p1)
        p2 = digit_to_char.get(p2, p2)
        rest = raw[2:]

        # Fix District (next 1-2 chars should be digits)
        dist = ""
        idx = 0
        while idx < min(2, len(rest)) and (rest[idx].isdigit() or rest[idx] in char_to_digit):
            dist += char_to_digit.get(rest[idx], rest[idx])
            idx += 1
        rest = rest[idx:]

        # Normalize series and tail digits
        if len(rest) > 0:
            split_idx = len(rest)
            while split_idx > 0 and (len(rest) - split_idx) < 4:
                ch = rest[split_idx - 1]
                if ch.isdigit() or ch in char_to_digit:
                    split_idx -= 1
                else:
                    break

            series_part = rest[:split_idx]
            num_part = rest[split_idx:]

            series_fixed = "".join(digit_to_char.get(c, c) for c in series_part)
            num_fixed = "".join(char_to_digit.get(c, c) for c in num_part)

            return f"{p1}{p2}{dist}{series_fixed}{num_fixed}"

        return f"{p1}{p2}{dist}"
