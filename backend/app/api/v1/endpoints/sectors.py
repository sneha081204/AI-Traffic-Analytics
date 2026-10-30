import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.app.core.database import db
from backend.app.models.traffic import TrafficSector, Officer

sectors_router = Blueprint('sectors', __name__)

DEFAULT_SECTORS = [
    {
        "id": "SEC-01",
        "name": "Sector 4 Highway Corridor",
        "code": "SEC-N04",
        "zone": "North Zone",
        "assigned_officer_id": "off-101",
        "assigned_officer_name": "Inspector Vikram Singh",
        "assigned_officer_badge": "TP-8421",
        "jurisdiction_area": "National Highway NH-44 Express Km 12 to 26",
        "speed_limit": 80,
        "active_cameras_count": 8,
        "congestion_level": "Moderate",
        "violation_hotspot_level": "High",
        "status": "Active",
        "patrol_frequency": "Continuous 24/7 Mobile Patrol",
        "description": "High-velocity arterial expressway connecting northern industrial logistics corridor."
    },
    {
        "id": "SEC-02",
        "name": "South Expressway Tollway",
        "code": "SEC-S02",
        "zone": "South Zone",
        "assigned_officer_id": "off-101",
        "assigned_officer_name": "Inspector Vikram Singh",
        "assigned_officer_badge": "TP-8421",
        "jurisdiction_area": "Elevated Expressway Toll Plaza Junction",
        "speed_limit": 60,
        "active_cameras_count": 12,
        "congestion_level": "Heavy",
        "violation_hotspot_level": "Critical",
        "status": "Active",
        "patrol_frequency": "Static Interceptor & Drone Monitoring",
        "description": "Major commuter artery with multi-lane toll plazas and high morning peak volume."
    },
    {
        "id": "SEC-03",
        "name": "Central Plaza Junction",
        "code": "SEC-C01",
        "zone": "Central Zone",
        "assigned_officer_id": "off-101",
        "assigned_officer_name": "Inspector Vikram Singh",
        "assigned_officer_badge": "TP-8421",
        "jurisdiction_area": "Civic Centre Metropolitan Roundabout & Flyover",
        "speed_limit": 40,
        "active_cameras_count": 10,
        "congestion_level": "Severe",
        "violation_hotspot_level": "Critical",
        "status": "High Alert",
        "patrol_frequency": "Ground Traffic Marshalling & ANPR",
        "description": "High-density downtown intersection with zebra crossings and signal junctions."
    },
    {
        "id": "SEC-04",
        "name": "Airport Outer Ring Road",
        "code": "SEC-E03",
        "zone": "East Zone",
        "assigned_officer_id": "off-104",
        "assigned_officer_name": "Constable Priya Patel",
        "assigned_officer_badge": "TP-7719",
        "jurisdiction_area": "Airport Link Ring Road, Terminal Approach 1-3",
        "speed_limit": 70,
        "active_cameras_count": 6,
        "congestion_level": "Low",
        "violation_hotspot_level": "Moderate",
        "status": "Active",
        "patrol_frequency": "Scheduled Interceptor Patrols",
        "description": "Dedicated international airport transit corridor with speed radar cameras."
    },
    {
        "id": "SEC-05",
        "name": "Western Tech Park Boulevard",
        "code": "SEC-W05",
        "zone": "West Zone",
        "assigned_officer_id": "off-101",
        "assigned_officer_name": "Inspector Vikram Singh",
        "assigned_officer_badge": "TP-8421",
        "jurisdiction_area": "IT Corridor Main Ring & Metro Station Perimeter",
        "speed_limit": 50,
        "active_cameras_count": 9,
        "congestion_level": "Heavy",
        "violation_hotspot_level": "High",
        "status": "Active",
        "patrol_frequency": "Peak Hours Ground Enforcement",
        "description": "Multi-tier tech park corridor with high motorcycle and bus commuter volume."
    }
]


def ensure_seed_sectors():
    """Ensure baseline traffic sectors exist in database on startup."""
    try:
        for s_data in DEFAULT_SECTORS:
            exists = TrafficSector.query.filter(
                (TrafficSector.id == s_data["id"]) | (TrafficSector.code == s_data["code"])
            ).first()
            if not exists:
                sec = TrafficSector(
                    id=s_data["id"],
                    name=s_data["name"],
                    code=s_data["code"],
                    zone=s_data["zone"],
                    assigned_officer_id=s_data.get("assigned_officer_id"),
                    assigned_officer_name=s_data.get("assigned_officer_name", "Enforcement Officer"),
                    assigned_officer_badge=s_data.get("assigned_officer_badge", "TP-0000"),
                    jurisdiction_area=s_data.get("jurisdiction_area", "Metropolitan Corridor"),
                    speed_limit=s_data.get("speed_limit", 60),
                    active_cameras_count=s_data.get("active_cameras_count", 6),
                    congestion_level=s_data.get("congestion_level", "Moderate"),
                    violation_hotspot_level=s_data.get("violation_hotspot_level", "Moderate"),
                    status=s_data.get("status", "Active"),
                    patrol_frequency=s_data.get("patrol_frequency", "24/7 Patrol"),
                    description=s_data.get("description", "")
                )
                db.session.add(sec)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[TrafficSectors] Seed notice: {e}")


@sectors_router.route('/', methods=['GET'])
@sectors_router.route('', methods=['GET'])
def get_sectors():
    """List all traffic sectors with optional zone or search filtering."""
    try:
        ensure_seed_sectors()
        zone_filter = request.args.get('zone')
        status_filter = request.args.get('status')
        search_query = request.args.get('search')

        query = TrafficSector.query

        if zone_filter and zone_filter.lower() != 'all':
            query = query.filter(TrafficSector.zone.ilike(f"%{zone_filter}%"))
        if status_filter and status_filter.lower() != 'all':
            query = query.filter(TrafficSector.status.ilike(f"%{status_filter}%"))
        if search_query:
            query = query.filter(
                (TrafficSector.name.ilike(f"%{search_query}%")) |
                (TrafficSector.code.ilike(f"%{search_query}%")) |
                (TrafficSector.assigned_officer_name.ilike(f"%{search_query}%")) |
                (TrafficSector.jurisdiction_area.ilike(f"%{search_query}%"))
            )

        sectors = query.order_by(TrafficSector.code.asc()).all()

        return jsonify({
            "success": True,
            "count": len(sectors),
            "data": [s.to_dict() for s in sectors]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@sectors_router.route('/stats', methods=['GET'])
def get_sector_stats():
    """Retrieve operational metrics across all traffic sectors."""
    try:
        ensure_seed_sectors()
        sectors = TrafficSector.query.all()
        total_sectors = len(sectors)
        active_sectors = len([s for s in sectors if s.status == "Active"])
        high_alert = len([s for s in sectors if s.status == "High Alert" or s.violation_hotspot_level == "Critical"])
        total_cameras = sum(s.active_cameras_count for s in sectors)
        avg_speed = round(sum(s.speed_limit for s in sectors) / max(1, total_sectors), 1)

        zone_counts = {}
        for s in sectors:
            z = s.zone or "General"
            zone_counts[z] = zone_counts.get(z, 0) + 1

        return jsonify({
            "success": True,
            "data": {
                "totalSectors": total_sectors,
                "activeSectors": active_sectors,
                "highAlertSectors": high_alert,
                "totalIntegratedCameras": total_cameras,
                "averageSpeedLimit": avg_speed,
                "zoneDistribution": zone_counts,
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@sectors_router.route('/<sector_id>', methods=['GET'])
def get_sector_by_id(sector_id):
    """Retrieve details for a single traffic sector."""
    try:
        sec = TrafficSector.query.filter((TrafficSector.id == sector_id) | (TrafficSector.code == sector_id)).first()
        if not sec:
            return jsonify({"success": False, "error": "Traffic Sector not found"}), 404
        return jsonify({"success": True, "data": sec.to_dict()}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@sectors_router.route('/', methods=['POST'])
@sectors_router.route('', methods=['POST'])
def create_sector():
    """Add a new Traffic Surveillance & Enforcement Sector."""
    try:
        data = request.get_json(silent=True) or {}
        name = data.get('name', '').strip()
        if not name:
            return jsonify({"success": False, "error": "Sector name is required."}), 400

        # Auto-generate ID and Code if not provided
        sec_id = data.get('id') or f"SEC-{uuid.uuid4().hex[:4].upper()}"
        code = data.get('code') or f"SEC-{name[:3].upper()}{uuid.uuid4().hex[:2].upper()}"

        # Officer assignment lookup
        officer_id = data.get('assignedOfficerId')
        officer_name = data.get('assignedOfficerName', 'Enforcement Officer')
        officer_badge = data.get('assignedOfficerBadge', 'TP-0000')

        if officer_id:
            officer = Officer.query.filter_by(id=officer_id).first()
            if officer:
                officer_name = officer.name
                officer_badge = officer.badge

        new_sector = TrafficSector(
            id=sec_id,
            name=name,
            code=code,
            zone=data.get('zone', 'North Zone'),
            assigned_officer_id=officer_id,
            assigned_officer_name=officer_name,
            assigned_officer_badge=officer_badge,
            jurisdiction_area=data.get('jurisdictionArea', 'Metropolitan Traffic Division'),
            speed_limit=int(data.get('speedLimit', 60)),
            active_cameras_count=int(data.get('activeCamerasCount', 4)),
            congestion_level=data.get('congestionLevel', 'Moderate'),
            violation_hotspot_level=data.get('violationHotspotLevel', 'Moderate'),
            status=data.get('status', 'Active'),
            patrol_frequency=data.get('patrolFrequency', 'Continuous 24/7 Patrol'),
            description=data.get('description', '')
        )

        db.session.add(new_sector)
        db.session.commit()

        return jsonify({
            "success": True,
            "data": new_sector.to_dict(),
            "message": f"Traffic Sector '{new_sector.name}' ({new_sector.code}) created successfully."
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sectors_router.route('/<sector_id>', methods=['PUT'])
def update_sector(sector_id):
    """Update an existing Traffic Sector."""
    try:
        sec = TrafficSector.query.filter((TrafficSector.id == sector_id) | (TrafficSector.code == sector_id)).first()
        if not sec:
            return jsonify({"success": False, "error": "Traffic Sector not found"}), 404

        data = request.get_json(silent=True) or {}
        if 'name' in data and data['name']:
            sec.name = data['name'].strip()
        if 'code' in data and data['code']:
            sec.code = data['code'].strip()
        if 'zone' in data and data['zone']:
            sec.zone = data['zone']
        if 'assignedOfficerId' in data:
            sec.assigned_officer_id = data['assignedOfficerId']
            if sec.assigned_officer_id:
                off = Officer.query.filter_by(id=sec.assigned_officer_id).first()
                if off:
                    sec.assigned_officer_name = off.name
                    sec.assigned_officer_badge = off.badge
        if 'assignedOfficerName' in data and data['assignedOfficerName']:
            sec.assigned_officer_name = data['assignedOfficerName']
        if 'assignedOfficerBadge' in data and data['assignedOfficerBadge']:
            sec.assigned_officer_badge = data['assignedOfficerBadge']
        if 'jurisdictionArea' in data and data['jurisdictionArea']:
            sec.jurisdiction_area = data['jurisdictionArea']
        if 'speedLimit' in data and data['speedLimit'] is not None:
            sec.speed_limit = int(data['speedLimit'])
        if 'activeCamerasCount' in data and data['activeCamerasCount'] is not None:
            sec.active_cameras_count = int(data['activeCamerasCount'])
        if 'congestionLevel' in data and data['congestionLevel']:
            sec.congestion_level = data['congestionLevel']
        if 'violationHotspotLevel' in data and data['violationHotspotLevel']:
            sec.violation_hotspot_level = data['violationHotspotLevel']
        if 'status' in data and data['status']:
            sec.status = data['status']
        if 'patrolFrequency' in data and data['patrolFrequency']:
            sec.patrol_frequency = data['patrolFrequency']
        if 'description' in data:
            sec.description = data['description']

        sec.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": True,
            "data": sec.to_dict(),
            "message": f"Traffic Sector '{sec.name}' updated successfully."
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


@sectors_router.route('/<sector_id>', methods=['DELETE'])
def delete_sector(sector_id):
    """Delete or decommission a Traffic Sector."""
    try:
        sec = TrafficSector.query.filter((TrafficSector.id == sector_id) | (TrafficSector.code == sector_id)).first()
        if not sec:
            return jsonify({"success": False, "error": "Traffic Sector not found"}), 404

        sector_name = sec.name
        db.session.delete(sec)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Traffic Sector '{sector_name}' has been deleted."
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
