import re
import numpy as np

def clean_license_plate(raw_ocr_string: str) -> str:
    """Sanitizes OCR text tokens into standardized registration formats."""
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_ocr_string.upper())
    return cleaned if len(cleaned) >= 4 else "UNIDENTIFIED"

def filter_non_max_suppression(boxes, scores, iou_thresh=0.45):
    """NMS filter for overlapping candidate bounding boxes."""
    if len(boxes) == 0:
        return []
    boxes = np.array(boxes)
    scores = np.array(scores)
    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h
        ovr = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(ovr <= iou_thresh)[0]
        order = order[inds + 1]
    return keep
