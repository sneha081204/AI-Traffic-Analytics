import re

def validate_email(email: str) -> bool:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def validate_license_plate(plate: str) -> bool:
    cleaned = re.sub(r'[^A-Z0-9]', '', plate.upper())
    return len(cleaned) >= 4
