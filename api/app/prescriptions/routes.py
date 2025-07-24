from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.prescriptions.models import Prescription
from app.prescriptions.schemas import PrescriptionSchema
from app.prescriptions.services import PrescriptionService

prescriptions_bp = Blueprint('prescriptions_bp', __name__)

prescription_schema = PrescriptionSchema()
prescriptions_schema = PrescriptionSchema(many=True)
prescription_service = PrescriptionService()

@prescriptions_bp.route('/', methods=['POST'])
@jwt_required()
def create_prescription():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON."}), 400
    data = request.get_json()

    user_id = get_jwt_identity()
    # Enforce clinician_id matches authenticated user or implement role check
    if data.get('clinician_id') != user_id:
        return jsonify({"error": "You can only create prescriptions as yourself."}), 403

    errors = prescription_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    prescription = prescription_schema.load(data, session=db.session)
    db.session.add(prescription)
    db.session.commit()
    return prescription_schema.jsonify(prescription), 201

@prescriptions_bp.route('/', methods=['GET'])
@jwt_required()
def list_prescriptions():
    user_id = get_jwt_identity()
    # Return prescriptions where user is patient or clinician
    prescriptions = Prescription.query.filter(
        (Prescription.patient_id == user_id) | (Prescription.clinician_id == user_id)
    ).order_by(Prescription.created_at.desc()).all()
    return prescriptions_schema.jsonify(prescriptions)

@prescriptions_bp.route('/<int:prescription_id>', methods=['GET'])
@jwt_required()
def get_prescription(prescription_id):
    prescription = Prescription.query.get_or_404(prescription_id)
    user_id = get_jwt_identity()
    if user_id not in [prescription.patient_id, prescription.clinician_id]:
        return jsonify({"error": "Access forbidden."}), 403
    return prescription_schema.jsonify(prescription)

@prescriptions_bp.route('/<int:prescription_id>', methods=['PUT'])
@jwt_required()
def update_prescription(prescription_id):
    prescription = Prescription.query.get_or_404(prescription_id)
    user_id = get_jwt_identity()
    if user_id != prescription.clinician_id:
        return jsonify({"error": "Only prescribing clinician can update a prescription."}), 403

    data = request.get_json()
    errors = prescription_schema.validate(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400
    
    for key, value in data.items():
        setattr(prescription, key, value)
    
    db.session.commit()
    return prescription_schema.jsonify(prescription)

@prescriptions_bp.route('/<int:prescription_id>', methods=['DELETE'])
@jwt_required()
def delete_prescription(prescription_id):
    prescription = Prescription.query.get_or_404(prescription_id)
    user_id = get_jwt_identity()
    # Only allowing prescribing clinician deletion, adjust as needed
    if user_id != prescription.clinician_id:
        return jsonify({"error": "Only prescribing clinician can delete prescription."}), 403
    
    db.session.delete(prescription)
    db.session.commit()
    return jsonify({"message": f"Prescription {prescription_id} deleted."}), 200

@prescriptions_bp.route('/medication_advice', methods=['POST'])
@jwt_required()
def medication_advice():
    data = request.get_json()
    query = data.get('query', '').strip()
    if not query:
        return jsonify({"error": "Query text is required."}), 400

    context = data.get('context', '')  # optional clinical docs or history, if you have

    response = prescription_service.get_medication_advice(query, context)
    status = 200 if response.get('success') else 500
    return jsonify(response), status