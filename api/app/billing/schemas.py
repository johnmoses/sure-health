from marshmallow import Schema, fields

class PaymentSchema(Schema):
    id = fields.Int(dump_only=True)
    invoice_id = fields.Int()
    amount = fields.Float()
    payment_date = fields.DateTime(dump_only=True)
    method = fields.Str()

class InvoiceSchema(Schema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int()
    amount = fields.Float()
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    due_date = fields.DateTime(allow_none=True)
    updated_at = fields.DateTime(dump_only=True)
    payments = fields.Nested(PaymentSchema, many=True, dump_only=True)
