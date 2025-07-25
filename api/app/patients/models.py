import uuid
from datetime import datetime
from app.extensions import db

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    fhir_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    medical_record_number = db.Column(db.String(50), unique=True)
    insurance_id = db.Column(db.String(50))
    insurance_provider = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='patient', lazy=True)
    observations = db.relationship('Observation', backref='patient', lazy=True)
    encounters = db.relationship('Encounter', backref='patient', lazy=True)
    appointments = db.relationship('Appointment', backref='patient', lazy=True)
    prescriptions = db.relationship('Prescription', backref='patient', lazy=True)
    treatment_plans = db.relationship('TreatmentPlan', backref='patient', lazy=True)
    # invoices = db.relationship('Invoice', backref='patient', lazy=True)

    def __repr__(self):
        return f"<Patient {self.id} - {self.first_name} {self.last_name}>"