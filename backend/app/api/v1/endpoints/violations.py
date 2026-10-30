import json
import uuid
from flask import Blueprint, request, jsonify
from backend.app.core.database import db
from backend.app.models.traffic import Violation, Officer
from datetime import datetime

violations_router = Blueprint('violations_v1', __name__)

@violations_router.route('/', methods=['GET'])
@violations_router.route('', methods=['GET'])
def get_all_violations():
    """Retrieve all traffic violation records from the database."""
    try:
        officer_name = request.args.get('officer', None)
        officer_badge = request.args.get('badge', None)
        status = request.args.get('status', None)

        query = Violation.query

        if status and status != 'ALL':
            query = query.filter_by(status=status)

        if officer_name:
            query = query.filter(
                (Violation.officer_name.ilike(f"%{officer_name}%")) |
                (Violation.officer_badge.ilike(f"%{officer_name}%"))
            )

        if officer_badge:
            query = query.filter(Violation.officer_badge == officer_badge)

        violations = query.order_by(Violation.created_at.desc()).all()

        return jsonify({
            "success": True,
            "count": len(violations),
            "data": [v.to_dict() for v in violations]
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch violations: {str(e)}"
        }), 500


@violations_router.route('/', methods=['POST'])
@violations_router.route('', methods=['POST'])
def create_violation():
    """Create a new traffic violation case with forensic metadata and persist in database."""
    try:
        data = request.get_json(silent=True) or {}

        # Ensure unique, collision-free case_id
        req_id = str(data.get('id') or '').strip()
        if req_id and not Violation.query.get(req_id):
            case_id = req_id
        else:
            v_suffix = uuid.uuid4().hex[:6].upper()
            case_id = f"VIO-{datetime.now().strftime('%Y%m%d%H%M%S')}-{v_suffix}"

        # Ensure unique, collision-free challan_no
        req_challan = str(data.get('challanNo') or '').strip()
        if req_challan and not Violation.query.filter_by(challan_no=req_challan).first():
            challan_no = req_challan
        else:
            ch_suffix = uuid.uuid4().hex[:6].upper()
            challan_no = f"ECH-{datetime.now().strftime('%Y%m%d')}-{ch_suffix}"

        # Safe parsing of fine_amount
        raw_fine = data.get('fineAmount')
        try:
            fine_amount = int(float(raw_fine)) if raw_fine not in (None, '', 'null') else 1000
        except (ValueError, TypeError):
            fine_amount = 1000

        # Safe is_manual check
        is_manual = bool(data.get('isManual') or data.get('detectionMethod') == 'Manual Officer Enforcement' or data.get('is_manual'))

        # Safe parsing of confidence
        raw_conf = data.get('confidence')
        try:
            confidence = float(raw_conf) if raw_conf not in (None, '', 'null') else (1.0 if is_manual else 0.95)
        except (ValueError, TypeError):
            confidence = 1.0 if is_manual else 0.95

        # Bounding boxes JSON parsing
        boxes_json = data.get('bounding_boxes_json')
        if not boxes_json:
            boxes = data.get('boundingBoxes') or data.get('boxes')
            if boxes:
                try:
                    boxes_json = json.dumps(boxes)
                except Exception:
                    boxes_json = None

        new_v = Violation(
            id=case_id,
            challan_no=challan_no,
            vehicle_type=data.get('vehicleType') or 'Motorcycle',
            vehicle_number=str(data.get('vehicleNumber') or 'KA01AB1234').strip().upper(),
            violation_type=data.get('violationType') or 'No Helmet',
            rule_section=data.get('ruleSection') or 'Section 177 Motor Vehicles Act',
            fine_amount=fine_amount,
            confidence=confidence,
            time=data.get('time') or datetime.now().strftime("%I:%M:%S %p"),
            date=data.get('date') or datetime.now().strftime("%d %b %Y"),
            location=data.get('location') or 'Metropolitan Traffic Division',
            officer_name=data.get('officerName') or 'Enforcement Officer',
            officer_badge=data.get('officerBadge') or 'TP-0000',
            detection_method=data.get('detectionMethod') or ('Manual Officer Enforcement' if is_manual else 'AI Live Camera Detection'),
            evidence_url=data.get('evidenceUrl') or '/storage/evidence/sample.jpg',
            status=data.get('status') or 'Verified',
            payment_status=data.get('paymentStatus') or 'Pending',
            is_manual=is_manual,
            forensics=data.get('forensics') or ('Manual officer on-site verification' if is_manual else 'AI object detection verified infraction with high confidence.'),
            bounding_boxes_json=boxes_json,
        )

        db.session.add(new_v)

        # Increment officer's detection counts in DB if officer badge matches
        try:
            officer = Officer.query.filter_by(badge=new_v.officer_badge).first()
            if officer:
                officer.violations_detected = (officer.violations_detected or 0) + 1
                if new_v.status in ['Verified', 'Fine Generated', 'Paid']:
                    officer.violations_verified = (officer.violations_verified or 0) + 1
                    officer.fines_generated = (officer.fines_generated or 0) + new_v.fine_amount
        except Exception:
            pass

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Violation case {case_id} and e-Challan {challan_no} recorded in database.",
            "data": new_v.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Failed to record violation: {str(e)}"
        }), 500


@violations_router.route('/<string:case_id>', methods=['GET'])
def get_violation_by_id(case_id):
    """Retrieve full details of a specific violation case."""
    try:
        v = Violation.query.get(case_id)
        if not v:
            return jsonify({"success": False, "error": "Case file not found."}), 404
        return jsonify({"success": True, "data": v.to_dict()})
    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to retrieve case: {str(e)}"}), 500


@violations_router.route('/<string:case_id>', methods=['PATCH'])
def update_violation(case_id):
    """Update violation status (e.g. Verify, Mark as Paid, Reject)."""
    try:
        data = request.get_json(silent=True) or {}
        v = Violation.query.get(case_id)
        if not v:
            return jsonify({"success": False, "error": "Case file not found."}), 404

        if 'vehicleNumber' in data or 'vehicle_number' in data:
            new_plate = str(data.get('vehicleNumber') or data.get('vehicle_number')).strip().upper()
            if new_plate:
                v.vehicle_number = new_plate
        if 'vehicleType' in data or 'vehicle_type' in data:
            v.vehicle_type = data.get('vehicleType') or data.get('vehicle_type')
        if 'violationType' in data or 'violation_type' in data:
            v.violation_type = data.get('violationType') or data.get('violation_type')
        if 'status' in data:
            v.status = data['status']
        if 'paymentStatus' in data:
            v.payment_status = data['paymentStatus']
        if 'fineAmount' in data:
            try:
                v.fine_amount = int(float(data['fineAmount']))
            except (ValueError, TypeError):
                pass

        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Case {case_id} status updated to {v.status}.",
            "data": v.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Failed to update violation: {str(e)}"
        }), 500


@violations_router.route('/<string:case_id>', methods=['DELETE'])
def delete_violation(case_id):
    """Delete a violation case from the database."""
    try:
        v = Violation.query.get(case_id)
        if not v:
            return jsonify({"success": False, "error": "Case file not found."}), 404

        db.session.delete(v)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Case {case_id} deleted successfully."
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"Failed to delete violation: {str(e)}"
        }), 500
