from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.billing.models import Invoice, Payment
from app.billing.schemas import InvoiceSchema, PaymentSchema
from app.billing.services import BillingService

billing_bp = Blueprint('billing_bp', __name__)

invoice_schema = InvoiceSchema()
invoices_schema = InvoiceSchema(many=True)

payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)
billing_service = BillingService()
# Invoice CRUD

@billing_bp.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.get_json()
    errors = invoice_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    invoice = invoice_schema.load(data, session=db.session)
    db.session.add(invoice)
    db.session.commit()
    return invoice_schema.jsonify(invoice), 201

@billing_bp.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    user_id = get_jwt_identity()
    # For simplicity, return all invoices for this patient (expand as needed)
    invoices = Invoice.query.filter_by(patient_id=user_id).all()
    return invoices_schema.jsonify(invoices)

@billing_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    user_id = get_jwt_identity()
    if invoice.patient_id != user_id:
        return jsonify({"error": "Access forbidden"}), 403
    return invoice_schema.jsonify(invoice)

@billing_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    user_id = get_jwt_identity()
    if invoice.patient_id != user_id:
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    errors = invoice_schema.validate(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400

    for key, value in data.items():
        setattr(invoice, key, value)

    db.session.commit()
    return invoice_schema.jsonify(invoice)


@billing_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    user_id = get_jwt_identity()
    if invoice.patient_id != user_id:
        return jsonify({"error": "Access forbidden"}), 403
    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": f"Invoice {invoice_id} deleted."}), 200


# Payment CRUD

@billing_bp.route('/invoices/<int:invoice_id>/payments', methods=['POST'])
@jwt_required()
def create_payment(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    user_id = get_jwt_identity()
    if invoice.patient_id != user_id:
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    data['invoice_id'] = invoice_id

    errors = payment_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    payment = payment_schema.load(data, session=db.session)
    db.session.add(payment)

    # Update invoice status if paid in full
    total_paid = sum(p.amount for p in invoice.payments) + payment.amount
    if total_paid >= invoice.amount:
        invoice.status = 'paid'
    else:
        invoice.status = 'pending'

    db.session.commit()
    return payment_schema.jsonify(payment), 201


@billing_bp.route('/invoices/<int:invoice_id>/payments', methods=['GET'])
@jwt_required()
def get_payments(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    user_id = get_jwt_identity()
    if invoice.patient_id != user_id:
        return jsonify({"error": "Access forbidden"}), 403
    payments = Payment.query.filter_by(invoice_id=invoice_id).all()
    return payments_schema.jsonify(payments)

@billing_bp.route('/query', methods=['POST'])
@jwt_required()
def billing_query():
    data = request.get_json()
    query = data.get('query', '').strip()
    invoice_id = data.get('invoice_id')  # optional to provide invoice context

    if not query:
        return jsonify({"error": "Query text required."}), 400

    result = billing_service.answer_billing_query(query, invoice_id)
    status_code = 200 if result.get("success") else 500
    return jsonify(result), status_code