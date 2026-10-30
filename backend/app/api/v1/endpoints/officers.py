from flask import Blueprint, request, jsonify
from backend.app.core.database import db
from backend.app.models.traffic import Officer
from datetime import datetime

officers_router = Blueprint('officers_v1', __name__)

DEFAULT_OFFICERS = [
    {
        "id": "off-101",
        "name": "Inspector Vikram Singh",
        "username": "officer.vikram",
        "password": "police123",
        "badge": "TP-8421",
        "designation": "Senior Traffic Sub-Inspector",
        "department": "North Traffic Zone Directorate",
        "assigned_area": "North Zone — Sector 4 Highway Corridor",
        "phone": "+91 98765 43210",
        "status": "Active",
        "joining_date": "12-Mar-2022",
        "avatar": "VS",
        "violations_detected": 28,
        "violations_verified": 26,
        "fines_generated": 26000,
        "cases_rejected": 2,
        "last_active": "Active Now",
        "camera_active": True,
    },
    {
        "id": "off-102",
        "name": "Sub-Inspector Ananya Sharma",
        "username": "officer.ananya",
        "password": "police123",
        "badge": "TP-3194",
        "designation": "Traffic Sub-Inspector",
        "department": "Central Traffic Headquarters",
        "assigned_area": "Central Zone — Central Plaza Junction",
        "phone": "+91 98765 11223",
        "status": "Active",
        "joining_date": "05-Jan-2023",
        "avatar": "AS",
        "violations_detected": 34,
        "violations_verified": 31,
        "fines_generated": 35500,
        "cases_rejected": 3,
        "last_active": "10 mins ago",
        "camera_active": True,
    },
    {
        "id": "off-103",
        "name": "Assistant Sub-Inspector Rajesh Kumar",
        "username": "officer.rajesh",
        "password": "police123",
        "badge": "TP-5520",
        "designation": "Assistant Sub-Inspector",
        "department": "South Zone Traffic Division",
        "assigned_area": "South Zone — South Expressway Tollway",
        "phone": "+91 98765 44556",
        "status": "Active",
        "joining_date": "18-Aug-2021",
        "avatar": "RK",
        "violations_detected": 19,
        "violations_verified": 18,
        "fines_generated": 19500,
        "cases_rejected": 1,
        "last_active": "25 mins ago",
        "camera_active": False,
    },
    {
        "id": "off-104",
        "name": "Sub-Inspector Priya Patel",
        "username": "officer.priya",
        "password": "police123",
        "badge": "TP-7719",
        "designation": "Traffic Sub-Inspector",
        "department": "East Zone Highway Patrol",
        "assigned_area": "East Zone — Airport Outer Ring Road",
        "phone": "+91 98765 77889",
        "status": "Active",
        "joining_date": "10-Nov-2023",
        "avatar": "PP",
        "violations_detected": 22,
        "violations_verified": 20,
        "fines_generated": 21000,
        "cases_rejected": 2,
        "last_active": "Active Now",
        "camera_active": True,
    },
    {
        "id": "off-105",
        "name": "Inspector Mohammad Arshad",
        "username": "officer.arshad",
        "password": "police123",
        "badge": "TP-6208",
        "designation": "Senior Traffic Sub-Inspector",
        "department": "West Traffic Zone Directorate",
        "assigned_area": "West Zone — Western Tech Park Boulevard",
        "phone": "+91 98765 99001",
        "status": "Active",
        "joining_date": "14-Feb-2022",
        "avatar": "MA",
        "violations_detected": 41,
        "violations_verified": 38,
        "fines_generated": 44000,
        "cases_rejected": 3,
        "last_active": "1 hour ago",
        "camera_active": True,
    },
    {
        "id": "off-106",
        "name": "Assistant Sub-Inspector Suresh Patil",
        "username": "officer.suresh",
        "password": "police123",
        "badge": "TP-4190",
        "designation": "Assistant Sub-Inspector",
        "department": "Metropolitan Traffic Command",
        "assigned_area": "South Zone — Metro Transit Junction",
        "phone": "+91 98765 33445",
        "status": "Active",
        "joining_date": "01-Jun-2024",
        "avatar": "SP",
        "violations_detected": 16,
        "violations_verified": 15,
        "fines_generated": 16000,
        "cases_rejected": 1,
        "last_active": "3 hours ago",
        "camera_active": False,
    },
]


def ensure_seed_officers():
    """Ensure baseline police officers exist in MySQL database."""
    try:
        for o_data in DEFAULT_OFFICERS:
            exists = Officer.query.filter(
                (Officer.id == o_data["id"]) | 
                (Officer.badge == o_data["badge"]) | 
                (Officer.username == o_data["username"])
            ).first()
            if not exists:
                new_off = Officer(
                    id=o_data["id"],
                    name=o_data["name"],
                    username=o_data["username"],
                    password=o_data["password"],
                    badge=o_data["badge"],
                    designation=o_data.get("designation", "Traffic Sub-Inspector"),
                    department=o_data.get("department", "Traffic Police Directorate"),
                    assigned_area=o_data.get("assigned_area", ""),
                    phone=o_data.get("phone", "+91 98765 00000"),
                    status=o_data.get("status", "Active"),
                    joining_date=o_data.get("joining_date", "01-Jan-2023"),
                    avatar=o_data.get("avatar", "PO"),
                    violations_detected=o_data.get("violations_detected", 0),
                    violations_verified=o_data.get("violations_verified", 0),
                    fines_generated=o_data.get("fines_generated", 0),
                    cases_rejected=o_data.get("cases_rejected", 0),
                    last_active=o_data.get("last_active", "Active"),
                    camera_active=o_data.get("camera_active", True),
                )
                db.session.add(new_off)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[Officers] Seed notice: {e}")


@officers_router.route('/', methods=['GET'])
@officers_router.route('', methods=['GET'])
def get_all_officers():
    """Fetch all enrolled police officers from database."""
    ensure_seed_officers()
    officers = Officer.query.order_by(Officer.created_at.desc(), Officer.id.asc()).all()
    return jsonify({
        "success": True,
        "count": len(officers),
        "data": [o.to_dict() for o in officers]
    })


@officers_router.route('/', methods=['POST'])
@officers_router.route('', methods=['POST'])
def add_new_officer():
    """Enroll a new police officer and persist in database."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    badge = data.get('badge', '').strip()

    if not name or not badge:
        return jsonify({"success": False, "error": "Officer name and badge number are required."}), 400

    username = data.get('username', '').strip() or f"officer.{name.lower().replace(' ', '')}"
    password = data.get('password', '').strip()
    if not password:
        password = data.get('badge', '').strip() or 'TP-DEFAULT'

    try:
        # Check if officer with badge or username already exists
        existing_officer = Officer.query.filter((Officer.badge == badge) | (Officer.username == username)).first()
        if existing_officer:
            existing_officer.name = name
            existing_officer.assigned_area = data.get('assignedArea') or data.get('assigned_area', existing_officer.assigned_area)
            existing_officer.phone = data.get('phone', '').strip() or existing_officer.phone
            existing_officer.status = data.get('status', 'Active')
            db.session.commit()
            return jsonify({
                "success": True,
                "message": f"Officer {name} details updated.",
                "data": existing_officer.to_dict()
            }), 200

        officer_id = data.get('id') or f"off-{int(datetime.now().timestamp() * 1000) % 1000000:06d}"
        initials = "".join([w[0] for w in name.split()[:2]]).upper() or "PO"

        new_officer = Officer(
            id=officer_id,
            name=name,
            username=username,
            password=password,
            badge=badge,
            designation=data.get('designation', '').strip() or 'Traffic Sub-Inspector',
            department=data.get('department', '').strip() or 'Traffic Police Directorate',
            assigned_area=data.get('assignedArea') or data.get('assigned_area', ''),
            phone=data.get('phone', '').strip(),
            status=data.get('status', 'Active'),
            avatar=initials,
            joining_date=data.get('joiningDate') or datetime.now().strftime("%d-%b-%Y"),
        )
        db.session.add(new_officer)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Officer {name} registered successfully.",
            "data": new_officer.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": f"Failed to enroll officer: {str(e)}"}), 400


@officers_router.route('/<string:officer_id>', methods=['GET', 'PUT', 'PATCH', 'POST'])
def handle_officer_by_id(officer_id):
    """Get or update officer personal details, contact, and jurisdiction."""
    if request.method == 'GET':
        officer = Officer.query.get(officer_id)
        if not officer:
            return jsonify({
                "success": False,
                "error": f"Officer record '{officer_id}' not found."
            }), 404
        return jsonify({
            "success": True,
            "data": officer.to_dict()
        })

    # PUT / PATCH / POST
    data = request.get_json() or {}
    officer = Officer.query.get(officer_id)
    if not officer:
        name = data.get('name', '').strip() or 'Traffic Officer'
        initials = "".join([w[0] for w in name.split()[:2]]).upper() or "PO"
        officer = Officer(
            id=officer_id,
            name=name,
            username=data.get('username', '').strip() or f"officer.{officer_id}",
            password=data.get('password', '').strip() or officer_id,
            badge=data.get('badge', '').strip() or f"TP-{officer_id[-4:] if len(officer_id)>=4 else officer_id}",
            designation=data.get('designation', '').strip() or 'Traffic Sub-Inspector',
            department=data.get('department', '').strip() or 'Traffic Police Directorate',
            assigned_area=data.get('assignedArea') or data.get('assigned_area', ''),
            phone=data.get('phone', '').strip(),
            status=data.get('status', 'Active'),
            avatar=initials,
            joining_date=data.get('joiningDate') or datetime.now().strftime("%d-%b-%Y"),
        )
        db.session.add(officer)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Officer profile saved successfully.",
            "data": officer.to_dict()
        })

    if 'name' in data and data['name'].strip():
        officer.name = data['name'].strip()
        officer.avatar = "".join([w[0] for w in officer.name.split()[:2]]).upper() or "PO"
    if 'phone' in data:
        officer.phone = data['phone'].strip()
    if 'designation' in data:
        officer.designation = data['designation'].strip()
    if 'department' in data:
        officer.department = data['department'].strip()
    if 'assignedArea' in data:
        officer.assigned_area = data['assignedArea'].strip()
    elif 'assigned_area' in data:
        officer.assigned_area = data['assigned_area'].strip()
    if 'status' in data:
        officer.status = data['status'].strip()

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Officer {officer.name} profile updated successfully.",
        "data": officer.to_dict()
    })


@officers_router.route('/<string:officer_id>/change-password', methods=['POST'])
def change_officer_password(officer_id):
    """Verify current password and set new officer password."""
    data = request.get_json() or {}
    current_password = data.get('currentPassword', '').strip()
    new_password = data.get('newPassword', '').strip()

    if not current_password or not new_password:
        return jsonify({"success": False, "error": "Both current password and new password are required."}), 400

    if len(new_password) < 6:
        return jsonify({"success": False, "error": "New password must be at least 6 characters long."}), 400

    officer = Officer.query.get(officer_id)
    if not officer:
        return jsonify({"success": False, "error": f"Officer '{officer_id}' not found."}), 404

    if officer.password and officer.password != current_password:
        return jsonify({"success": False, "error": "Incorrect current password. Please try again."}), 400

    officer.password = new_password
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Password updated successfully."
    })


@officers_router.route('/<string:officer_id>/status', methods=['PATCH'])
def update_officer_status(officer_id):
    """Toggle officer active/offline duty status."""
    data = request.get_json() or {}
    officer = Officer.query.get(officer_id)
    if not officer:
        return jsonify({"success": False, "error": "Officer not found."}), 404

    if 'status' in data:
        officer.status = data['status']
    db.session.commit()

    return jsonify({
        "success": True,
        "data": officer.to_dict()
    })
