from app.extensions import db
from datetime import datetime

class Prescription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    clinician_id = db.Column(db.Integer, nullable=False)
    medication = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(255), nullable=False)
    instructions = db.Column(db.Text)
    date_issued = db.Column(db.DateTime, default=datetime.utcnow)
    date_renewed = db.Column(db.DateTime)
