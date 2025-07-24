from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON  # Use this if you're on Postgres

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    event_type = db.Column(db.String(255), nullable=False)  # e.g., 'login', 'page_view', 'button_click'
    ip_address = db.Column(db.String(45))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    event_metadata = db.Column(JSON, nullable=True)  # JSON metadata like page URL, button name, etc.
