from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.medications.models import Prescription, TreatmentPlan
from app.medications.schemas import PrescriptionSchema, TreatmentPlanSchema
from app.extensions import db
from app.llm.clients import generate_response

medications_bp = Blueprint('medications', __name__)

prescription_schema = PrescriptionSchema()
prescriptions_schema = PrescriptionSchema(many=True)

treatment_plan_schema = TreatmentPlanSchema()
treatment_plans_schema = TreatmentPlanSchema(many=True)

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

@medications_bp.route('/treatment-plans', methods=['POST'])
@jwt_required()
def create_treatment_plan():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    try:
        plan = TreatmentPlan(**data)
        db.session.add(plan)
        db.session.commit()
        return jsonify(treatment_plan_schema.dump(plan)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@medications_bp.route('/treatment-plans', methods=['GET'])
@jwt_required()
def list_treatment_plans():
    try:
        patient_id = request.args.get('patient_id', type=int)
        query = TreatmentPlan.query
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        plans = query.all()
        result = [{
            'id': plan.id,
            'patient_id': plan.patient_id,
            'plan_description': plan.plan_description,
            'start_date': plan.start_date.isoformat() if plan.start_date else None,
            'end_date': plan.end_date.isoformat() if plan.end_date else None,
            'status': plan.status,
            'responsible_provider': plan.responsible_provider
        } for plan in plans]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Failed to fetch treatment plans", "details": str(e)}), 422

@medications_bp.route('/treatment-plans/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_treatment_plan(plan_id):
    try:
        plan = TreatmentPlan.query.get_or_404(plan_id)
        return jsonify(treatment_plan_schema.dump(plan))
    except Exception as e:
        return jsonify({"error": "Treatment plan not found", "details": str(e)}), 404

@medications_bp.route('/treatment-plans/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_treatment_plan(plan_id):
    plan = TreatmentPlan.query.get_or_404(plan_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        for key, value in data.items():
            setattr(plan, key, value)
        db.session.commit()
        return jsonify(treatment_plan_schema.dump(plan))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@medications_bp.route('/treatment-plans/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_treatment_plan(plan_id):
    plan = TreatmentPlan.query.get_or_404(plan_id)
    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"message": "Treatment plan deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500