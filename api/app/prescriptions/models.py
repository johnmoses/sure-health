from datetime import datetime
from app.extensions import db
from sqlalchemy.sql import func
from app.auth.models import User  # assuming User model here

class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    clinician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    medication_name = db.Column(db.String(150), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.String(100), nullable=True)  # e.g. 'twice a day'
    duration = db.Column(db.String(100), nullable=True)  # e.g. '7 days'
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    patient = db.relationship('User', foreign_keys=[patient_id])
    clinician = db.relationship('User', foreign_keys=[clinician_id])

    def __repr__(self):
        return f"<Prescription {self.id} for patient {self.patient_id} prescribed by clinician {self.clinician_id}>"
