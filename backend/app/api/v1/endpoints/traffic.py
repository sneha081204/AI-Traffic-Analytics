from flask import Blueprint, request, jsonify, Response
from backend.app.services.traffic_service import TrafficService
from backend.app.utils.file_manager import is_allowed_video, save_uploaded_video
from backend.app.core.config import settings
from pathlib import Path
import threading

traffic_router = Blueprint('traffic_v1', __name__)

@traffic_router.route('/violations', methods=['GET'])
def get_violations():
    v_type = request.args.get('violation_type', 'all')
    search = request.args.get('search', None)
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    result = TrafficService.get_violations(v_type, search, page, limit)
    return jsonify({"success": True, **result})

@traffic_router.route('/violations/<int:violation_id>', methods=['GET'])
def get_violation_detail(violation_id):
    v = TrafficService.get_violation_detail(violation_id)
    if not v:
        return jsonify({"success": False, "error": "Violation not found"}), 404
    return jsonify({"success": True, "data": v})

@traffic_router.route('/violations/<int:violation_id>/status', methods=['PATCH'])
def update_status(violation_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({"success": False, "error": "Missing status"}), 400
    res = TrafficService.update_violation_status(violation_id, new_status)
    if not res:
        return jsonify({"success": False, "error": "Violation not found"}), 404
    return jsonify({"success": True, "data": res})

@traffic_router.route('/violations/<int:violation_id>/ai-analyze', methods=['POST'])
def run_ai_analysis(violation_id):
    data = request.get_json() or {}
    api_key = data.get('api_key')
    updated, err = TrafficService.run_ai_forensic_analysis(violation_id, api_key)
    if err:
        return jsonify({"success": False, "error": err}), 400
    return jsonify({"success": True, "data": updated})

@traffic_router.route('/violations/<int:violation_id>/report', methods=['GET'])
def get_report(violation_id):
    report = TrafficService.generate_echallan_report(violation_id)
    if not report:
        return jsonify({"success": False, "error": "Violation not found"}), 404
    return jsonify({"success": True, "report": report})

@traffic_router.route('/video/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"success": False, "error": "No video file provided"}), 400
    file = request.files['video']
    if file.filename == '' or not is_allowed_video(file.filename):
        return jsonify({"success": False, "error": "Invalid video format"}), 400
    try:
        saved_path = save_uploaded_video(file)
        return jsonify({"success": True, "file_path": saved_path, "filename": Path(saved_path).name})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@traffic_router.route('/video/process', methods=['POST'])
def process_video():
    data = request.get_json() or {}
    video_path = data.get('video_path')
    if not video_path:
        sample_path = settings.BASE_DIR / "data" / "sample_videos" / "traffic_sample.mp4"
        if sample_path.exists():
            video_path = str(sample_path)
        else:
            return jsonify({"success": False, "error": "No video specified"}), 400

    from backend.app.ml.inference import get_shared_inference_engine
    engine = get_shared_inference_engine()

    def run_worker():
        try:
            TrafficService.update_processing_status(is_processing=True, current_file=Path(video_path).name, progress_percent=0)
            engine.process(
                video_source=video_path,
                frame_callback=TrafficService.set_latest_frame,
                status_callback=TrafficService.update_processing_status
            )
        finally:
            TrafficService.update_processing_status(is_processing=False, progress_percent=100)

    threading.Thread(target=run_worker, daemon=True).start()
    return jsonify({"success": True, "message": "Inference started", "video": Path(video_path).name})

@traffic_router.route('/video/status', methods=['GET'])
def get_status():
    return jsonify({"success": True, "data": TrafficService.get_processing_status()})

@traffic_router.route('/video/stream', methods=['GET'])
def video_stream():
    return Response(TrafficService.generate_mjpeg_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

