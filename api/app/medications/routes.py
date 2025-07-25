from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.medications.models import Prescription, TreatmentPlan
from app.medications.schemas import PrescriptionSchema, TreatmentPlanSchema
from app.extensions import db
from app.common.decorators import jwt_required_with_roles
from app.llm.clients import generate_response


medications_bp = Blueprint('medications', __name__)

prescription_schema = PrescriptionSchema()
prescriptions_schema = PrescriptionSchema(many=True)
treatment_plan_schema = TreatmentPlanSchema()
treatment_plans_schema = TreatmentPlanSchema(many=True)

# ---- Prescription Endpoints ----
@medications_bp.route('/prescriptions', methods=['POST'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def create_prescription():
    data = request.get_json()
    errors = prescription_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    rx = Prescription(**data)
    db.session.add(rx)
    db.session.commit()
    return jsonify(prescription_schema.dump(rx)), 201

@medications_bp.route('/prescriptions/<string:fhir_id>', methods=['GET'])
@jwt_required()
def get_prescription(fhir_id):
    rx = Prescription.query.filter_by(fhir_id=fhir_id).first_or_404()
    return jsonify(prescription_schema.dump(rx))

@medications_bp.route('/prescriptions', methods=['GET'])
@jwt_required()
def list_prescriptions():
    patient_id = request.args.get('patient_id', type=int)
    query = Prescription.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    rxs = query.all()
    return jsonify(prescriptions_schema.dump(rxs))

@medications_bp.route('/prescriptions/<string:fhir_id>', methods=['PUT'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def update_prescription(fhir_id):
    rx = Prescription.query.filter_by(fhir_id=fhir_id).first_or_404()
    data = request.get_json()
    errors = prescription_schema.validate(data, partial=True)
    if errors:
        return jsonify(errors), 400
    for key, value in data.items():
        setattr(rx, key, value)
    db.session.commit()
    return jsonify(prescription_schema.dump(rx))

@medications_bp.route('/prescriptions/<string:fhir_id>', methods=['DELETE'])
@jwt_required()
@jwt_required_with_roles(roles=['admin'])
def delete_prescription(fhir_id):
    rx = Prescription.query.filter_by(fhir_id=fhir_id).first_or_404()
    db.session.delete(rx)
    db.session.commit()
    return '', 204

# ---- TreatmentPlan Endpoints ----
@medications_bp.route('/treatment-plans', methods=['POST'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def create_treatment_plan():
    data = request.get_json()
    errors = treatment_plan_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    plan = TreatmentPlan(**data)
    db.session.add(plan)
    db.session.commit()
    return jsonify(treatment_plan_schema.dump(plan)), 201

@medications_bp.route('/treatment-plans/<int:id>', methods=['GET'])
@jwt_required()
def get_treatment_plan(id):
    plan = TreatmentPlan.query.get_or_404(id)
    return jsonify(treatment_plan_schema.dump(plan))

@medications_bp.route('/treatment-plans', methods=['GET'])
@jwt_required()
def list_treatment_plans():
    patient_id = request.args.get('patient_id', type=int)
    query = TreatmentPlan.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    plans = query.all()
    return jsonify(treatment_plans_schema.dump(plans))

@medications_bp.route('/treatment-plans/<int:id>', methods=['PUT'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def update_treatment_plan(id):
    plan = TreatmentPlan.query.get_or_404(id)
    data = request.get_json()
    errors = treatment_plan_schema.validate(data, partial=True)
    if errors:
        return jsonify(errors), 400
    for key, value in data.items():
        setattr(plan, key, value)
    db.session.commit()
    return jsonify(treatment_plan_schema.dump(plan))

@medications_bp.route('/treatment-plans/<int:id>', methods=['DELETE'])
@jwt_required()
@jwt_required_with_roles(roles=['admin'])
def delete_treatment_plan(id):
    plan = TreatmentPlan.query.get_or_404(id)
    db.session.delete(plan)
    db.session.commit()
    return '', 204

@medications_bp.route('/counseling', methods=['POST'])
@jwt_required()
def medication_counseling():
    data = request.get_json()
    med_name = data.get('medication')
    if not med_name:
        return jsonify({"error": "No medication specified"}), 400

    # Tailor the system prompt for patient-friendly medication education
    messages = [
        {"role": "system", "content": "Give clear and safe medication counseling for a patient."},
        {"role": "user", "content": f"Explain how to use {med_name}, including warnings."}
    ]

    reply = generate_response(messages)
    return jsonify({"counseling": reply})