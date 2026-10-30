import os
from pathlib import Path
from werkzeug.utils import secure_filename
from backend.app.core.config import settings

ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

def is_allowed_video(filename: str) -> bool:
    """Check if uploaded file has a valid video extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS

def save_uploaded_video(file_obj) -> str:
    """Saves uploaded video file and returns its absolute path."""
    settings.ensure_directories()
    safe_name = secure_filename(file_obj.filename)
    dest_path = settings.UPLOAD_DIR / safe_name
    file_obj.save(str(dest_path))
    return str(dest_path)

