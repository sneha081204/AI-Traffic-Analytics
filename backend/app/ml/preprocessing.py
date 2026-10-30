import cv2
import numpy as np

def resize_and_pad(image, target_size=(640, 640)):
    """Preprocesses input image frames for neural network inference."""
    h, w = image.shape[:2]
    scale = min(target_size[0] / h, target_size[1] / w)
    nh, nw = int(h * scale), int(w * scale)
    resized = cv2.resize(image, (nw, nh), interpolation=cv2.INTER_LINEAR)
    canvas = np.full((target_size[0], target_size[1], 3), 114, dtype=np.uint8)
    canvas[(target_size[0]-nh)//2:(target_size[0]-nh)//2+nh, (target_size[1]-nw)//2:(target_size[1]-nw)//2+nw] = resized
    return canvas, scale

def enhance_windshield_contrast(crop_bgr):
    """CLAHE contrast equalizer for tinted car windshields."""
    lab = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    return cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)
