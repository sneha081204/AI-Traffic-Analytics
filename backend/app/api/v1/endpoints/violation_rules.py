from flask import Blueprint, request, jsonify
from backend.app.core.database import db
from backend.app.models.traffic import ViolationRule

rules_router = Blueprint('violation_rules_v1', __name__)

DEFAULT_RULES = [
    {"id": "VR-01", "name": "Riding without a helmet", "description": "Two-wheeler rider is not wearing a protective helmet", "fine": 1000, "severity": "HIGH", "rule_section": "Section 129 / 194D Motor Vehicles Act", "status": "Active"},
    {"id": "VR-02", "name": "Pillion rider without a helmet", "description": "Passenger on a two-wheeler is not wearing a protective helmet", "fine": 1000, "severity": "HIGH", "rule_section": "Section 129 / 194D Motor Vehicles Act", "status": "Active"},
    {"id": "VR-03", "name": "Triple riding", "description": "More than two people are riding a motorcycle or scooter", "fine": 1000, "severity": "HIGH", "rule_section": "Section 128 / 194C Motor Vehicles Act", "status": "Active"},
    {"id": "VR-04", "name": "Not wearing a seat belt", "description": "Vehicle occupant (driver or front passenger) is not wearing a safety seat belt", "fine": 1000, "severity": "MEDIUM", "rule_section": "Section 194B Motor Vehicles Act", "status": "Active"},
    {"id": "VR-05", "name": "Red-light jumping", "description": "Vehicle crosses the stop line or intersection after the signal turns red", "fine": 1000, "severity": "CRITICAL", "rule_section": "Section 184 / 119 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-06", "name": "Stop-line violation", "description": "Vehicle crosses the stop line when required to stop at junction", "fine": 500, "severity": "LOW", "rule_section": "Section 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-07", "name": "Wrong-side driving", "description": "Vehicle travels against the authorized traffic direction or one-way", "fine": 2000, "severity": "CRITICAL", "rule_section": "Section 119 / 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-08", "name": "Over-speeding", "description": "Vehicle exceeds the applicable corridor speed limit", "fine": 2000, "severity": "HIGH", "rule_section": "Section 112 / 183 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-09", "name": "Illegal parking", "description": "Vehicle is parked in a prohibited or no-parking zone obstructing flow", "fine": 500, "severity": "LOW", "rule_section": "Section 122 / 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-10", "name": "Footpath driving", "description": "Vehicle is driven on a pedestrian footpath or sidewalk", "fine": 1000, "severity": "HIGH", "rule_section": "Section 123 / 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-11", "name": "Zebra-crossing obstruction", "description": "Vehicle stops on or obstructs a pedestrian zebra crossing", "fine": 500, "severity": "LOW", "rule_section": "Section 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-12", "name": "Lane violation", "description": "Vehicle violates designated lane markings or lane discipline", "fine": 1000, "severity": "MEDIUM", "rule_section": "Section 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-13", "name": "Dangerous or zigzag driving", "description": "Vehicle exhibits reckless maneuvers or zigzag driving endangering public safety", "fine": 5000, "severity": "CRITICAL", "rule_section": "Section 184 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-14", "name": "Illegal U-turn", "description": "Vehicle makes a prohibited U-turn at restricted junction or intersection", "fine": 1000, "severity": "MEDIUM", "rule_section": "Section 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-15", "name": "No-entry violation", "description": "Vehicle enters a restricted road, one-way street, or prohibited zone", "fine": 2000, "severity": "HIGH", "rule_section": "Section 115 / 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-16", "name": "Mobile phone use while driving", "description": "Driver uses or holds a mobile phone while operating vehicle in motion", "fine": 1500, "severity": "HIGH", "rule_section": "Section 184(c) Motor Vehicles Act", "status": "Active"},
    {"id": "VR-17", "name": "Wrong overtaking", "description": "Driver overtakes in a prohibited, dangerous manner or over solid double white lines", "fine": 2000, "severity": "HIGH", "rule_section": "Section 184 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-18", "name": "Blocking an intersection", "description": "Vehicle obstructs a junction or remains stopped within a yellow box junction", "fine": 1000, "severity": "MEDIUM", "rule_section": "Section 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-19", "name": "Driving in a bus-only lane", "description": "Unauthorized vehicle enters a lane reserved for public buses or emergency vehicles", "fine": 2000, "severity": "HIGH", "rule_section": "Section 119 / 177 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-20", "name": "Unauthorised vehicle in a restricted zone", "description": "Commercial or heavy vehicle enters restricted zone during prohibited hours", "fine": 5000, "severity": "CRITICAL", "rule_section": "Section 115 / 194 Motor Vehicles Act", "status": "Active"},
    {"id": "VR-21", "name": "Wearing non-standard / half helmet", "description": "Two-wheeler rider or pillion wearing a non-standard half helmet, cap helmet, or unapproved headgear without ISI certification", "fine": 1000, "severity": "HIGH", "rule_section": "Section 129 / 194D Motor Vehicles Act", "status": "Active"},
]

@rules_router.route('/', methods=['GET'])
@rules_router.route('', methods=['GET'])
def get_rules():
    """Retrieve all configurable violation rules from database with automatic seeding for missing rules."""
    rules = ViolationRule.query.all()
    existing_ids = {r.id for r in rules}
    added_any = False

    for r_dict in DEFAULT_RULES:
        if r_dict["id"] not in existing_ids:
            r_obj = ViolationRule(
                id=r_dict["id"], name=r_dict["name"], description=r_dict["description"],
                fine=r_dict["fine"], severity=r_dict["severity"], rule_section=r_dict["rule_section"],
                status=r_dict["status"]
            )
            db.session.add(r_obj)
            added_any = True

    if added_any:
        try:
            db.session.commit()
            rules = ViolationRule.query.all()
        except Exception:
            db.session.rollback()

    return jsonify({
        "success": True,
        "count": len(rules),
        "data": [r.to_dict() for r in rules]
    })


@rules_router.route('/', methods=['POST'])
@rules_router.route('', methods=['POST'])
def add_rule():
    """Create a new violation rule in the database."""
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"success": False, "error": "Rule name is required."}), 400

    rule_id = data.get('id') or f"VR-{ViolationRule.query.count() + 1:02d}"

    new_rule = ViolationRule(
        id=rule_id,
        name=name,
        description=data.get('description', 'Statutory traffic offence'),
        fine=int(data.get('fine', 1000)),
        severity=data.get('severity', 'HIGH'),
        rule_section=data.get('ruleSection', 'Section 177 Motor Vehicles Act'),
        status=data.get('status', 'Active'),
    )

    db.session.add(new_rule)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Rule {name} added.",
        "data": new_rule.to_dict()
    }), 201


@rules_router.route('/<string:rule_id>', methods=['PATCH', 'PUT'])
def update_rule(rule_id):
    """Update rule fine, severity, or status."""
    data = request.get_json() or {}
    rule = ViolationRule.query.get(rule_id)
    if not rule:
        return jsonify({"success": False, "error": "Rule not found."}), 404

    if 'status' in data:
        rule.status = data['status']
    if 'fine' in data:
        rule.fine = int(data['fine'])
    if 'severity' in data:
        rule.severity = data['severity']
    if 'ruleSection' in data:
        rule.rule_section = data['ruleSection']

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Rule {rule.name} updated.",
        "data": rule.to_dict()
    })


@rules_router.route('/<string:rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    """Delete a violation rule from the database."""
    rule = ViolationRule.query.get(rule_id)
    if not rule:
        return jsonify({"success": False, "error": "Rule not found."}), 404

    name = rule.name
    db.session.delete(rule)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Rule {name} deleted."
    })
