from app.extensions import db
from datetime import datetime

class TelemedicineSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, nullable=False)
    video_url = db.Column(db.String(255))
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
