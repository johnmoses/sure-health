from app.extensions import db
from datetime import datetime
from app.auth.models import User  # assumes you have a User model

class MedicalRecord(db.Model):
    __tablename__ = 'medical_record'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    clinician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    record_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relationships for easier access
    patient = db.relationship('User', foreign_keys=[patient_id], backref='medical_records')
    clinician = db.relationship('User', foreign_keys=[clinician_id], backref='created_medical_records')

    lab_results = db.relationship('LabResult', back_populates='medical_record', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MedicalRecord {self.id} patient={self.patient_id} clinician={self.clinician_id} date={self.record_date}>"

class LabResult(db.Model):
    __tablename__ = 'lab_result'

    id = db.Column(db.Integer, primary_key=True)
    medical_record_id = db.Column(db.Integer, db.ForeignKey('medical_record.id'), nullable=False)
    test_name = db.Column(db.String(255), nullable=False)
    result = db.Column(db.Text, nullable=True)
    result_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    medical_record = db.relationship('MedicalRecord', back_populates='lab_results')

    def __repr__(self):
        return f"<LabResult {self.id} test={self.test_name} date={self.result_date}>"
