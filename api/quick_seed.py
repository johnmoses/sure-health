#!/usr/bin/env python3
"""
Quick Seed Data - Minimal data for immediate testing
"""

from app import create_app
from app.extensions import db
from app.auth.models import User
from app.patients.models import Patient
from datetime import date

def quick_seed():
    """Create minimal seed data for immediate testing"""
    
    print("🚀 Quick seed starting...")
    
    # Essential users
    users = [
        {"username": "admin", "email": "admin@test.com", "password": "Admin123!", "role": "admin"},
        {"username": "doctor", "email": "doctor@test.com", "password": "Doctor123!", "role": "clinician"},
        {"username": "patient1", "email": "patient1@test.com", "password": "Patient123!", "role": "patient"},
    ]
    
    for user_data in users:
        if not User.query.filter_by(username=user_data["username"]).first():
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                role=user_data["role"]
            )
            user.set_password(user_data["password"])
            db.session.add(user)
    
    db.session.commit()
    
    # One test patient
    patient_user = User.query.filter_by(username="patient1").first()
    if patient_user and not Patient.query.filter_by(user_id=patient_user.id).first():
        patient = Patient(
            user_id=patient_user.id,
            first_name="Test",
            last_name="Patient",
            date_of_birth=date(1990, 1, 1),
            gender="male",
            phone="5551234567",
            email="patient1@test.com",
            medical_record_number="TEST001"
        )
        db.session.add(patient)
        db.session.commit()
    
    print("✅ Quick seed completed!")
    print("🔑 Login: patient1 / Patient123!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        quick_seed()