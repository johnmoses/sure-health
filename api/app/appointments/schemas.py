from marshmallow import fields, validate
from app.extensions import ma
from app.appointments.models import Appointment

class AppointmentSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    clinician_id = fields.Int(required=True)
    scheduled_time = fields.DateTime(required=True, format='iso')
    reason = fields.Str(validate=validate.Length(max=256))
    status = fields.Str(validate=validate.OneOf(["scheduled", "canceled", "completed"]), dump_default="scheduled")
    created_at = fields.DateTime(dump_only=True, format='iso')
    updated_at = fields.DateTime(dump_only=True, format='iso')

    class Meta:
        model = Appointment
        load_instance = True
        include_fk = True
