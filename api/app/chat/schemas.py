from app.extensions import ma
from marshmallow import fields

class ChatRoomSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    appointment_id = fields.Integer(required=True)
    created_at = fields.DateTime(dump_only=True)

class MessageSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    chatroom_id = fields.Integer(required=True)
    sender_id = fields.Integer(required=True)
    content = fields.String(required=True)
    timestamp = fields.DateTime(dump_only=True)
