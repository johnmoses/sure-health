#!/usr/bin/env python3
"""
SureHealth API Seed Data Generator
Creates realistic healthcare data for development and testing
"""

from app import create_app
from app.extensions import db
from app.auth.models import User
from app.patients.models import Patient
from datetime import datetime, date, timedelta

def create_seed_data():
    """Generate seed data for SureHealth API"""
    
    print("🌱 Starting seed data generation...")
    
    # Create Users
    users_data = [
        {"username": "admin", "email": "admin@surehealth.com", "password": "AdminPass123!", "role": "admin"},
        {"username": "dr_smith", "email": "dr.smith@surehealth.com", "password": "DocPass123!", "role": "clinician"},
        {"username": "dr_jones", "email": "dr.jones@surehealth.com", "password": "DocPass123!", "role": "clinician"},
        {"username": "john_doe", "email": "john.doe@email.com", "password": "PatientPass123!", "role": "patient"},
        {"username": "jane_smith", "email": "jane.smith@email.com", "password": "PatientPass123!", "role": "patient"},
    ]
    
    created_users = []
    for user_data in users_data:
        existing_user = User.query.filter_by(username=user_data["username"]).first()
        if not existing_user:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                role=user_data["role"]
            )
            user.set_password(user_data["password"])
            db.session.add(user)
            created_users.append(user)
    
    db.session.commit()
    print(f"✅ Created {len(created_users)} users")
    
    # Create Patients
    patient_users = User.query.filter_by(role="patient").all()
    patients_data = [
        {
            "first_name": "John", "last_name": "Doe", "date_of_birth": date(1985, 3, 15),
            "gender": "male", "phone": "5551234567", "email": "john.doe@email.com",
            "address": "123 Main St, Anytown, ST 12345", "medical_record_number": "MRN001",
            "insurance_id": "INS001", "insurance_provider": "Blue Cross"
        },
        {
            "first_name": "Jane", "last_name": "Smith", "date_of_birth": date(1990, 7, 22),
            "gender": "female", "phone": "5552345678", "email": "jane.smith@email.com",
            "address": "456 Oak Ave, Somewhere, ST 23456", "medical_record_number": "MRN002",
            "insurance_id": "INS002", "insurance_provider": "Aetna"
        }
    ]
    
    created_patients = []
    for i, patient_data in enumerate(patients_data):
        if i < len(patient_users):
            existing_patient = Patient.query.filter_by(user_id=patient_users[i].id).first()
            if not existing_patient:
                patient = Patient(
                    user_id=patient_users[i].id,
                    **patient_data
                )
                db.session.add(patient)
                created_patients.append(patient)
    
    db.session.commit()
    print(f"✅ Created {len(created_patients)} patients")
    
    # Create Chat Rooms and Messages
    try:
        from app.chat.models import ChatRoom, ChatMessage
        
        rooms_data = [
            {"name": "General Consultation"},
            {"name": "Emergency Room"}
        ]
        
        created_rooms = []
        for room_data in rooms_data:
            existing_room = ChatRoom.query.filter_by(name=room_data["name"]).first()
            if not existing_room:
                room = ChatRoom(**room_data)
                db.session.add(room)
                created_rooms.append(room)
        
        db.session.commit()
        print(f"✅ Created {len(created_rooms)} chat rooms")
        
        # Create sample messages
        if created_rooms and patient_users:
            message = ChatMessage(
                room_id=created_rooms[0].id,
                sender_id=patient_users[0].id,
                content="Hello, I need to schedule an appointment",
                role="patient"
            )
            db.session.add(message)
            db.session.commit()
            print("✅ Created 1 sample message")
    
    except ImportError:
        print("⚠️  Chat models not found, skipping chat data")
    
    # Create Clinical Data
    try:
        from app.clinical.models import Encounter, Observation
        
        clinicians = User.query.filter_by(role="clinician").all()
        patients = Patient.query.all()
        
        if clinicians and patients:
            # Create Encounters
            encounter = Encounter(
                patient_id=patients[0].id,
                provider=clinicians[0].username,
                status="finished",
                encounter_class="outpatient",
                reason="Annual physical examination",
                period_start=datetime.utcnow() - timedelta(days=30)
            )
            db.session.add(encounter)
            db.session.commit()
            print("✅ Created 1 encounter")
            
            # Create Observations
            observation = Observation(
                patient_id=patients[0].id,
                code="blood_pressure",
                value="120/80",
                unit="mmHg",
                status="final"
            )
            db.session.add(observation)
            db.session.commit()
            print("✅ Created 1 observation")
    
    except ImportError:
        print("⚠️  Clinical models not found, skipping clinical data")
    
    # Create Medications Data
    try:
        from app.medications.models import Prescription
        
        clinicians = User.query.filter_by(role="clinician").all()
        patients = Patient.query.all()
        
        if clinicians and patients:
            prescription = Prescription(
                patient_id=patients[0].id,
                prescribed_by=clinicians[0].username,
                medication_name="Lisinopril",
                dosage="10mg",
                frequency="once daily",
                status="active",
                start_date=date.today()
            )
            db.session.add(prescription)
            db.session.commit()
            print("✅ Created 1 prescription")
    
    except ImportError:
        print("⚠️  Medication models not found, skipping prescription data")
    
    # Create Billing Data
    try:
        from app.billing.models import Invoice, Payment
        
        patients = Patient.query.all()
        if patients:
            invoice = Invoice(
                patient_id=patients[0].user_id,
                amount=250.00,
                status="paid",
                due_date=datetime.combine(date.today() + timedelta(days=30), datetime.min.time())
            )
            db.session.add(invoice)
            db.session.commit()
            print("✅ Created 1 invoice")
    
    except ImportError:
        print("⚠️  Billing models not found, skipping billing data")
    
    # Seed RAG/Vector Database
    try:
        from app.extensions import insert_documents
        
        medical_documents = [
            {
                "text": "Hypertension is a common condition where blood pressure is consistently elevated above 140/90 mmHg.",
                "subject": "cardiology"
            },
            {
                "text": "Type 2 diabetes is managed through diet, exercise, and medications like metformin.",
                "subject": "endocrinology"
            },
            {
                "text": "Annual physical examinations should include vital signs, BMI calculation, and age-appropriate screenings.",
                "subject": "preventive"
            }
        ]
        
        insert_documents(medical_documents)
        print(f"✅ Inserted {len(medical_documents)} documents into vector database")
    
    except Exception as e:
        print(f"⚠️  Could not seed vector database: {e}")
    
    print("🎉 Seed data generation completed successfully!")
    print("\n🔑 Test Credentials:")
    print("   Admin: admin / AdminPass123!")
    print("   Doctor: dr_smith / DocPass123!")
    print("   Patient: john_doe / PatientPass123!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        create_seed_data()