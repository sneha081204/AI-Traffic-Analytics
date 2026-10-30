from collections import defaultdict, Counter

class TemporalViolationValidator:
    """
    Temporal Debounce and Multi-Frame Confirmation Engine.
    
    Guarantees:
    1. A violation is ONLY confirmed after N consecutive/majority positive visual votes.
    2. Enforces the strict rule: EXACTLY ONE confirmed violation record per vehicle track ID.
    """
    def __init__(self, required_confirm_frames=5, history_window=10):
        self.required_confirm_frames = required_confirm_frames
        self.history_window = history_window
        # Map: track_id -> list of {'violation_type': ..., 'confidence': ..., 'frame_idx': ...}
        self.vote_history = defaultdict(list)
        # Set of track_ids that already have a confirmed violation recorded in the DB
        self.confirmed_track_ids = set()

    def add_vote(self, track_id, violation_type, confidence, frame_idx):
        """Register a violation observation candidate for a track."""
        if track_id in self.confirmed_track_ids:
            return False  # Already finalized, do not trigger duplicate

        votes = self.vote_history[track_id]

        # Temporal continuity check: if last observation is stale (>15 frames ago), clear stale votes
        if votes and (frame_idx - votes[-1]['frame_idx'] > 15):
            votes.clear()

        votes.append({
            'violation_type': violation_type,
            'confidence': confidence,
            'frame_idx': frame_idx
        })

        if len(votes) > self.history_window:
            votes.pop(0)

        # Count votes for the specific violation type
        matching_votes = [v for v in votes if v['violation_type'] == violation_type]
        
        if len(matching_votes) >= self.required_confirm_frames:
            # Confirm violation!
            self.confirmed_track_ids.add(track_id)
            return True

        return False

    def is_already_confirmed(self, track_id):
        """Check if track ID already produced a ticket."""
        return track_id in self.confirmed_track_ids

    def get_average_confidence(self, track_id, violation_type):
        """Returns the mean confidence score of the candidate votes."""
        votes = [v['confidence'] for v in self.vote_history[track_id] if v['violation_type'] == violation_type]
        if not votes:
            return 0.85
        return float(sum(votes) / len(votes))

    def cleanup_expired_tracks(self, active_track_ids, current_frame=None, max_idle_frames=90):
        """
        Garbage collects vote history for tracks that have exited the scene,
        preventing unbounded memory growth on long-running streams.
        """
        active_set = set(active_track_ids) if active_track_ids else set()
        to_delete = []

        for tid, votes in self.vote_history.items():
            if tid not in active_set:
                if current_frame is not None and votes:
                    if (current_frame - votes[-1]['frame_idx']) > max_idle_frames:
                        to_delete.append(tid)
                else:
                    to_delete.append(tid)

        for tid in to_delete:
            del self.vote_history[tid]

    def reset(self):
        """Resets all validator state between independent video files/streams."""
        self.vote_history.clear()
        self.confirmed_track_ids.clear()
