from marshmallow import fields, validate
from app.extensions import ma
from app.video.models import TelemedicineSession

class TelemedicineSessionSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    appointment_id = fields.Int(required=True)
    video_url = fields.Str(validate=validate.Length(max=255))
    started_at = fields.DateTime(allow_none=True, format="iso")
    ended_at = fields.DateTime(allow_none=True, format="iso")
    created_at = fields.DateTime(dump_only=True, format="iso")
    updated_at = fields.DateTime(dump_only=True, format="iso")

    class Meta:
        model = TelemedicineSession
        load_instance = True
        include_fk = True
