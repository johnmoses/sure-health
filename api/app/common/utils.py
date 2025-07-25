import uuid
from datetime import datetime

def generate_fhir_id():
    """Generate a UUID4 string as a FHIR resource id."""
    return str(uuid.uuid4())

def format_datetime(dt):
    """Format datetime object to ISO 8601 string or return None if dt is None."""
    if dt is None:
        return None
    return dt.isoformat()

def parse_iso8601(date_string):
    """Parse ISO 8601 string to datetime object, returns None if invalid."""
    try:
        return datetime.fromisoformat(date_string)
    except (ValueError, TypeError):
        return None

def normalize_string(s):
    """Trim strings or return None if empty."""
    if s is None:
        return None
    s = s.strip()
    return s if s else None
