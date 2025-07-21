from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import ChatRoom, Message
from .schemas import ChatRoomSchema, MessageSchema
from app.extensions import db

chat_bp = Blueprint("chat", __name__)
chatroom_schema = ChatRoomSchema()
message_schema = MessageSchema()

@chat_bp.route("/rooms/<int:appointment_id>", methods=["GET"])
def get_or_create_room(appointment_id):
    room = ChatRoom.query.filter_by(appointment_id=appointment_id).first()
    if not room:
        room = ChatRoom(appointment_id=appointment_id)
        db.session.add(room)
        db.session.commit()
    return jsonify(chatroom_schema.dump(room))

@chat_bp.route("/send", methods=["POST"])
def send_message():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = message_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    msg = Message(**data)
    db.session.add(msg)
    db.session.commit()
    return jsonify(message_schema.dump(msg)), 201
