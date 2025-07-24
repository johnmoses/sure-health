from marshmallow import fields, validate
from app.extensions import ma
from app.prescriptions.models import Prescription

class PrescriptionSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    clinician_id = fields.Int(required=True)
    medication_name = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    dosage = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    frequency = fields.Str(validate=validate.Length(max=100))
    duration = fields.Str(validate=validate.Length(max=100))
    notes = fields.Str()
    created_at = fields.DateTime(dump_only=True, format='iso')
    updated_at = fields.DateTime(dump_only=True, format='iso')

    class Meta:
        model = Prescription
        load_instance = True
        include_fk = True
