from app.extensions import db
from datetime import datetime

class VitalSign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(100))
    value = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
