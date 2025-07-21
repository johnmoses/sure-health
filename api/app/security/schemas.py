from app.extensions import ma
from marshmallow import fields

class AuditLogSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(required=True)
    action = fields.String(required=True)
    ip_address = fields.String(dump_only=True)
    timestamp = fields.DateTime(dump_only=True)
