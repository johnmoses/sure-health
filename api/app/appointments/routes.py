from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.appointments.models import Appointment
from app.appointments.schemas import AppointmentSchema
from .services import AppointmentSchedulingService

appointments_bp = Blueprint("appointments", __name__)

appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)

# Instantiate the service
appointment_service = AppointmentSchedulingService()

@appointments_bp.route("/", methods=["POST"])
@jwt_required()
def create_appointment():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON."}), 400

    data = request.get_json()
    errors = appointment_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    user_id = get_jwt_identity()
    if data.get("patient_id") != user_id:
        return jsonify({"error": "You can only create appointments for yourself."}), 403

    appointment = appointment_schema.load(data, session=db.session)
    db.session.add(appointment)
    db.session.commit()
    return appointment_schema.jsonify(appointment), 201


@appointments_bp.route("/", methods=["GET"])
@jwt_required()
def list_appointments():
    user_id = get_jwt_identity()
    appointments = Appointment.query.filter(
        (Appointment.patient_id == user_id) | (Appointment.clinician_id == user_id)
    ).order_by(Appointment.scheduled_time.asc()).all()
    return appointments_schema.jsonify(appointments)


@appointments_bp.route("/<int:appointment_id>", methods=["GET"])
@jwt_required()
def get_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    user_id = get_jwt_identity()
    if user_id not in [appointment.patient_id, appointment.clinician_id]:
        return jsonify({"error": "Access forbidden"}), 403
    return appointment_schema.jsonify(appointment)


@appointments_bp.route("/<int:appointment_id>", methods=["PUT"])
@jwt_required()
def update_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    user_id = get_jwt_identity()
    if user_id not in [appointment.patient_id, appointment.clinician_id]:
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    errors = appointment_schema.validate(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400

    for key, value in data.items():
        setattr(appointment, key, value)

    db.session.commit()
    return appointment_schema.jsonify(appointment)


@appointments_bp.route("/<int:appointment_id>", methods=["DELETE"])
@jwt_required()
def delete_appointment(appointment_id):
    appointment = Appointment.query.get_or_404(appointment_id)
    user_id = get_jwt_identity()
    if user_id not in [appointment.patient_id, appointment.clinician_id]:
        return jsonify({"error": "Access forbidden"}), 403
    db.session.delete(appointment)
    db.session.commit()
    return jsonify({"message": f"Appointment {appointment_id} deleted"}), 200

# --- LLM-powered natural language appointment creation  ---

# --- LLM-powered natural language appointment creation ---
@appointments_bp.route("/nlp_create", methods=["POST"])
@jwt_required()
def nlp_create_appointment():
    data = request.get_json()
    user_id = get_jwt_identity()
    query = data.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    parsed = appointment_service.parse_natural_language_request(query) # Use the service
    if not parsed.get("success"):
        return jsonify({"error": parsed.get("message", "Unable to parse appointment request")}), 422

    appointment_data = {
        "patient_id": user_id,
        "clinician_id": parsed["clinician_id"],
        "scheduled_time": parsed["scheduled_time"],
        "reason": parsed.get("reason", "")
    }
    errors = appointment_schema.validate(appointment_data)
    if errors:
        return jsonify({"errors": errors}), 400

    appointment = appointment_schema.load(appointment_data, session=db.session)
    db.session.add(appointment)
    db.session.commit()
    return appointment_schema.jsonify(appointment), 201

# --- Agent-driven scheduling suggestion and creation ---
@appointments_bp.route("/schedule_suggest", methods=["POST"])
@jwt_required()
def schedule_suggest():
    data = request.get_json()
    user_id = get_jwt_identity()
    query = data.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    proposal = appointment_service.find_and_propose_slot(query, patient_id=user_id) # Use the service
    if not proposal.get("success"):
        return jsonify({"error": proposal.get("message", "No slots available or ambiguous request")}), 422

    appointment_data = proposal["appointment_data"]
    appointment_data["patient_id"] = user_id # Ensure patient_id is set for the current user
    errors = appointment_schema.validate(appointment_data)
    if errors:
        return jsonify({"errors": errors}), 400

    appointment = appointment_schema.load(appointment_data, session=db.session)
    db.session.add(appointment)
    db.session.commit()
    return appointment_schema.jsonify(appointment), 201