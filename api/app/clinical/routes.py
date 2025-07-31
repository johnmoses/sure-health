from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.clinical.models import Observation, Encounter, Appointment
from app.clinical.schemas import ObservationSchema, EncounterSchema, AppointmentSchema
from app.extensions import db
from datetime import datetime

clinical_bp = Blueprint('clinical', __name__)

observation_schema = ObservationSchema()
observations_schema = ObservationSchema(many=True)

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