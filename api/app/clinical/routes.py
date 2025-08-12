from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.clinical.models import Observation, Encounter, Appointment
from app.clinical.schemas import ObservationSchema, EncounterSchema, AppointmentSchema
from app.extensions import db
from datetime import datetime

clinical_bp = Blueprint('clinical', __name__)

observation_schema = ObservationSchema()
observations_schema = ObservationSchema(many=True)
encounter_schema = EncounterSchema()
encounters_schema = EncounterSchema(many=True)
appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)

@clinical_bp.route('/observations', methods=['POST'])
@jwt_required()
def create_observation():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    # Parse datetime string
    if 'effective_datetime' in data and isinstance(data['effective_datetime'], str):
        try:
            data['effective_datetime'] = datetime.fromisoformat(data['effective_datetime'])
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400
    
    try:
        obs = Observation(**data)
        db.session.add(obs)
        db.session.commit()
        return jsonify(observation_schema.dump(obs)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/observations', methods=['GET'])
@jwt_required()
def list_observations():
    patient_id = request.args.get('patient_id', type=int)
    query = Observation.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    obs_list = query.all()
    return jsonify(observations_schema.dump(obs_list))

@clinical_bp.route('/observations/<int:id>', methods=['GET'])
@jwt_required()
def get_observation_by_id(id):
    obs = Observation.query.get_or_404(id)
    return jsonify(observation_schema.dump(obs))

@clinical_bp.route('/observations/<string:fhir_id>', methods=['GET'])
@jwt_required()
def get_observation(fhir_id):
    obs = Observation.query.filter_by(fhir_id=fhir_id).first_or_404()
    return jsonify(observation_schema.dump(obs))

@clinical_bp.route('/observations/<int:id>', methods=['PUT'])
@jwt_required()
def update_observation_by_id(id):
    obs = Observation.query.get_or_404(id)
    data = request.get_json()
    
    # Parse datetime string if present
    if 'effective_datetime' in data and isinstance(data['effective_datetime'], str):
        try:
            data['effective_datetime'] = datetime.fromisoformat(data['effective_datetime'])
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400
    
    try:
        for key, value in data.items():
            if hasattr(obs, key):
                setattr(obs, key, value)
        db.session.commit()
        return jsonify(observation_schema.dump(obs))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/observations/<string:fhir_id>', methods=['PUT'])
@jwt_required()
def update_observation(fhir_id):
    obs = Observation.query.filter_by(fhir_id=fhir_id).first_or_404()
    data = request.get_json()
    
    try:
        for key, value in data.items():
            if hasattr(obs, key):
                setattr(obs, key, value)
        db.session.commit()
        return jsonify(observation_schema.dump(obs))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/observations/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_observation_by_id(id):
    obs = Observation.query.get_or_404(id)
    db.session.delete(obs)
    db.session.commit()
    return '', 204

@clinical_bp.route('/observations/<string:fhir_id>', methods=['DELETE'])
@jwt_required()
def delete_observation(fhir_id):
    obs = Observation.query.filter_by(fhir_id=fhir_id).first_or_404()
    db.session.delete(obs)
    db.session.commit()
    return '', 204

# Encounters endpoints
@clinical_bp.route('/encounters/<int:id>', methods=['GET'])
@jwt_required()
def get_encounter(id):
    encounter = Encounter.query.get_or_404(id)
    return jsonify(encounter_schema.dump(encounter))

@clinical_bp.route('/encounters/<int:id>', methods=['PUT'])
@jwt_required()
def update_encounter(id):
    encounter = Encounter.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        for key, value in data.items():
            if hasattr(encounter, key):
                setattr(encounter, key, value)
        db.session.commit()
        return jsonify(encounter_schema.dump(encounter))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/encounters/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_encounter(id):
    encounter = Encounter.query.get_or_404(id)
    try:
        db.session.delete(encounter)
        db.session.commit()
        return jsonify({"message": "Encounter deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/encounters', methods=['GET'])
@jwt_required()
def list_encounters():
    patient_id = request.args.get('patient_id', type=int)
    query = Encounter.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    encounters = query.all()
    return jsonify(encounters_schema.dump(encounters))

@clinical_bp.route('/encounters', methods=['POST'])
@jwt_required()
def create_encounter():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    try:
        encounter = Encounter(**data)
        db.session.add(encounter)
        db.session.commit()
        return jsonify(encounter_schema.dump(encounter)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Appointments endpoints
@clinical_bp.route('/appointments/<int:id>', methods=['GET'])
@jwt_required()
def get_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    return jsonify(appointment_schema.dump(appointment))

@clinical_bp.route('/appointments/<int:id>', methods=['PUT'])
@jwt_required()
def update_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        for key, value in data.items():
            if hasattr(appointment, key):
                setattr(appointment, key, value)
        db.session.commit()
        return jsonify(appointment_schema.dump(appointment))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(id):
    appointment = Appointment.query.get_or_404(id)
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"message": "Appointment deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@clinical_bp.route('/appointments', methods=['GET'])
@jwt_required()
def list_appointments():
    try:
        patient_id = request.args.get('patient_id', type=int)
        query = Appointment.query
        if patient_id:
            query = query.filter_by(patient_id=patient_id)
        appointments = query.all()
        result = [{
            'id': a.id,
            'patient_id': a.patient_id,
            'appointment_datetime': a.appointment_datetime.isoformat() if a.appointment_datetime else None,
            'status': a.status,
            'practitioner': a.practitioner,
            'reason': a.reason
        } for a in appointments]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Failed to fetch appointments", "details": str(e)}), 422

@clinical_bp.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    try:
        appointment = Appointment(**data)
        db.session.add(appointment)
        db.session.commit()
        return jsonify(appointment_schema.dump(appointment)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500