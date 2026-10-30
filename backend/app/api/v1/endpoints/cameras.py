from flask import Blueprint, request, jsonify
from backend.app.services.camera_service import CameraService

cameras_router = Blueprint('cameras_v1', __name__)

@cameras_router.route('/', methods=['GET'])
@cameras_router.route('', methods=['GET'])
def get_cameras():
    return jsonify({"success": True, "data": CameraService.list_cameras()})

@cameras_router.route('/', methods=['POST'])
@cameras_router.route('', methods=['POST'])
def add_camera():
    data = request.get_json() or {}
    name = data.get('name')
    loc = data.get('location')
    rtsp = data.get('rtsp_url')
    if not name or not loc:
        return jsonify({"success": False, "error": "Name and location required"}), 400
    cam = CameraService.register_camera(name, loc, rtsp)
    return jsonify({"success": True, "data": cam}), 201
