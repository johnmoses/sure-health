from flask_socketio import SocketIOTestClient
import pytest
from app import create_app, extensions

@pytest.fixture
def socketio_client():
    app = create_app()
    extensions.db.create_all(app=app)
    client = SocketIOTestClient(app, extensions.socketio)
    yield client
    client.disconnect()
    extensions.db.drop_all(app=app)

def test_vital_update(socketio_client):
    socketio_client.emit('join_monitoring', {'patient_id': 1})
    socketio_client.emit('vital_update', {
        'patient_id': 1,
        'type': 'temperature',
        'value': '98.6'
    })
    received = socketio_client.get_received()
    assert any(ev['name'] == 'new_vital' for ev in received)
