from marshmallow import Schema, fields

class PatientSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    fhir_id = fields.Str(dump_only=True)
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    date_of_birth = fields.Date(required=True)
    gender = fields.Str(required=True)
    phone = fields.Str()
    email = fields.Email()
    address = fields.Str()
    medical_record_number = fields.Str()
    insurance_id = fields.Str()
    insurance_provider = fields.Str()
    created_at = fields.DateTime(dump_only=True)
