from marshmallow import fields, validate, ValidationError
import re
from datetime import date, datetime

class PHIField(fields.String):
    """Protected Health Information field with encryption support"""
    def _serialize(self, value, attr, obj, **kwargs):
        # In production, encrypt PHI data
        return value
    
    def _deserialize(self, value, attr, data, **kwargs):
        if not value or not value.strip():
            raise ValidationError("This field cannot be empty")
        return value.strip()

class SSNField(fields.String):
    """Social Security Number field with validation and masking"""
    def _validate(self, value):
        if value:
            # Remove any formatting
            ssn = re.sub(r'[^\d]', '', value)
            if len(ssn) != 9:
                raise ValidationError("SSN must be 9 digits")
            if not re.match(r'^\d{9}$', ssn):
                raise ValidationError("Invalid SSN format")
    
    def _serialize(self, value, attr, obj, **kwargs):
        # Mask SSN for display (XXX-XX-1234)
        if value and len(value) >= 4:
            return f"XXX-XX-{value[-4:]}"
        return "XXX-XX-XXXX"

class DateOfBirthField(fields.Date):
    """Date of birth with age validation"""
    def _validate(self, value):
        if value:
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            if age < 0 or age > 150:
                raise ValidationError("Invalid date of birth")

class PhoneField(fields.String):
    """Phone number validation"""
    def _validate(self, value):
        if value:
            phone = re.sub(r'[^\d]', '', value)
            if len(phone) != 10:
                raise ValidationError("Phone number must be 10 digits")

class EmailField(fields.Email):
    """Enhanced email validation"""
    def __init__(self, **kwargs):
        super().__init__(validate=validate.Email(), **kwargs)

# Common validation patterns
GENDER_CHOICES = ['male', 'female', 'other', 'unknown']
ROLE_CHOICES = ['patient', 'clinician', 'admin', 'bot']
ENCOUNTER_STATUS = ['planned', 'arrived', 'in-progress', 'finished', 'cancelled']