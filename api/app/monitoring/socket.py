from flask_socketio import emit, join_room
from app.extensions import socketio, db
from .models import VitalSign

@socketio.on("join_monitoring")
def join_monitoring(data):
    room = f"patient_{data['patient_id']}"
    join_room(room)

@socketio.on("vital_update")
def vital_update(data):
    vs = VitalSign(
        patient_id=data['patient_id'],
        type=data['type'],
        value=data['value']
    )
    db.session.add(vs)
    db.session.commit()
    room = f"patient_{data['patient_id']}"
    emit("new_vital", {
        "type": vs.type,
        "value": vs.value,
        "timestamp": vs.timestamp.isoformat()
    }, room=room)
