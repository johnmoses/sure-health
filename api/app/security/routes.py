from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import AuditLog
from .schemas import AuditLogSchema
from app.extensions import db

security_bp = Blueprint("security", __name__)
audit_schema = AuditLogSchema()
audits_schema = AuditLogSchema(many=True)

@security_bp.route("/log", methods=["POST"])
def log_action():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = audit_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    log = AuditLog(user_id=data["user_id"], action=data["action"], ip_address=request.remote_addr)
    db.session.add(log)
    db.session.commit()
    return jsonify(audit_schema.dump(log)), 201

@security_bp.route("/logs/<int:user_id>", methods=["GET"])
def get_logs(user_id):
    logs = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return jsonify(audits_schema.dump(logs))
