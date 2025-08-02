from marshmallow import Schema, fields, validate, validates, ValidationError
from app.common.validators import PHIField, ENCOUNTER_STATUS

class EncounterSchema(Schema):
    id = fields.Integer(dump_only=True)
    fhir_id = fields.String(dump_only=True)
    patient_id = fields.Integer()
    encounter_class = fields.String()
    type = fields.String()
    status = fields.String()
    period_start = fields.DateTime()
    period_end = fields.DateTime()
    location = fields.String()
    provider = fields.String()
    reason = fields.String()
    notes = fields.String()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class ObservationSchema(Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer()
    encounter_id = fields.Integer()
    code = fields.String()
    display = fields.String()
    value = fields.String()
    unit = fields.String()
    effective_datetime = fields.DateTime()
    status = fields.String()
    created_at = fields.DateTime(dump_only=True)



class AppointmentSchema(Schema):
    id = fields.Integer(dump_only=True)
    fhir_id = fields.String(dump_only=True)
    patient_id = fields.Integer()
    appointment_datetime = fields.DateTime()
    status = fields.String()
    practitioner = fields.String()
    location = fields.String()
    reason = fields.String()
    notes = fields.String()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)