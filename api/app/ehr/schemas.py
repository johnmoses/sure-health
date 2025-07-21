from app.extensions import ma
from marshmallow import fields

class LabResultSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    medical_record_id = fields.Integer(required=True)
    test_name = fields.String(required=True)
    result = fields.String(required=True)
    result_date = fields.DateTime(dump_only=True)

class MedicalRecordSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    clinician_id = fields.Integer(required=True)
    description = fields.String(required=True)
    record_date = fields.DateTime(dump_only=True)
    lab_results = fields.Nested(LabResultSchema, many=True, dump_only=True)
