from marshmallow import Schema, fields, validate

class ChatRoomSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class ChatMessageSchema(Schema):
    id = fields.Int(dump_only=True)
    room_id = fields.Int(required=True)
    sender_id = fields.Int(required=True)
    content = fields.Str(required=True)
    timestamp = fields.DateTime(dump_only=True)

    role = fields.Str(
        validate=validate.OneOf(['patient', 'clinician', 'bot', 'other']),
        load_default='other'  # defaults when the field is missing
    )
    is_ai = fields.Bool(missing=False)
    message_type = fields.Str(
        validate=validate.OneOf(['text', 'image', 'system']),
        missing='text'
    )
    status = fields.Str(missing='sent')

class ChatParticipantSchema(Schema):
    id = fields.Int(dump_only=True)
    room_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    joined_at = fields.DateTime(dump_only=True)

class TelemedSessionSchema(Schema):
    id = fields.Int(dump_only=True)
    room_id = fields.Int(required=True)
    session_url = fields.Str(required=True)
    start_time = fields.DateTime(dump_only=True)
    end_time = fields.DateTime(allow_none=True)
    status = fields.Str()
