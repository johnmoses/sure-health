from marshmallow import Schema, fields

class PaymentSchema(Schema):
    id = fields.Int(dump_only=True)
    invoice_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    payment_date = fields.DateTime(dump_only=True)
    method = fields.Str()

class InvoiceSchema(Schema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    status = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)
    due_date = fields.DateTime()
    updated_at = fields.DateTime(dump_only=True)
    payments = fields.Nested(PaymentSchema, many=True, dump_only=True)
