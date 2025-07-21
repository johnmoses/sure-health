from app.extensions import ma
from marshmallow import fields

class TelemedicineSessionSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    appointment_id = fields.Integer(required=True)
    video_url = fields.String(dump_only=True)
    started_at = fields.DateTime(dump_only=True)
    ended_at = fields.DateTime(dump_only=True)
