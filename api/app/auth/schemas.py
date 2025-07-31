from marshmallow import Schema, fields, validate, validates, ValidationError, post_load
from app.common.validators import EmailField, ROLE_CHOICES
import re

class UserSchema(Schema):
    id = fields.Integer(dump_only=True)
    username = fields.String(
        required=True,
        validate=[
            validate.Length(min=3, max=50),
            validate.Regexp(r'^[a-zA-Z0-9_]+$', error="Username can only contain letters, numbers, and underscores")
        ]
    )
    email = EmailField(required=True)
    role = fields.String(
        required=True,
        validate=validate.OneOf(ROLE_CHOICES)
    )
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128)
    )
    created_at = fields.DateTime(dump_only=True)
    last_login = fields.DateTime(dump_only=True)
    is_active = fields.Boolean(dump_only=True)

    @validates('password')
    def validate_password(self, value):
        """Validate password strength"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', value):
            raise ValidationError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', value):
            raise ValidationError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError("Password must contain at least one special character")

class LoginSchema(Schema):
    username = fields.String(required=True, validate=validate.Length(min=1))
    password = fields.String(required=True, validate=validate.Length(min=1))

class ChangePasswordSchema(Schema):
    old_password = fields.String(required=True)
    new_password = fields.String(
        required=True,
        validate=validate.Length(min=8, max=128)
    )
    
    @validates('new_password')
    def validate_new_password(self, value):
        """Apply same password validation as UserSchema"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', value):
            raise ValidationError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', value):
            raise ValidationError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError("Password must contain at least one special character")