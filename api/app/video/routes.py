from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import TelemedicineSession
from .schemas import TelemedicineSessionSchema
from app.extensions import db
from datetime import datetime

video_bp = Blueprint("video", __name__)
session_schema = TelemedicineSessionSchema()

@video_bp.route("/start", methods=["POST"])
def start_session():
    json_data = request.get_json()
    if not json_data or "appointment_id" not in json_data:
        return jsonify({"msg": "Missing appointment_id"}), 400
    session = TelemedicineSession(
        appointment_id=json_data["appointment_id"],
        video_url=f"https://video.service/session/{json_data['appointment_id']}",
        started_at=datetime.utcnow()
    )
    db.session.add(session)
    db.session.commit()
    return jsonify(session_schema.dump(session))

@video_bp.route("/end", methods=["POST"])
def end_session():
    json_data = request.get_json()
    if not json_data or "session_id" not in json_data:
        return jsonify({"msg": "Missing session_id"}), 400
    session = TelemedicineSession.query.get(json_data["session_id"])
    if not session:
        return jsonify({"msg": "Session not found"}), 404
    session.ended_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"msg": "Session ended"})
