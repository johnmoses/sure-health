from marshmallow import Schema, fields, validate, validates, ValidationError
from app.common.validators import (
    PHIField, SSNField, DateOfBirthField, PhoneField, EmailField, GENDER_CHOICES
)

class PatientSchema(Schema):
    id = fields.Integer(dump_only=True)
    user_id = fields.Integer()
    fhir_id = fields.String(dump_only=True)
    
    # PHI Fields - require special handling
    first_name = PHIField(
        required=True,
        validate=[
            validate.Length(min=1, max=100),
            validate.Regexp(r'^[a-zA-Z\s\-\'\.]+$', error="Invalid characters in name")
        ]
    )
    last_name = PHIField(
        required=True,
        validate=[
            validate.Length(min=1, max=100),
            validate.Regexp(r'^[a-zA-Z\s\-\'\.]+$', error="Invalid characters in name")
        ]
    )
    date_of_birth = DateOfBirthField(required=True)
    gender = fields.String(
        required=True,
        validate=validate.OneOf(GENDER_CHOICES)
    )
    
    # Contact Information (PHI)
    phone = PhoneField(allow_none=True)
    email = EmailField(allow_none=True)
    address = PHIField(validate=validate.Length(max=500))
    
    # Medical Information
    medical_record_number = fields.String(
        validate=[
            validate.Length(min=5, max=50),
            validate.Regexp(r'^[A-Z0-9\-]+$', error="Invalid MRN format")
        ]
    )
    
    # Insurance Information
    insurance_id = fields.String(validate=validate.Length(max=50))
    insurance_provider = fields.String(validate=validate.Length(max=100))
    
    # System fields
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    is_active = fields.Boolean(dump_only=True)

    @validates('medical_record_number')
    def validate_mrn_uniqueness(self, value):
        """Validate MRN format and uniqueness"""
        if value and len(value) < 5:
            raise ValidationError("Medical record number must be at least 5 characters")

class PatientCreateSchema(PatientSchema):
    """Schema for creating new patients with required fields"""
    user_id = fields.Integer(required=True)
    
    class Meta:
        exclude = ('id', 'fhir_id', 'created_at', 'updated_at', 'is_active')

class PatientUpdateSchema(PatientSchema):
    """Schema for updating patients - all fields optional except ID"""
    class Meta:
        exclude = ('id', 'fhir_id', 'user_id', 'created_at', 'updated_at')
    
    # Make all fields optional for updates
    first_name = PHIField(validate=validate.Length(min=1, max=100))
    last_name = PHIField(validate=validate.Length(min=1, max=100))
    date_of_birth = DateOfBirthField()
    gender = fields.String(validate=validate.OneOf(GENDER_CHOICES))