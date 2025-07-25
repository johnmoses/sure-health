from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.billing.models import Invoice, Payment
from app.billing.schemas import InvoiceSchema, PaymentSchema
from app.extensions import db
from app.llm.clients import generate_response


billing_bp = Blueprint('billing', __name__)

invoice_schema = InvoiceSchema()
invoices_schema = InvoiceSchema(many=True)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)

# Create Invoice
@billing_bp.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.get_json()
    errors = invoice_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    invoice = Invoice(**data)
    db.session.add(invoice)
    db.session.commit()
    return jsonify(invoice_schema.dump(invoice)), 201

# Retrieve Invoice
@billing_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    return jsonify(invoice_schema.dump(invoice))

# List Invoices
@billing_bp.route('/invoices', methods=['GET'])
@jwt_required()
def list_invoices():
    patient_id = request.args.get('patient_id', type=int)
    query = Invoice.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    invoices = query.all()
    return jsonify(invoices_schema.dump(invoices))

# Update Invoice
@billing_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    data = request.get_json()
    errors = invoice_schema.validate(data, partial=True)
    if errors:
        return jsonify(errors), 400
    for k, v in data.items():
        setattr(invoice, k, v)
    db.session.commit()
    return jsonify(invoice_schema.dump(invoice))

# Delete Invoice
@billing_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    db.session.delete(invoice)
    db.session.commit()
    return '', 204

# Create Payment
@billing_bp.route('/payments', methods=['POST'])
@jwt_required()
def create_payment():
    data = request.get_json()
    errors = payment_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    payment = Payment(**data)
    db.session.add(payment)
    db.session.commit()
    return jsonify(payment_schema.dump(payment)), 201

# List Payments for Invoice
@billing_bp.route('/invoices/<int:invoice_id>/payments', methods=['GET'])
@jwt_required()
def get_payments(invoice_id):
    payments = Payment.query.filter_by(invoice_id=invoice_id).all()
    return jsonify(payments_schema.dump(payments))

@billing_bp.route('/invoices/<int:invoice_id>/explain', methods=['GET'])
@jwt_required()
def explain_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    total_paid = invoice.paid_amount
    unpaid = invoice.amount - total_paid
    bill_info = (
        f"Invoice ID: {invoice.id}\n"
        f"Bill Date: {invoice.created_at.strftime('%Y-%m-%d') if invoice.created_at else 'N/A'}\n"
        f"Amount: ${invoice.amount:.2f}\n"
        f"Paid: ${total_paid:.2f}\n"
        f"Status: {invoice.status}\n"
        f"Due Date: {invoice.due_date.strftime('%Y-%m-%d') if invoice.due_date else 'N/A'}\n"
    )
    if invoice.payments:
        bill_info += "Payments:\n"
        for p in invoice.payments:
            bill_info += f"- {p.payment_date.strftime('%Y-%m-%d') if p.payment_date else 'N/A'}: ${p.amount:.2f} [{p.method or 'N/A'}]\n"

    prompt = [
        {"role": "system", "content": "Explain this medical invoice in clear, friendly language for a patient, noting pay history and any actions needed."},
        {"role": "user", "content": bill_info}
    ]

    explanation = generate_response(prompt)  # Could be str or generator

    # If streaming (generator), consume it fully into a string
    if hasattr(explanation, '__iter__') and not isinstance(explanation, str):
        explanation_text = ''.join(explanation)
    else:
        explanation_text = explanation

    return jsonify({
        "invoice_id": invoice.id,
        "explanation": explanation_text
    })
