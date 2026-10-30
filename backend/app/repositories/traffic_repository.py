from backend.app.core.database import db
from backend.app.models.traffic import Violation
from datetime import datetime

class TrafficRepository:
    """Repository handling database operations for Violations."""

    # Thread-safe in-memory cache of confirmed tracks in current stream session
    _confirmed_track_ids = set()

    @classmethod
    def exists_for_track_id(cls, vehicle_track_id) -> bool:
        """Checks if a violation record has already been persisted for this track ID."""
        if not vehicle_track_id:
            return False
        if vehicle_track_id in cls._confirmed_track_ids:
            return True
        return False

    @classmethod
    def reset_track_session(cls):
        """Clears stream session confirmed tracks when a new video/stream starts."""
        cls._confirmed_track_ids.clear()

    @classmethod
    def create_violation(cls, vehicle_track_id, vehicle_type, vehicle_number, violation_type,
                         helmet_type, confidence, date_str, time_str, location, evidence_image,
                         vehicle_make_model=None, vehicle_color=None, violation_details=None,
                         applicable_law=None, recommended_fine=None):
        import uuid
        
        # Deduplication check
        if vehicle_track_id and vehicle_track_id in cls._confirmed_track_ids:
            return None

        v_id = f"VIO-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        fine_val = 1000
        if recommended_fine:
            try:
                fine_val = int(''.join(filter(str.isdigit, str(recommended_fine))))
            except Exception:
                fine_val = 1000

        # Look up statutory rule fine and legal section if available
        from backend.app.models.traffic import ViolationRule
        rule = ViolationRule.query.filter_by(name=violation_type).first()
        if rule:
            fine_val = rule.fine
            if not applicable_law:
                applicable_law = rule.rule_section

        violation = Violation(
            id=v_id,
            challan_no=f"ECH-{datetime.now().strftime('%Y%m%d')}-{v_id.split('-')[-1]}",
            vehicle_type=vehicle_type or "Four Wheeler",
            vehicle_number=vehicle_number or "UNKNOWN",
            violation_type=violation_type or "Traffic Violation",
            rule_section=applicable_law or "Section 177 Motor Vehicles Act",
            fine_amount=fine_val,
            confidence=confidence or 0.95,
            date=date_str or datetime.now().strftime("%d %b %Y"),
            time=time_str or datetime.now().strftime("%I:%M %p"),
            location=location or "Sector 4 Highway Corridor",
            evidence_url=evidence_image or "",
            forensics=violation_details or f"AI vision confirmed {violation_type} violation via multi-frame tracking.",
            status="Verified",
            payment_status="Pending"
        )
        try:
            db.session.add(violation)
            db.session.commit()
            if vehicle_track_id:
                cls._confirmed_track_ids.add(vehicle_track_id)
            return violation
        except Exception as err:
            db.session.rollback()
            from backend.app.core.logging import logger
            logger.error(f"[TrafficRepository] Commit error: {err}")
            return None


    @staticmethod
    def get_all(violation_type=None, search=None, limit=50, offset=0):
        query = Violation.query.order_by(Violation.id.desc())
        if violation_type and violation_type.lower() != 'all':
            query = query.filter(Violation.violation_type.ilike(f"%{violation_type}%"))
        if search:
            query = query.filter(
                (Violation.vehicle_number.ilike(f"%{search}%")) |
                (Violation.location.ilike(f"%{search}%")) |
                (Violation.vehicle_make_model.ilike(f"%{search}%"))
            )
        total = query.count()
        records = query.offset(offset).limit(limit).all()
        return [r.to_dict() for r in records], total

    @staticmethod
    def get_by_id(violation_id: int):
        record = Violation.query.get(violation_id)
        return record.to_dict() if record else None

    @staticmethod
    def get_stats():
        total_violations = Violation.query.count()
        no_helmet = Violation.query.filter_by(violation_type="No Helmet").count()
        invalid_helmet = Violation.query.filter_by(violation_type="Invalid Helmet").count()
        no_seatbelt = Violation.query.filter_by(violation_type="No Seatbelt").count()
        motorcycle_violations = Violation.query.filter(Violation.vehicle_type.ilike("%motorcycle%")).count()
        car_violations = Violation.query.filter(Violation.vehicle_type.ilike("%car%")).count()

        return {
            "total_violations": total_violations,
            "no_helmet": no_helmet,
            "invalid_helmet": invalid_helmet,
            "no_seatbelt": no_seatbelt,
            "motorcycle_violations": motorcycle_violations,
            "car_violations": car_violations
        }
