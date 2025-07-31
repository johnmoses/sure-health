from marshmallow import Schema, fields, validate, validates, ValidationError
from app.common.validators import PHIField, ENCOUNTER_STATUS

class EncounterSchema(Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    provider_id = fields.Integer(required=True)
    
    status = fields.String(
        required=True,
        validate=validate.OneOf(ENCOUNTER_STATUS)
    )
    encounter_class = fields.String(
        required=True,
        validate=validate.OneOf(['inpatient', 'outpatient', 'emergency', 'virtual'])
    )
    
    # PHI Fields
    reason = PHIField(validate=validate.Length(max=500))
    diagnosis = PHIField(validate=validate.Length(max=1000))
    notes = PHIField(validate=validate.Length(max=2000))
    
    # Dates
    period_start = fields.DateTime(required=True)
    period_end = fields.DateTime()
    
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class ObservationSchema(Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    encounter_id = fields.Integer()
    
    code = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    display = fields.String(validate=validate.Length(max=200))
    value = fields.String(validate=validate.Length(max=100))
    unit = fields.String(validate=validate.Length(max=50))
    
    effective_datetime = fields.DateTime(required=True)
    status = fields.String(
        required=True,
        validate=validate.OneOf(['final', 'preliminary', 'amended', 'cancelled'])
    )
    
    created_at = fields.DateTime(dump_only=True)

class PrescriptionSchema(Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    prescriber_id = fields.Integer(required=True)
    
    medication_name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=200)
    )
    dosage = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    frequency = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    quantity = fields.Integer(validate=validate.Range(min=1))
    refills = fields.Integer(validate=validate.Range(min=0, max=12))
    
    # PHI Fields
    instructions = PHIField(validate=validate.Length(max=500))
    
    # Dates
    prescribed_date = fields.DateTime(required=True)
    start_date = fields.Date()
    end_date = fields.Date()
    
    status = fields.String(
        required=True,
        validate=validate.OneOf(['active', 'completed', 'cancelled', 'suspended'])
    )
    
    created_at = fields.DateTime(dump_only=True)

class AppointmentSchema(Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    provider_id = fields.Integer(required=True)
    
    start_datetime = fields.DateTime(required=True)
    end_datetime = fields.DateTime()
    status = fields.String(
        required=True,
        validate=validate.OneOf(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'])
    )
    appointment_type = fields.String(
        validate=validate.OneOf(['consultation', 'follow-up', 'procedure', 'emergency'])
    )
    reason = PHIField(validate=validate.Length(max=500))
    notes = PHIField(validate=validate.Length(max=1000))
    
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)