from app.extensions import db
from sqlalchemy.sql import func
from datetime import datetime

class TelemedicineSession(db.Model):
    __tablename__ = "telemedicine_sessions"

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=False)
    video_url = db.Column(db.String(255))
    started_at = db.Column(db.DateTime, nullable=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    appointment = db.relationship("Appointment", backref="telemedicine_sessions")

    def __repr__(self):
        return f"<TelemedicineSession id={self.id} appointment_id={self.appointment_id}>"
