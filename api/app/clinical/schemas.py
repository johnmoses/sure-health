from marshmallow import Schema, fields

class ObservationSchema(Schema):
    id = fields.Int(dump_only=True)
    fhir_id = fields.Str(dump_only=True)
    patient_id = fields.Int(required=True)
    code = fields.Str(required=True)
    value = fields.Str()
    value_type = fields.Str()
    unit = fields.Str()
    effective_datetime = fields.DateTime()
    interpretation = fields.Str()
    status = fields.Str()
    issued = fields.DateTime()
    performer = fields.Str()
    notes = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class EncounterSchema(Schema):
    id = fields.Int(dump_only=True)
    fhir_id = fields.Str(dump_only=True)
    patient_id = fields.Int(required=True)
    encounter_class = fields.Str()
    type = fields.Str()
    status = fields.Str()
    period_start = fields.DateTime(required=True)
    period_end = fields.DateTime(allow_none=True)
    location = fields.Str()
    provider = fields.Str()
    reason = fields.Str()
    notes = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class AppointmentSchema(Schema):
    fhir_id = fields.String(dump_only=True)  # Not required on input, included on output
    patient_id = fields.Integer(required=True)
    appointment_datetime = fields.DateTime(required=True)
    status = fields.String()
    practitioner = fields.String()
    location = fields.String()
    reason = fields.String()
    notes = fields.String()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

