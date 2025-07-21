from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import Invoice, Payment
from .schemas import InvoiceSchema, PaymentSchema
from app.extensions import db

billing_bp = Blueprint("billing", __name__)
invoice_schema = InvoiceSchema()
invoices_schema = InvoiceSchema(many=True)
payment_schema = PaymentSchema()

@billing_bp.route("/invoice", methods=["POST"])
def create_invoice():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = invoice_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    invoice = Invoice(**data)
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice_schema.dump(invoice)), 201

@billing_bp.route("/payment", methods=["POST"])
def record_payment():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = payment_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    payment = Payment(**data)
    invoice = Invoice.query.get(payment.invoice_id)
    if invoice:
        invoice.status = "paid"
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment_schema.dump(payment)), 201

@billing_bp.route("/invoices/<int:patient_id>", methods=["GET"])
def list_invoices(patient_id):
    invoices = Invoice.query.filter_by(patient_id=patient_id).order_by(Invoice.created_at.desc()).all()
    return jsonify(invoices_schema.dump(invoices))
