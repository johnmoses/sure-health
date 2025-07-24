from marshmallow import Schema, fields, validate, ValidationError

class AuditLogSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    event_type = fields.Str(required=True, validate=validate.Length(min=1))
    ip_address = fields.Str()
    timestamp = fields.DateTime(dump_only=True)
    event_metadata = fields.Dict(required=False)  # flexible JSON/dict data
