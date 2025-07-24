from marshmallow import fields, validate
from app.extensions import ma
from app.ehr.models import MedicalRecord, LabResult

class LabResultSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    medical_record_id = fields.Int(required=True)
    test_name = fields.Str(required=True, validate=validate.Length(1, 255))
    result = fields.Str()
    result_date = fields.DateTime(format='iso')

    class Meta:
        model = LabResult
        load_instance = True
        include_fk = True

class MedicalRecordSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    clinician_id = fields.Int(required=True)
    description = fields.Str()
    record_date = fields.DateTime(required=True, format='iso')
    created_at = fields.DateTime(dump_only=True, format='iso')
    updated_at = fields.DateTime(dump_only=True, format='iso')

    lab_results = fields.Nested(LabResultSchema, many=True, dump_only=True)

    class Meta:
        model = MedicalRecord
        load_instance = True
        include_fk = True
