from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from .models import AuditLog
from .schemas import AuditLogSchema
from app.extensions import db

security_bp = Blueprint("security", __name__)

audit_schema = AuditLogSchema()
audits_schema = AuditLogSchema(many=True)


@security_bp.route("/log", methods=["POST"])
@jwt_required()
def log_action():
    json_data = request.get_json(force=True)
    if not json_data:
        return jsonify({"msg": "No input data provided"}), 400
    
    json_data["user_id"] = get_jwt_identity()
    json_data["ip_address"] = request.remote_addr
    
    try:
        data = audit_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 422
    
    log = AuditLog(**data)
    db.session.add(log)
    db.session.commit()
    
    return jsonify(audit_schema.dump(log)), 201


@security_bp.route("/logs/<int:user_id>", methods=["GET"])
@jwt_required()
def get_logs(user_id):
    current_user = get_jwt_identity()
    if user_id != current_user:
        return jsonify({"msg": "Forbidden"}), 403

    # Pagination parameters with defaults
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        if per_page > 100:
            per_page = 100  # max limit to avoid huge queries
    except ValueError:
        return jsonify({"msg": "Invalid pagination parameters"}), 400

    # Optional filtering by event_type
    event_type = request.args.get('event_type', None)

    query = AuditLog.query.filter_by(user_id=user_id)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)

    paginated = query.order_by(AuditLog.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)

    result = {
        "items": audits_schema.dump(paginated.items),
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
        "per_page": paginated.per_page,
        "has_next": paginated.has_next,
        "has_prev": paginated.has_prev,
    }

    return jsonify(result), 200
