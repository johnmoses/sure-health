from app.extensions import db
from datetime import datetime

class MedicalRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    clinician_id = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    record_date = db.Column(db.DateTime, default=datetime.utcnow)

class LabResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    medical_record_id = db.Column(db.Integer, db.ForeignKey("medical_record.id"), nullable=False)
    test_name = db.Column(db.String(255))
    result = db.Column(db.Text)
    result_date = db.Column(db.DateTime, default=datetime.utcnow)
