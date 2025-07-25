from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required
from app.patients.models import Patient
from app.patients.schemas import PatientSchema
from app.extensions import db
from datetime import datetime
from app.llm.clients import generate_response
from app.clinical.models import Encounter, Observation, Appointment


patients_bp = Blueprint('patients', __name__)

patient_schema = PatientSchema()
patients_schema = PatientSchema(many=True)

@patients_bp.route('/', methods=['POST'])
@jwt_required()
def create_patient():
    json_data = request.get_json()

    if not json_data:
        return jsonify({"error": "No input data provided"}), 400

    # Validate input as before
    errors = patient_schema.validate(json_data)
    if errors:
        return jsonify(errors), 400

    # Convert date_of_birth string to date object
    try:
        dob_str = json_data.get('date_of_birth')
        if dob_str:
            json_data['date_of_birth'] = datetime.strptime(dob_str, '%Y-%m-%d').date()
        else:
            return jsonify({"error": "date_of_birth is required"}), 400
    except ValueError:
        return jsonify({"error": "Invalid date_of_birth format. Use YYYY-MM-DD."}), 400

    # Now create Patient instance as before
    patient = Patient(**json_data)
    db.session.add(patient)
    db.session.commit()

    result = patient_schema.dump(patient)
    return jsonify(result), 201

@patients_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_patient(id):
    patient = Patient.query.get(id)
    if not patient:
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
    patients = Patient.query.all()
    result = patients_schema.dump(patients)
    return jsonify(result)

@patients_bp.route('/<int:patient_id>/summary', methods=['GET'])
@jwt_required()
def patient_summary(patient_id):
    # Fetch relevant patient info (adjust fields according to your models)
    patient = Patient.query.get_or_404(patient_id)
    encounters = Encounter.query.filter_by(patient_id=patient_id).all()
    observations = Observation.query.filter_by(patient_id=patient_id).all()
    appointments = Appointment.query.filter_by(patient_id=patient_id).all()

    # Construct plain input text for LLM
    record_text = f"Patient: {patient.first_name} {patient.last_name}, gender {patient.gender}.\n"
    record_text += "Encounters:\n"
    for e in encounters:
        record_text += f"- {e.status} {e.encounter_class} on {e.period_start.strftime('%Y-%m-%d')}: {e.reason}\n"
    record_text += "Observations:\n"
    for o in observations[:5]:  # limit if too many
        record_text += f"- {o.code}: {o.value}{o.unit or ''} ({o.effective_datetime.strftime('%Y-%m-%d')})\n"
    for a in appointments[:5]:  # limit if too many
        record_text += f"- {a.status} {a.start_datetime.strftime('%Y-%m-%d %H:%M')}: {a.reason}\n"

    # LLM system prompt
    messages = [
        {"role": "system", "content": "Summarize the patient record for a general clinical handoff in clear, concise language."},
        {"role": "user", "content": record_text}
    ]
    print('record_text', record_text)
    print('messages', messages)
    summary_gen = generate_response(messages)
    summary_text = ''.join(summary_gen)
    return jsonify({"summary": summary_text})