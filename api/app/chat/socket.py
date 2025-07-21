from app.extensions import socketio
from flask_socketio import emit, join_room, leave_room
from app.extensions import db
from .models import Message

@socketio.on("join_room")
def on_join(data):
    join_room(data["room"])
    emit("status", {"msg": f"{data['username']} joined room"}, room=data["room"])

@socketio.on("message")
def on_message(data):
    # Save to DB (optional)
    msg = Message(
        chatroom_id=data["room"],
        sender_id=data["sender_id"],
        content=data["content"]
    )
    db.session.add(msg)
    db.session.commit()

    emit("message", {
        "sender_id": data["sender_id"],
        "content": data["content"]
    }, room=data["room"])
