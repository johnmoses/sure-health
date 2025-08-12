from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required
from app.patients.models import Patient
from app.patients.schemas import PatientSchema, PatientCreateSchema, PatientUpdateSchema
from app.extensions import db
from datetime import datetime
from app.llm.clients import generate_response
from app.clinical.models import Encounter, Observation, Appointment
from app.common.hipaa import hipaa_audit, require_patient_access, log_hipaa_access, mask_phi_data
from marshmallow import ValidationError


patients_bp = Blueprint('patients', __name__)

patient_schema = PatientSchema()
patients_schema = PatientSchema(many=True)

@patients_bp.route('/', methods=['POST'])
@jwt_required()
@hipaa_audit('CREATE', 'patient')
def create_patient():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400

    # Use create schema for validation
    create_schema = PatientCreateSchema()
    try:
        validated_data = create_schema.load(json_data)
    except ValidationError as err:
        log_hipaa_access('CREATE', 'patient', success=False, reason=f"Validation error: {err.messages}")
        return jsonify({"error": "Validation failed", "messages": err.messages}), 400

    try:
        patient = Patient(**validated_data)
        db.session.add(patient)
        db.session.commit()
        
        result = create_schema.dump(patient)
        return jsonify(result), 201
    except Exception as e:
        db.session.rollback()
        log_hipaa_access('CREATE', 'patient', success=False, reason=str(e))
        return jsonify({"error": "Failed to create patient"}), 500

@patients_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@require_patient_access('id')
@hipaa_audit('READ', 'patient')
def get_patient(id):
    patient = Patient.query.get(id)
    if not patient:
        log_hipaa_access('READ', 'patient', id, success=False, reason="Patient not found")
        abort(404, description=f"Patient with id {id} not found.")
    
    result = patient_schema.dump(patient)
    return jsonify(result)

@patients_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_patient(id):
    patient = Patient.query.get(id)
    if not patient:
        abort(404, description=f"Patient with id {id} not found.")

    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400

    # Ensure user_id cannot be changed directly via PUT to maintain 1-to-1 integrity
    if 'user_id' in json_data:
        return jsonify({"error": "user_id cannot be updated directly via this endpoint. Create a new patient or unlink/relink carefully."}), 400

    errors = patient_schema.validate(json_data, partial=True) # partial update allowed
    if errors:
        return jsonify(errors), 400

    for key, value in json_data.items():
        setattr(patient, key, value)

    db.session.commit()
    result = patient_schema.dump(patient)
    return jsonify(result)

@patients_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_patient(id):
    patient = Patient.query.get(id)
    if not patient:
        abort(404, description=f"Patient with id {id} not found.")

    # Optionally, consider implications of deleting a patient on the associated user account.
    # E.g., should the user also be deleted? Or only the patient link removed?
    db.session.delete(patient)
    db.session.commit()
    return '', 204

@patients_bp.route('', methods=['GET'])
@jwt_required()
def list_patients():
    try:
        patients = Patient.query.all()
        result = [{
            'id': p.id,
            'first_name': p.first_name,
            'last_name': p.last_name,
            'gender': p.gender,
            'date_of_birth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            'phone': p.phone,
            'email': p.email
        } for p in patients]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Failed to fetch patients", "details": str(e)}), 422

@patients_bp.route('/<int:patient_id>/summary', methods=['GET'])
@jwt_required()
def patient_summary(patient_id):
    # Fetch relevant patient info (adjust fields according to your models)
    patient = Patient.query.get_or_404(patient_id)
    encounters = Encounter.query.filter_by(patient_id=patient_id).all()
    observations = Observation.query.filter_by(patient_id=patient_id).all()
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()

    # Construct plain input text for LLM
    record_text = f"Patient: {patient.first_name} {patient.last_name}, {patient.gender}, DOB: {patient.date_of_birth}.\n"
    record_text += f"Contact: {patient.phone or 'N/A'}, {patient.email or 'N/A'}\n"
    record_text += f"Insurance: {patient.insurance_provider or 'N/A'}\n\n"
    
    if encounters:
        record_text += "Recent Encounters:\n"
        for e in encounters:
            record_text += f"- {e.status} {e.encounter_class} on {e.period_start.strftime('%Y-%m-%d')}: {e.reason or 'No reason specified'}\n"
    else:
        record_text += "No recent encounters on record.\n"
    
    if observations:
        record_text += "\nRecent Observations:\n"
        for o in observations[:5]:
            record_text += f"- {o.code}: {o.value}{o.unit or ''} ({o.effective_datetime.strftime('%Y-%m-%d')})\n"
    else:
        record_text += "\nNo recent observations on record.\n"
    
    if appointments:
        record_text += "\nUpcoming Appointments:\n"
        for a in appointments[:5]:
            record_text += f"- {a.status} {a.start_datetime.strftime('%Y-%m-%d %H:%M')}: {a.reason or 'Routine visit'}\n"
    else:
        record_text += "\nNo upcoming appointments scheduled.\n"

    # Try LLM generation, fallback to basic summary if not available
    try:
        messages = [
            {"role": "system", "content": "Summarize the patient record for a general clinical handoff in clear, concise language."},
            {"role": "user", "content": record_text}
        ]
        summary_gen = generate_response(messages)
        summary_text = ''.join(summary_gen) if summary_gen else ""
        
        # If LLM returns empty, provide basic summary
        if not summary_text.strip():
            summary_text = f"Patient {patient.first_name} {patient.last_name} is a {patient.gender} patient with {len(encounters)} encounters, {len(observations)} observations, and {len(appointments)} appointments on record."
            
    except Exception as e:
        print(f"LLM generation failed: {e}")
        summary_text = f"Patient {patient.first_name} {patient.last_name} is a {patient.gender} patient. Clinical data: {len(encounters)} encounters, {len(observations)} observations, {len(appointments)} appointments."
    
    return jsonify({"summary": summary_text, "patient_data": record_text})