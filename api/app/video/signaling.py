from app.extensions import socketio
from flask_socketio import emit, join_room

@socketio.on("join_video")
def join_video(data):
    join_room(data["room"])
    emit("status", {"msg": f"{data['username']} joined video room {data['room']}"}, room=data["room"])

@socketio.on("signal")
def handle_signal(data):
    emit("signal", data, room=data["room"], include_self=False)
