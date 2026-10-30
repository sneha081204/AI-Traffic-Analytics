import json
from datetime import datetime
from backend.app.core.database import db

class Officer(db.Model):
    """Police Officer Entity Model"""
    __tablename__ = 'officers'

    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password = db.Column(db.String(128), nullable=False)
    badge = db.Column(db.String(32), unique=True, nullable=False, index=True)
    designation = db.Column(db.String(64), nullable=True)
    department = db.Column(db.String(128), nullable=True)
    assigned_area = db.Column(db.String(128), nullable=True)
    phone = db.Column(db.String(32), nullable=True)
    status = db.Column(db.String(32), default="Active")
    joining_date = db.Column(db.String(32), nullable=True)
    avatar = db.Column(db.String(8), default="PO")
    violations_detected = db.Column(db.Integer, default=0)
    violations_verified = db.Column(db.Integer, default=0)
    fines_generated = db.Column(db.Integer, default=0)
    cases_rejected = db.Column(db.Integer, default=0)
    last_active = db.Column(db.String(64), nullable=True)
    camera_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "password": self.password,
            "badge": self.badge,
            "designation": self.designation,
            "department": self.department,
            "assignedArea": self.assigned_area,
            "phone": self.phone,
            "status": self.status,
            "joiningDate": self.joining_date,
            "avatar": self.avatar,
            "violationsDetected": self.violations_detected,
            "violationsVerified": self.violations_verified,
            "finesGenerated": self.fines_generated,
            "casesRejected": self.cases_rejected,
            "lastActive": self.last_active,
            "cameraActive": self.camera_active,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Violation(db.Model):
    """Traffic Violation Case File with Forensic AI Metadata"""
    __tablename__ = 'violations'

    id = db.Column(db.String(64), primary_key=True)
    challan_no = db.Column(db.String(64), nullable=True, index=True)
    vehicle_type = db.Column(db.String(64), nullable=False)
    vehicle_number = db.Column(db.String(64), nullable=False, index=True)
    violation_type = db.Column(db.String(128), nullable=False, index=True)
    rule_section = db.Column(db.String(128), default="Section 177 Motor Vehicles Act")
    fine_amount = db.Column(db.Integer, default=1000)
    confidence = db.Column(db.Float, default=0.95)
    time = db.Column(db.String(32), nullable=False)
    date = db.Column(db.String(32), nullable=False)
    location = db.Column(db.String(128), default="Metropolitan Traffic Division")
    officer_name = db.Column(db.String(128), default="Enforcement Officer")
    officer_badge = db.Column(db.String(32), default="TP-0000")
    detection_method = db.Column(db.String(64), default="AI Live Camera Detection")
    evidence_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(32), default="Verified") # Pending Verification, Verified, Fine Generated, Paid, Rejected
    payment_status = db.Column(db.String(32), default="Pending") # Pending, Paid
    is_manual = db.Column(db.Boolean, default=False)
    forensics = db.Column(db.Text, nullable=True)
    bounding_boxes_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        boxes = None
        if self.bounding_boxes_json:
            try:
                boxes = json.loads(self.bounding_boxes_json)
            except Exception:
                boxes = None

        return {
            "id": self.id,
            "challanNo": self.challan_no or f"CH-2026-{self.id.split('-')[-1] if '-' in self.id else self.id}",
            "vehicleType": self.vehicle_type,
            "vehicleNumber": self.vehicle_number,
            "violationType": self.violation_type,
            "ruleSection": self.rule_section,
            "fineAmount": self.fine_amount,
            "confidence": round(self.confidence, 3),
            "time": self.time,
            "date": self.date,
            "location": self.location,
            "officerName": self.officer_name,
            "officerBadge": self.officer_badge,
            "detectionMethod": self.detection_method,
            "evidenceUrl": self.evidence_url,
            "status": self.status,
            "paymentStatus": self.payment_status,
            "isManual": bool(self.is_manual),
            "forensics": self.forensics,
            "boundingBoxes": boxes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class ViolationRule(db.Model):
    """Configurable Statutory Rules Engine Entity"""
    __tablename__ = 'violation_rules'

    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    fine = db.Column(db.Integer, nullable=False, default=1000)
    severity = db.Column(db.String(32), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    rule_section = db.Column(db.String(128), default="Section 177 Motor Vehicles Act")
    status = db.Column(db.String(32), default="Active") # Active, Inactive

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "fine": self.fine,
            "severity": self.severity,
            "ruleSection": self.rule_section,
            "status": self.status,
        }


class AIConfigModel(db.Model):
    """Department AI Model & Thresholds Configuration"""
    __tablename__ = 'ai_configurations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    provider = db.Column(db.String(128), default="Google Gemini Vision AI (Multimodal)")
    api_key = db.Column(db.String(256), default="AIzaSyDemoSecureKey948274928374")
    model = db.Column(db.String(64), default="gemini-1.5-flash-latest")
    confidence_threshold = db.Column(db.Float, default=0.75)
    violation_threshold = db.Column(db.Float, default=0.70)
    processing_mode = db.Column(db.String(64), default="Edge + Cloud Multimodal Assist")
    enabled = db.Column(db.Boolean, default=True)
    dedup_cooldown_seconds = db.Column(db.Integer, default=30)
    last_tested = db.Column(db.String(64), default="Just now (Connected)")

    def to_dict(self):
        return {
            "provider": self.provider,
            "apiKey": self.api_key or "",
            "rawKeyConfigured": bool(self.api_key),
            "model": self.model,
            "confidenceThreshold": self.confidence_threshold,
            "violationThreshold": self.violation_threshold,
            "processingMode": self.processing_mode,
            "enabled": self.enabled,
            "dedupCooldownSeconds": self.dedup_cooldown_seconds,
            "lastTested": self.last_tested,
        }


class TrafficSector(db.Model):
    """Traffic Police Division & Surveillance Sector Entity"""
    __tablename__ = 'traffic_sectors'

    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(128), nullable=False, index=True)
    code = db.Column(db.String(32), unique=True, nullable=False, index=True)
    zone = db.Column(db.String(64), default="North Zone") # North Zone, South Zone, East Zone, West Zone, Central Zone
    assigned_officer_id = db.Column(db.String(32), nullable=True)
    assigned_officer_name = db.Column(db.String(128), default="Inspector Vikram Singh")
    assigned_officer_badge = db.Column(db.String(32), default="TP-8421")
    jurisdiction_area = db.Column(db.String(256), default="Outer Ring Highway Corridor, Km 14 to 28")
    speed_limit = db.Column(db.Integer, default=60) # km/h
    active_cameras_count = db.Column(db.Integer, default=6)
    congestion_level = db.Column(db.String(32), default="Moderate") # Low, Moderate, Heavy, Severe
    violation_hotspot_level = db.Column(db.String(32), default="High") # Low, Moderate, High, Critical
    status = db.Column(db.String(32), default="Active") # Active, Maintenance, High Alert, Restricted
    patrol_frequency = db.Column(db.String(64), default="Continuous 24/7 Patrol")
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "zone": self.zone,
            "assignedOfficerId": self.assigned_officer_id,
            "assignedOfficerName": self.assigned_officer_name,
            "assignedOfficerBadge": self.assigned_officer_badge,
            "jurisdictionArea": self.jurisdiction_area,
            "speedLimit": self.speed_limit,
            "activeCamerasCount": self.active_cameras_count,
            "congestionLevel": self.congestion_level,
            "violationHotspotLevel": self.violation_hotspot_level,
            "status": self.status,
            "patrolFrequency": self.patrol_frequency,
            "description": self.description,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
