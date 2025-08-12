import uuid
from datetime import datetime
from app.extensions import db
from sqlalchemy import Index

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    fhir_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()), nullable=False)
    first_name = db.Column(db.String(100), nullable=False, index=True)
    last_name = db.Column(db.String(100), nullable=False, index=True)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100), index=True)
    address = db.Column(db.Text)
    medical_record_number = db.Column(db.String(50), unique=True, index=True)
    insurance_id = db.Column(db.String(50))
    insurance_provider = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    user = db.relationship('User', backref='patient', lazy=True)
    observations = db.relationship('Observation', backref='patient', lazy='dynamic')
    encounters = db.relationship('Encounter', backref='patient', lazy='dynamic')
    appointments = db.relationship('Appointment', backref='patient', lazy='dynamic')
    prescriptions = db.relationship('Prescription', backref='patient', lazy='dynamic')
    treatment_plans = db.relationship('TreatmentPlan', backref='patient', lazy='dynamic')

    # Composite indexes for common queries
    __table_args__ = (
        Index('idx_patient_name', 'first_name', 'last_name'),
        Index('idx_patient_active', 'is_active', 'created_at'),
    )

    def __repr__(self):
        return f"<Patient {self.id} - {self.first_name} {self.last_name}>"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def to_dict(self):
        return {
            'id': self.id,
            'fhir_id': self.fhir_id,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'phone': self.phone,
            'email': self.email,
            'is_active': self.is_active
        }