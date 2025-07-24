from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.appointments.models import Appointment
from app.video.models import TelemedicineSession
from app.video.schemas import TelemedicineSessionSchema
from app.agents.orchestrator import MultiAgentService

video_bp = Blueprint("video_bp", __name__)

session_schema = TelemedicineSessionSchema()
sessions_schema = TelemedicineSessionSchema(many=True)
multi_agent_service = MultiAgentService()

@video_bp.route("/", methods=["POST"])
@jwt_required()
def create_session():
    data = request.get_json()
    errors = session_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    # Optionally add user permission checks here relating to appointment ownership
    session = session_schema.load(data, session=db.session)
    db.session.add(session)
    db.session.commit()
    return session_schema.jsonify(session), 201

@video_bp.route("/", methods=["GET"])
@jwt_required()
def list_sessions():
    user_id = get_jwt_identity()
    
    # Print for debug to logs
    print(f"Logged in user id: {user_id}")
    
    # Get all appointments patient IDs linked to user (optional)
    user_appointments = Appointment.query.filter_by(patient_id=user_id).all()
    print(f"User has {len(user_appointments)} appointments")

    # Join with Appointment, filter by patient_id == user_id
    sessions = (
        TelemedicineSession.query
        .join(TelemedicineSession.appointment)
        .filter(Appointment.patient_id == user_id)
        .order_by(TelemedicineSession.started_at.desc())
        .all()
    )
    print(f"Sessions found for patient {user_id}: {len(sessions)}")
    
    schema = TelemedicineSessionSchema(many=True)
    return schema.jsonify(sessions)

@video_bp.route('/all_sessions', methods=['GET'])
@jwt_required()
def list_all_sessions():
    """
    Return all TelemedicineSession records from the database,
    with no filtering by user or appointment.
    """
    sessions = TelemedicineSession.query.order_by(TelemedicineSession.started_at.desc()).all()
    schema = TelemedicineSessionSchema(many=True)
    return schema.jsonify(sessions), 200

@video_bp.route('/<int:session_id>', methods=['GET'])
@jwt_required()
def get_session(session_id):
    user_id = get_jwt_identity()
    session = TelemedicineSession.query.get_or_404(session_id)

    if not session.appointment:
        return jsonify({"error": "Associated appointment not found."}), 404

    if session.appointment.patient_id != user_id:
        return jsonify({"error": "Access forbidden."}), 403

    schema = TelemedicineSessionSchema()
    return schema.jsonify(session)

@video_bp.route('/<int:session_id>', methods=['PUT'])
@jwt_required()
def update_session(session_id):
    user_id = get_jwt_identity()
    session = TelemedicineSession.query.get_or_404(session_id)

    if not session.appointment:
        return jsonify({"error": "Associated appointment not found."}), 404

    if session.appointment.patient_id != user_id:
        return jsonify({"error": "You cannot update this session."}), 403

    data = request.get_json()
    for key, value in data.items():
        setattr(session, key, value)

    db.session.commit()
    schema = TelemedicineSessionSchema()
    return schema.jsonify(session)

@video_bp.route("/<int:session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id):
    session = TelemedicineSession.query.get_or_404(session_id)
    user_id = get_jwt_identity()

    if session.appointment.patient_id != user_id:
        return jsonify({"error": "You cannot delete this session."}), 403

    db.session.delete(session)
    db.session.commit()
    return jsonify({"message": f"Session {session_id} deleted."}), 200

@video_bp.route('/query', methods=['POST'])
@jwt_required()
def video_agent_query():
    data = request.get_json()
    query = data.get('query', '').strip()
    session_id = data.get('session_id')
    agent_key = data.get('agent_key', 'video_summarizer')  # default to video_summarizer

    if not query:
        return jsonify({'error': 'Query is required.'}), 400

    context = ""
    if session_id:
        session = TelemedicineSession.query.get(session_id)
        if session:
            context = (
                f"Appointment ID: {session.appointment_id}\n"
                f"Video URL: {session.video_url or 'N/A'}\n"
                f"Started At: {session.started_at}\n"
                f"Ended At: {session.ended_at or 'Ongoing'}"
            )

    answer = multi_agent_service.route_query(query=query, agent_key=agent_key, context=context)
    return jsonify({"answer": answer})