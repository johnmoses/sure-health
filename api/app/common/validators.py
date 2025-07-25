from marshmallow import ValidationError

def validate_gender(value):
    allowed = {"male", "female", "other", "unknown"}
    if value not in allowed:
        raise ValidationError(f"Invalid gender: {value}. Allowed values: {allowed}")

def validate_status(value, allowed_statuses):
    if value not in allowed_statuses:
        raise ValidationError(f"Invalid status '{value}', expected one of {allowed_statuses}")
