from app.extensions import ma
from marshmallow import fields, validate

class UserSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    username = fields.String(required=True, validate=validate.Length(min=3))
    password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(["patient", "clinician", "ai"]))
