from app.extensions import ma
from app.auth.models import User
from .models import ChatRoom, ChatMessage
from marshmallow import fields, validate

class ChatMessageSchema(ma.SQLAlchemyAutoSchema):
    timestamp = fields.DateTime(format='iso')
    role = fields.String(validate=validate.OneOf(['clinician', 'patient', 'bot']), required=True)
    sender_username = fields.Method('get_sender_username', dump_only=True)

    def get_sender_username(self, obj):
        if not obj.sender_id:
            return None
        user = User.query.get(obj.sender_id)
        return user.username if user else None

    class Meta:
        model = ChatMessage
        load_instance = True
        include_fk = True

class ChatRoomSchema(ma.SQLAlchemyAutoSchema):
    messages = fields.Nested(ChatMessageSchema, many=True, dump_only=True)

    class Meta:
        model = ChatRoom
        load_instance = True
