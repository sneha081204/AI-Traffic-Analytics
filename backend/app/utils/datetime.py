from datetime import datetime

def get_current_date_str() -> str:
    """Returns current date formatted as YYYY-MM-DD."""
    return datetime.now().strftime("%Y-%m-%d")

def get_current_time_str() -> str:
    """Returns current time formatted as HH:MM:SS."""
    return datetime.now().strftime("%H:%M:%S")

def get_iso_timestamp() -> str:
    """Returns current ISO formatted UTC timestamp."""
    return datetime.utcnow().isoformat()
