from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.medications.models import Prescription, TreatmentPlan
from app.medications.schemas import PrescriptionSchema, TreatmentPlanSchema
from app.extensions import db
from app.llm.clients import generate_response

medications_bp = Blueprint('medications', __name__)

prescription_schema = PrescriptionSchema()
prescriptions_schema = PrescriptionSchema(many=True)

@medications_bp.route('/prescriptions', methods=['POST'])
@jwt_required()
def create_prescription():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    try:
        rx = Prescription(**data)
        db.session.add(rx)
        db.session.commit()
        return jsonify(prescription_schema.dump(rx)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@medications_bp.route('/prescriptions', methods=['GET'])
@jwt_required()
def list_prescriptions():
    try:
        patient_id = request.args.get('patient_id', type=int)
        query = Prescription.query
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        rxs = query.all()
        result = [{
            'id': rx.id,
            'patient_id': rx.patient_id,
            'medication_name': rx.medication_name,
            'dosage': rx.dosage,
            'status': rx.status,
            'start_date': rx.start_date.isoformat() if rx.start_date else None
        } for rx in rxs]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Failed to fetch prescriptions", "details": str(e)}), 422

@medications_bp.route('/counseling', methods=['POST'])
@jwt_required()
def medication_counseling():
    data = request.get_json()
    med_name = data.get('medication')
    if not med_name:
        return jsonify({"error": "No medication specified"}), 400

    try:
        messages = [
            {"role": "system", "content": "Give clear and safe medication counseling for a patient."},
            {"role": "user", "content": f"Explain how to use {med_name}, including warnings."}
        ]

        reply_gen = generate_response(messages)
        reply_text = ''.join(reply_gen) if reply_gen else ""
        
        if not reply_text.strip():
            reply_text = f"Please consult your healthcare provider for specific guidance on {med_name}."
            
        return jsonify({"counseling": reply_text})
    except Exception as e:
        return jsonify({"counseling": f"Please consult your healthcare provider for guidance on {med_name}."}), 200