from marshmallow import Schema, fields

class PrescriptionSchema(Schema):
    id = fields.Int(dump_only=True)
    fhir_id = fields.Str(dump_only=True)
    patient_id = fields.Int()
    medication_name = fields.Str()
    dosage = fields.Str()
    frequency = fields.Str()
    route = fields.Str()
    status = fields.Str()
    start_date = fields.Date()
    end_date = fields.Date(allow_none=True)
    prescribed_by = fields.Str()
    notes = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class TreatmentPlanSchema(Schema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    plan_description = fields.Str(required=True)
    start_date = fields.Date(allow_none=True)
    end_date = fields.Date(allow_none=True)
    status = fields.Str()
    responsible_provider = fields.Str()
    notes = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
