import numpy as np
from ai_engine.core.geometry_utils import calculate_iou

class TrackedVehicle:
    """Represents a tracked vehicle entity with trajectory history, velocity vector, and state."""
    def __init__(self, track_id, bbox, cls_name, score):
        self.track_id = track_id
        self.bbox = bbox  # [x1, y1, x2, y2]
        self.cls_name = cls_name
        self.score = score
        self.age = 1
        self.hits = 1
        self.time_since_update = 0
        self.history = [bbox]
        self.velocity = (0, 0)  # (dx, dy) per frame
        self.violation_candidates = []  # list of violation votes
        self.is_violation_confirmed = False
        self.confirmed_violation_type = None

    def update(self, bbox, score):
        # Calculate velocity vector before smoothing
        prev_cx = (self.bbox[0] + self.bbox[2]) / 2.0
        prev_cy = (self.bbox[1] + self.bbox[3]) / 2.0
        new_cx = (bbox[0] + bbox[2]) / 2.0
        new_cy = (bbox[1] + bbox[3]) / 2.0
        self.velocity = (round(new_cx - prev_cx, 1), round(new_cy - prev_cy, 1))

        # Exponential Moving Average (EMA) box smoothing to eliminate jitter across frames
        alpha = 0.70
        smoothed = [
            int(alpha * n + (1.0 - alpha) * o)
            for n, o in zip(bbox, self.bbox)
        ]
        self.bbox = smoothed
        self.score = score
        self.hits += 1
        self.time_since_update = 0
        self.history.append(self.bbox)
        if len(self.history) > 30:
            self.history.pop(0)

    def mark_missed(self):
        self.time_since_update += 1
        self.age += 1


class ByteTrackTracker:
    """
    ByteTrack Multi-Object Tracking Engine.
    Associates high & low confidence detections in two distinct stages using IoU matching.
    Stage 1: Associates high-confidence detections with active tracks.
    Stage 2: Associates remaining unmatched tracks with low-confidence detections to recover occluded objects.
    """
    def __init__(self, high_score_thresh=0.50, iou_threshold=0.35, iou_threshold_low=0.25, max_age=30):
        self.high_score_thresh = high_score_thresh
        self.iou_threshold = iou_threshold
        self.iou_threshold_low = iou_threshold_low
        self.max_age = max_age
        self.tracks = {}
        self.next_id = 1

    def _match_boxes(self, track_indices, det_boxes, iou_thresh):
        """Helper to match a subset of tracks against detection boxes via IoU cost matrix."""
        if not det_boxes:
            return {}, list(track_indices), []
        if not track_indices:
            return {}, [], list(range(len(det_boxes)))

        track_ids = list(self.tracks.keys())
        sub_track_ids = [track_ids[idx] for idx in track_indices]
        t_boxes = [self.tracks[tid].bbox for tid in sub_track_ids]

        iou_matrix = np.zeros((len(t_boxes), len(det_boxes)), dtype=np.float32)
        for i, tbox in enumerate(t_boxes):
            for j, dbox in enumerate(det_boxes):
                iou_matrix[i, j] = calculate_iou(tbox, dbox)

        matched_tracks = set()
        matched_dets = set()
        matches = {}

        while True:
            max_iou = np.max(iou_matrix) if iou_matrix.size > 0 else 0
            if max_iou < iou_thresh:
                break
            i, j = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
            if i in matched_tracks or j in matched_dets:
                iou_matrix[i, j] = 0
                continue

            tid = sub_track_ids[i]
            orig_t_idx = track_indices[i]
            matches[orig_t_idx] = j
            matched_tracks.add(i)
            matched_dets.add(j)
            iou_matrix[i, :] = 0
            iou_matrix[:, j] = 0

        unmatched_track_indices = [track_indices[i] for i in range(len(sub_track_ids)) if i not in matched_tracks]
        unmatched_det_indices = [j for j in range(len(det_boxes)) if j not in matched_dets]

        return matches, unmatched_track_indices, unmatched_det_indices

    def update(self, detections):
        """
        detections: list of dicts: [{'bbox': [x1,y1,x2,y2], 'class': 'motorcycle', 'score': 0.85}, ...]
        Returns active tracked entities for the current frame.
        """
        if not detections:
            for track in self.tracks.values():
                track.mark_missed()
            self._cleanup()
            return list(self.tracks.values())

        # Partition detections into high-confidence and low-confidence
        high_dets = [d for d in detections if d.get('score', 0) >= self.high_score_thresh]
        low_dets = [d for d in detections if d.get('score', 0) < self.high_score_thresh and d.get('score', 0) >= 0.20]

        track_ids = list(self.tracks.keys())
        all_track_indices = list(range(len(track_ids)))

        # Stage 1: Match existing tracks with high-confidence detections
        high_boxes = [d['bbox'] for d in high_dets]
        matches1, unmatched_tracks1, unmatched_high_dets = self._match_boxes(
            all_track_indices, high_boxes, self.iou_threshold
        )

        for t_idx, d_idx in matches1.items():
            tid = track_ids[t_idx]
            self.tracks[tid].update(high_dets[d_idx]['bbox'], high_dets[d_idx]['score'])

        # Stage 2: Match remaining unmatched tracks with low-confidence detections (recovers temporary occlusions)
        low_boxes = [d['bbox'] for d in low_dets]
        matches2, unmatched_tracks2, _ = self._match_boxes(
            unmatched_tracks1, low_boxes, self.iou_threshold_low
        )

        for t_idx, d_idx in matches2.items():
            tid = track_ids[t_idx]
            self.tracks[tid].update(low_dets[d_idx]['bbox'], low_dets[d_idx]['score'])

        # Mark tracks that failed both stages as missed
        for t_idx in unmatched_tracks2:
            tid = track_ids[t_idx]
            self.tracks[tid].mark_missed()

        # Initialize new tracks ONLY from unmatched high-confidence detections
        for j in unmatched_high_dets:
            det = high_dets[j]
            cls_name = det.get('class', det.get('cls_name', 'vehicle'))
            new_track = TrackedVehicle(
                track_id=self.next_id,
                bbox=det['bbox'],
                cls_name=cls_name,
                score=det['score']
            )
            self.tracks[self.next_id] = new_track
            self.next_id += 1

        self._cleanup()
        return [t for t in self.tracks.values() if t.time_since_update == 0]

    def _cleanup(self):
        """Remove dead tracks exceeding max_age."""
        to_remove = [tid for tid, t in self.tracks.items() if t.time_since_update > self.max_age]
        for tid in to_remove:
            del self.tracks[tid]
