from app.extensions import ma
from marshmallow import fields

class InvoiceSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    patient_id = fields.Integer(required=True)
    amount = fields.Float(required=True)
    status = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    due_date = fields.DateTime(required=True)

class PaymentSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    invoice_id = fields.Integer(required=True)
    amount = fields.Float(required=True)
    payment_date = fields.DateTime(dump_only=True)
    method = fields.String(required=True)
