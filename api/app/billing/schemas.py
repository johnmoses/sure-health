from marshmallow import fields, validate
from app.extensions import ma
from app.billing.models import Invoice, Payment

class PaymentSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    invoice_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    payment_date = fields.DateTime(dump_only=True, format='iso')
    method = fields.Str(validate=validate.Length(max=50))

    class Meta:
        model = Payment
        load_instance = True
        include_fk = True

class InvoiceSchema(ma.SQLAlchemyAutoSchema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    status = fields.Str(validate=validate.OneOf(["pending", "paid", "overdue"]), default="pending")
    created_at = fields.DateTime(dump_only=True, format='iso')
    due_date = fields.DateTime(format='iso')
    updated_at = fields.DateTime(dump_only=True, format='iso')
    payments = fields.Nested(PaymentSchema, many=True, dump_only=True)

    class Meta:
        model = Invoice
        load_instance = True
        include_fk = True
