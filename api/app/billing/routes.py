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
    try:
        patient_id = request.args.get('patient_id', type=int)
        query = Invoice.query
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        invoices = query.all()
        result = [{
            'id': inv.id,
            'patient_id': inv.patient_id,
            'amount': float(inv.amount),
            'status': inv.status,
            'created_at': inv.created_at.isoformat() if inv.created_at else None,
            'due_date': inv.due_date.isoformat() if inv.due_date else None
        } for inv in invoices]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    
    try:
        # Get invoice details
        bill_info = (
            f"Invoice ID: {invoice.id}\n"
            f"Amount: ${invoice.amount:.2f}\n"
            f"Status: {invoice.status}\n"
            f"Description: {getattr(invoice, 'description', 'Medical services')}\n"
        )
        
        prompt = [
            {"role": "system", "content": "Explain this medical invoice in clear, friendly language for a patient."},
            {"role": "user", "content": bill_info}
        ]

        explanation_gen = generate_response(prompt)
        explanation_text = ''.join(explanation_gen) if explanation_gen else ""
        
        if not explanation_text.strip():
            explanation_text = f"This is invoice #{invoice.id} for ${invoice.amount:.2f} with status: {invoice.status}. Please contact billing for more details."

        return jsonify({
            "invoice_id": invoice.id,
            "explanation": explanation_text
        })
    except Exception as e:
        return jsonify({
            "invoice_id": invoice.id,
            "explanation": f"This is invoice #{invoice.id} for ${invoice.amount:.2f}. Please contact billing for assistance."
        })
