import pytest
from app import create_app, extensions

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })

    with app.app_context():
        extensions.db.create_all()
        yield app
        extensions.db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_register_and_login(client):
    # Register user
    rv = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpass',
        'role': 'patient'
    })
    assert rv.status_code == 201

    # Login user
    rv = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert rv.status_code == 200
    assert b"Login successful" in rv.data
