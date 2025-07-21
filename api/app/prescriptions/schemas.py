from app.extensions import ma
from marshmallow import fields

class PrescriptionSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    clinician_id = fields.Integer(required=True)
    medication = fields.String(required=True)
    dosage = fields.String(required=True)
    instructions = fields.String(allow_none=True)
    date_issued = fields.DateTime(dump_only=True)
    date_renewed = fields.DateTime(allow_none=True, dump_only=True)
