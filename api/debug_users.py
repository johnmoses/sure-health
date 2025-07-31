#!/usr/bin/env python3
from app import create_app
from app.auth.models import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print("Users in database:")
    for user in users:
        print(f"- {user.username} ({user.role}) - {user.email}")
    
    # Test password for patient1
    patient = User.query.filter_by(username="patient1").first()
    if patient:
        print(f"\nTesting password for {patient.username}:")
        print(f"Password 'Patient123!' works: {patient.check_password('Patient123!')}")
    else:
        print("patient1 user not found!")