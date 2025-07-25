from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.clinical.models import Observation, Encounter, Appointment
from app.clinical.schemas import ObservationSchema, EncounterSchema, AppointmentSchema
from app.extensions import db
from app.common.decorators import jwt_required_with_roles
from app.llm.clients import generate_response


clinical_bp = Blueprint('clinical', __name__)

# Schemas
observation_schema = ObservationSchema()
observations_schema = ObservationSchema(many=True)

encounter_schema = EncounterSchema()
encounters_schema = EncounterSchema(many=True)

appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)

# ---- Observation Endpoints ----
@clinical_bp.route('/observations', methods=['POST'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def create_observation():
    data = request.get_json()
    errors = observation_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    obs = Observation(**data)
    db.session.add(obs)
    db.session.commit()
    obs_data = observation_schema.dump(obs)
    return jsonify(obs_data), 201

@clinical_bp.route('/observations/<string:fhir_id>', methods=['GET'])
@jwt_required()
def get_observation(fhir_id):
    obs = Observation.query.filter_by(fhir_id=fhir_id).first_or_404()
    obs_data = observation_schema.dump(obs)
    return jsonify(obs_data)

@clinical_bp.route('/observations', methods=['GET'])
@jwt_required()
def list_observations():
    patient_id = request.args.get('patient_id', type=int)
    query = Observation.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    obs_list = query.all()
    obs_list_data = observations_schema.dump(obs_list)
    return jsonify(obs_list_data)

@clinical_bp.route('/observations/<string:fhir_id>', methods=['PUT'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def update_observation(fhir_id):
    obs = Observation.query.filter_by(fhir_id=fhir_id).first_or_404()
    data = request.get_json()
    errors = observation_schema.validate(data, partial=True)
    if errors:
        return jsonify(errors), 400
    for key, value in data.items():
        setattr(obs, key, value)
    db.session.commit()
    obs_data = observation_schema.dump(obs)
    return jsonify(obs_data)

@clinical_bp.route('/observations/<string:fhir_id>', methods=['DELETE'])
@jwt_required()
@jwt_required_with_roles(roles=['admin'])
def delete_observation(fhir_id):
    obs = Observation.query.filter_by(fhir_id=fhir_id).first_or_404()
    db.session.delete(obs)
    db.session.commit()
    return '', 204

# ---- Encounter Endpoints ----
@clinical_bp.route('/encounters', methods=['POST'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def create_encounter():
    data = request.get_json()
    errors = encounter_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    encounter = Encounter(**data)
    db.session.add(encounter)
    db.session.commit()
    encounter_data = encounter_schema.dump(encounter)
    return jsonify(encounter_data), 201

@clinical_bp.route('/encounters/<string:fhir_id>', methods=['GET'])
@jwt_required()
def get_encounter(fhir_id):
    encounter = Encounter.query.filter_by(fhir_id=fhir_id).first_or_404()
    encounter_data = encounter_schema.dump(encounter)
    return jsonify(encounter_data)

@clinical_bp.route('/encounters', methods=['GET'])
@jwt_required()
def list_encounters():
    patient_id = request.args.get('patient_id', type=int)
    query = Encounter.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    enc_list = query.all()
    enc_data = encounters_schema.dump(enc_list)
    return jsonify(enc_data)

@clinical_bp.route('/encounters/<string:fhir_id>', methods=['PUT'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin'])
def update_encounter(fhir_id):
    encounter = Encounter.query.filter_by(fhir_id=fhir_id).first_or_404()
    data = request.get_json()
    errors = encounter_schema.validate(data, partial=True)
    if errors:
        return jsonify(errors), 400
    for key, value in data.items():
        setattr(encounter, key, value)
    db.session.commit()
    encounter_data = encounter_schema.dump(encounter)
    return jsonify(encounter_data)

@clinical_bp.route('/encounters/<string:fhir_id>', methods=['DELETE'])
@jwt_required()
@jwt_required_with_roles(roles=['admin'])
def delete_encounter(fhir_id):
    encounter = Encounter.query.filter_by(fhir_id=fhir_id).first_or_404()
    db.session.delete(encounter)
    db.session.commit()
    return '', 204

# ---- Appointment Endpoints ----
@clinical_bp.route('/appointments', methods=['POST'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin', 'patient'])
def create_appointment():
    data = request.get_json()
    errors = appointment_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    appt = Appointment(**data)
    db.session.add(appt)
    db.session.commit()
    appointmend_data = appointment_schema.dump(appt)
    return jsonify(appointmend_data), 201

@clinical_bp.route('/appointments/<string:fhir_id>', methods=['GET'])
@jwt_required()
def get_appointment(fhir_id):
    appt = Appointment.query.filter_by(fhir_id=fhir_id).first_or_404()
    appt_data = appointment_schema.dump(appt)
    return jsonify(appt_data)

@clinical_bp.route('/appointments', methods=['GET'])
@jwt_required()
def list_appointments():
    patient_id = request.args.get('patient_id', type=int)
    query = Appointment.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    appt_list = query.all()
    appt_data = appointments_schema.dump(appt_list)
    return jsonify(appt_data)

@clinical_bp.route('/appointments/<string:fhir_id>', methods=['PUT'])
@jwt_required()
@jwt_required_with_roles(roles=['clinician', 'admin', 'patient'])
def update_appointment(fhir_id):
    appt = Appointment.query.filter_by(fhir_id=fhir_id).first_or_404()
    data = request.get_json()
    errors = appointment_schema.validate(data, partial=True)
    if errors:
        return jsonify(errors), 400
    for key, value in data.items():
        setattr(appt, key, value)
    db.session.commit()
    appt_data = appointment_schema.dump(appt)
    return jsonify(appt_data)

@clinical_bp.route('/appointments/<string:fhir_id>', methods=['DELETE'])
@jwt_required()
@jwt_required_with_roles(roles=['admin'])
def delete_appointment(fhir_id):
    appt = Appointment.query.filter_by(fhir_id=fhir_id).first_or_404()
    db.session.delete(appt)
    db.session.commit()
    return '', 204

@clinical_bp.route('/notes/summary', methods=['POST'])
@jwt_required()
def summarize_chart_notes():
    data = request.get_json()
    notes = data.get('notes')
    if not notes:
        return jsonify({"error": "No clinical notes provided"}), 400

    # Construct domain-specific summarization prompt
    messages = [
        {"role": "system", "content": "Summarize the following clinical notes for provider review."},
        {"role": "user", "content": notes}
    ]

    summary_gen = generate_response(messages)
    summary_text = ''.join(summary_gen)
    return jsonify({"summary": summary_text})