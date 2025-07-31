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
import random

def create_seed_data():
    """Generate comprehensive seed data for SureHealth API"""
    
    print("🌱 Starting seed data generation...")
    
    # Create Users
    users_data = [
        {"username": "admin", "email": "admin@surehealth.com", "password": "AdminPass123!", "role": "admin"},
        {"username": "dr_smith", "email": "dr.smith@surehealth.com", "password": "DocPass123!", "role": "clinician"},
        {"username": "dr_jones", "email": "dr.jones@surehealth.com", "password": "DocPass123!", "role": "clinician"},
        {"username": "nurse_mary", "email": "nurse.mary@surehealth.com", "password": "NursePass123!", "role": "clinician"},
        {"username": "john_doe", "email": "john.doe@email.com", "password": "PatientPass123!", "role": "patient"},
        {"username": "jane_smith", "email": "jane.smith@email.com", "password": "PatientPass123!", "role": "patient"},
        {"username": "bob_wilson", "email": "bob.wilson@email.com", "password": "PatientPass123!", "role": "patient"},
        {"username": "alice_brown", "email": "alice.brown@email.com", "password": "PatientPass123!", "role": "patient"},
        {"username": "charlie_davis", "email": "charlie.davis@email.com", "password": "PatientPass123!", "role": "patient"},
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
        },
        {
            "first_name": "Bob", "last_name": "Wilson", "date_of_birth": date(1978, 11, 8),
            "gender": "male", "phone": "5553456789", "email": "bob.wilson@email.com",
            "address": "789 Pine Rd, Elsewhere, ST 34567", "medical_record_number": "MRN003",
            "insurance_id": "INS003", "insurance_provider": "Cigna"
        },
        {
            "first_name": "Alice", "last_name": "Brown", "date_of_birth": date(1995, 2, 14),
            "gender": "female", "phone": "5554567890", "email": "alice.brown@email.com",
            "address": "321 Elm St, Nowhere, ST 45678", "medical_record_number": "MRN004",
            "insurance_id": "INS004", "insurance_provider": "UnitedHealth"
        },
        {
            "first_name": "Charlie", "last_name": "Davis", "date_of_birth": date(1982, 9, 30),
            "gender": "male", "phone": "5555678901", "email": "charlie.davis@email.com",
            "address": "654 Maple Dr, Anywhere, ST 56789", "medical_record_number": "MRN005",
            "insurance_id": "INS005", "insurance_provider": "Kaiser"
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
    
    # Create Chat Rooms
    from app.chat.models import ChatRoom, ChatMessage
    
    rooms_data = [
        {"name": "General Consultation"},
        {"name": "Cardiology Department"},
        {"name": "Emergency Room"},
        {"name": "Pediatrics"},
        {"name": "Mental Health Support"}
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
    
    # Create Sample Messages
    if created_rooms and patient_users:
        sample_messages = [
            {"content": "Hello, I need to schedule an appointment", "role": "patient"},
            {"content": "I've been experiencing chest pain", "role": "patient"},
            {"content": "When are my lab results ready?", "role": "patient"},
            {"content": "I need a prescription refill", "role": "patient"},
            {"content": "What are the side effects of my medication?", "role": "patient"}
        ]
        
        created_messages = []
        for i, msg_data in enumerate(sample_messages):
            if i < len(created_rooms) and patient_users:
                message = ChatMessage(
                    room_id=created_rooms[i].id,
                    sender_id=patient_users[0].id,
                    content=msg_data["content"],
                    role=msg_data["role"],
                    timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                )
                db.session.add(message)
                created_messages.append(message)
        
        db.session.commit()
        print(f"✅ Created {len(created_messages)} sample messages")
    
    # Create Clinical Data
    try:
        from app.clinical.models import Encounter, Observation
        
        clinicians = User.query.filter_by(role="clinician").all()
        patients = Patient.query.all()
        
        if clinicians and patients:
            # Create Encounters
            encounters_data = [
                {
                    "patient_id": patients[0].id, "provider_id": clinicians[0].id,
                    "status": "finished", "encounter_class": "outpatient",
                    "reason": "Annual physical examination", "diagnosis": "Healthy adult",
                    "period_start": datetime.utcnow() - timedelta(days=30),
                    "period_end": datetime.utcnow() - timedelta(days=30, hours=1)
                },
                {
                    "patient_id": patients[1].id, "provider_id": clinicians[1].id,
                    "status": "finished", "encounter_class": "outpatient",
                    "reason": "Chest pain evaluation", "diagnosis": "Non-cardiac chest pain",
                    "period_start": datetime.utcnow() - timedelta(days=15),
                    "period_end": datetime.utcnow() - timedelta(days=15, hours=2)
                }
            ]
            
            created_encounters = []
            for enc_data in encounters_data:
                encounter = Encounter(**enc_data)
                db.session.add(encounter)
                created_encounters.append(encounter)
            
            db.session.commit()
            print(f"✅ Created {len(created_encounters)} encounters")
            
            # Create Observations
            observations_data = [
                {
                    "patient_id": patients[0].id, "code": "blood_pressure",
                    "display": "Blood Pressure", "value": "120/80", "unit": "mmHg",
                    "effective_datetime": datetime.utcnow() - timedelta(days=30),
                    "status": "final"
                },
                {
                    "patient_id": patients[0].id, "code": "heart_rate",
                    "display": "Heart Rate", "value": "72", "unit": "bpm",
                    "effective_datetime": datetime.utcnow() - timedelta(days=30),
                    "status": "final"
                },
                {
                    "patient_id": patients[1].id, "code": "temperature",
                    "display": "Body Temperature", "value": "98.6", "unit": "°F",
                    "effective_datetime": datetime.utcnow() - timedelta(days=15),
                    "status": "final"
                }
            ]
            
            created_observations = []
            for obs_data in observations_data:
                observation = Observation(**obs_data)
                db.session.add(observation)
                created_observations.append(observation)
            
            db.session.commit()
            print(f"✅ Created {len(created_observations)} observations")
    
    except ImportError:
        print("⚠️  Clinical models not found, skipping clinical data")
    
    # Create Medications Data
    try:
        from app.medications.models import Prescription
        
        prescriptions_data = [
            {
                "patient_id": patients[0].id, "prescriber_id": clinicians[0].id,
                "medication_name": "Lisinopril", "dosage": "10mg", "frequency": "once daily",
                "quantity": 30, "refills": 5, "instructions": "Take with food",
                "prescribed_date": datetime.utcnow() - timedelta(days=30),
                "status": "active"
            },
            {
                "patient_id": patients[1].id, "prescriber_id": clinicians[1].id,
                "medication_name": "Ibuprofen", "dosage": "400mg", "frequency": "as needed",
                "quantity": 20, "refills": 2, "instructions": "Take with food for pain",
                "prescribed_date": datetime.utcnow() - timedelta(days=15),
                "status": "active"
            }
        ]
        
        created_prescriptions = []
        for presc_data in prescriptions_data:
            prescription = Prescription(**presc_data)
            db.session.add(prescription)
            created_prescriptions.append(prescription)
        
        db.session.commit()
        print(f"✅ Created {len(created_prescriptions)} prescriptions")
    
    except ImportError:
        print("⚠️  Medication models not found, skipping prescription data")
    
    # Create Billing Data
    try:
        from app.billing.models import Invoice, Payment
        
        invoices_data = [
            {
                "patient_id": patients[0].id, "amount": 250.00, "status": "paid",
                "description": "Annual physical examination", "due_date": date.today() + timedelta(days=30)
            },
            {
                "patient_id": patients[1].id, "amount": 150.00, "status": "pending",
                "description": "Chest pain consultation", "due_date": date.today() + timedelta(days=30)
            }
        ]
        
        created_invoices = []
        for inv_data in invoices_data:
            invoice = Invoice(**inv_data)
            db.session.add(invoice)
            created_invoices.append(invoice)
        
        db.session.commit()
        
        # Create Payments
        if created_invoices:
            payment = Payment(
                invoice_id=created_invoices[0].id,
                amount=250.00,
                payment_method="credit_card",
                payment_date=datetime.utcnow() - timedelta(days=5)
            )
            db.session.add(payment)
            db.session.commit()
            print(f"✅ Created {len(created_invoices)} invoices and 1 payment")
    
    except ImportError:
        print("⚠️  Billing models not found, skipping billing data")
    
    # Seed RAG/Vector Database
    try:
        from app.extensions import insert_documents
        
        medical_documents = [
            {
                "text": "Hypertension is a common condition where blood pressure is consistently elevated above 140/90 mmHg. Treatment includes lifestyle modifications and medications like ACE inhibitors.",
                "subject": "cardiology"
            },
            {
                "text": "Type 2 diabetes is managed through diet, exercise, and medications like metformin. Regular blood glucose monitoring is essential.",
                "subject": "endocrinology"
            },
            {
                "text": "Chest pain can be cardiac or non-cardiac in origin. Cardiac causes include myocardial infarction, angina, and pericarditis.",
                "subject": "emergency"
            },
            {
                "text": "Annual physical examinations should include vital signs, BMI calculation, and age-appropriate screenings.",
                "subject": "preventive"
            },
            {
                "text": "Common side effects of ACE inhibitors include dry cough, hyperkalemia, and angioedema in rare cases.",
                "subject": "pharmacology"
            }
        ]
        
        insert_documents(medical_documents)
        print(f"✅ Inserted {len(medical_documents)} documents into vector database")
    
    except Exception as e:
        print(f"⚠️  Could not seed vector database: {e}")
    
    print("🎉 Seed data generation completed successfully!")
    print("\n📋 Summary:")
    print(f"   • Users: {len(users_data)}")
    print(f"   • Patients: {len(patients_data)}")
    print(f"   • Chat Rooms: {len(rooms_data)}")
    print(f"   • Medical Documents: 5")
    print("\n🔑 Test Credentials:")
    print("   Admin: admin / AdminPass123!")
    print("   Doctor: dr_smith / DocPass123!")
    print("   Patient: john_doe / PatientPass123!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        create_seed_data()