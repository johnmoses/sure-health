from datetime import datetime
from app.extensions import db
from sqlalchemy.sql import func

class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    clinician_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(256), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="scheduled")  # scheduled, canceled, completed, etc.
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    # Relationships (optional, ensure User model exists)
    patient = db.relationship("User", foreign_keys=[patient_id])
    clinician = db.relationship("User", foreign_keys=[clinician_id])

    def __repr__(self):
        return f"<Appointment {self.id} patient={self.patient_id} clinician={self.clinician_id} at={self.scheduled_time}>"
