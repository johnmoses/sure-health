from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import Appointment
from .schemas import AppointmentSchema
from app.extensions import db
from flask_jwt_extended import jwt_required

appointments_bp = Blueprint("appointments", __name__)
appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)

@appointments_bp.route("/", methods=["POST"])
@jwt_required()
def create_appointment():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = appointment_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    appt = Appointment(**data)
    db.session.add(appt)
    db.session.commit()
    return jsonify(appointment_schema.dump(appt)), 201

@appointments_bp.route("/", methods=["GET"])
@jwt_required()
def list_appointments():
    appts = Appointment.query.all()
    return jsonify(appointments_schema.dump(appts))
