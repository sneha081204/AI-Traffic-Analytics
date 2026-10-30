import numpy as np

def calculate_iou(boxA, boxB):
    """
    Calculate Intersection over Union (IoU) of two bounding boxes.
    Format: [x1, y1, x2, y2]
    """
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interWidth = max(0, xB - xA)
    interHeight = max(0, yB - yA)
    interArea = interWidth * interHeight

    boxAArea = max(0, (boxA[2] - boxA[0])) * max(0, (boxA[3] - boxA[1]))
    boxBArea = max(0, (boxB[2] - boxB[0])) * max(0, (boxB[3] - boxB[1]))

    unionArea = boxAArea + boxBArea - interArea
    if unionArea == 0:
        return 0.0
    return interArea / unionArea

def is_point_inside_box(point, box):
    """Checks if (x, y) point is inside [x1, y1, x2, y2]."""
    x, y = point
    return box[0] <= x <= box[2] and box[1] <= y <= box[3]

def get_upper_body_crop(bbox, head_fraction=0.35):
    """
    Extracts the head/upper body region from a person bounding box [x1, y1, x2, y2].
    Crucial for rider-helmet association.
    """
    x1, y1, x2, y2 = bbox
    height = y2 - y1
    head_y2 = y1 + int(height * head_fraction)
    return [x1, y1, x2, head_y2]

def get_windshield_torso_roi(car_bbox):
    """
    Estimates the driver windshield/torso area from a car bounding box [x1, y1, x2, y2].
    Front-facing cars have windshield in upper 15%-65% and driver side in 20%-70% width.
    """
    x1, y1, x2, y2 = car_bbox
    w = x2 - x1
    h = y2 - y1
    
    # Driver area in front windshield (roughly left or right depending on driving side)
    driver_x1 = int(x1 + 0.15 * w)
    driver_x2 = int(x1 + 0.65 * w)
    driver_y1 = int(y1 + 0.15 * h)
    driver_y2 = int(y1 + 0.60 * h)
    
    return [max(0, driver_x1), max(0, driver_y1), driver_x2, driver_y2]

def clip_box_to_image(box, img_w, img_h):
    """Clips coordinates to image bounds."""
    x1 = max(0, min(int(box[0]), img_w - 1))
    y1 = max(0, min(int(box[1]), img_h - 1))
    x2 = max(0, min(int(box[2]), img_w - 1))
    y2 = max(0, min(int(box[3]), img_h - 1))
    return [x1, y1, x2, y2]
