from app.extensions import ma
from marshmallow import fields, validate

class AppointmentSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    clinician_id = fields.Integer(required=True)
    scheduled_time = fields.DateTime(required=True)
    status = fields.String(validate=validate.OneOf(["scheduled", "cancelled", "completed"]), missing="scheduled")
