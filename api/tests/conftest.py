import pytest
from app import create_app
from app.extensions import db
from app.auth.models import User
from app.patients.models import Patient
from datetime import date

@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    app.config['SECRET_KEY'] = 'test-secret'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    """Create authenticated user and return auth headers"""
    # Create test user
    user = User(username='testuser', email='test@example.com', role='user')
    user.set_password('testpass')
    db.session.add(user)
    db.session.commit()
    
    # Login and get token
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def sample_patient():
    """Create sample patient data"""
    return {
        'first_name': 'John',
        'last_name': 'Doe',
        'date_of_birth': '1990-01-01',
        'gender': 'male',
        'phone': '555-0123',
        'email': 'john.doe@example.com'
    }