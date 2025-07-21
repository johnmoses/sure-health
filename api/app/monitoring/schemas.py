from app.extensions import ma
from marshmallow import fields

class VitalSignSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    type = fields.String(required=True)
    value = fields.String(required=True)
    timestamp = fields.DateTime(dump_only=True)
