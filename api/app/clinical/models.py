import uuid
from datetime import datetime
from app.extensions import db

class Observation(db.Model):
    __tablename__ = 'observations'
    id = db.Column(db.Integer, primary_key=True)
    fhir_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    code = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(255))
    value_type = db.Column(db.String(50))
    unit = db.Column(db.String(50))
    effective_datetime = db.Column(db.DateTime, default=datetime.utcnow)
    interpretation = db.Column(db.String(50))
    status = db.Column(db.String(50))
    issued = db.Column(db.DateTime, default=datetime.utcnow)
    performer = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Encounter(db.Model):
    __tablename__ = 'encounters'
    id = db.Column(db.Integer, primary_key=True)
    fhir_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    encounter_class = db.Column(db.String(100))
    type = db.Column(db.String(255))
    status = db.Column(db.String(100))
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime)
    location = db.Column(db.String(255))
    provider = db.Column(db.String(255))
    reason = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    fhir_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_datetime = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50))
    practitioner = db.Column(db.String(255))
    location = db.Column(db.String(255))
    reason = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
