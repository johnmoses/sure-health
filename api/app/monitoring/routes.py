from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import Schema, fields, ValidationError, validates
from app.extensions import db
from app.monitoring.models import VitalSign
from datetime import datetime

monitoring_bp = Blueprint('monitoring_bp', __name__)


# -------- Marshmallow Schemas --------

class VitalSignSchema(Schema):
    id = fields.Int(dump_only=True)
    patient_id = fields.Int(required=True)
    type = fields.Str(required=True)
    value = fields.Str(required=True)
    timestamp = fields.DateTime(missing=lambda: datetime.utcnow())

    @validates('type')
    def validate_type(self, value):
        if not value or len(value.strip()) == 0:
            raise ValidationError("Type must not be empty")

    @validates('value')
    def validate_value(self, value):
        if not value or len(value.strip()) == 0:
            raise ValidationError("Value must not be empty")


vital_sign_schema = VitalSignSchema()
vital_signs_schema = VitalSignSchema(many=True)


# -------- Routes --------

@monitoring_bp.route('/vitals', methods=['POST'])
@jwt_required()
def add_vital_sign():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data provided"}), 400
    try:
        data = vital_sign_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422

    vital = VitalSign(**data)
    db.session.add(vital)
    db.session.commit()

    result = vital_sign_schema.dump(vital)  # Serialize model instance to dict
    return jsonify(result), 201


@monitoring_bp.route('/vitals/<int:patient_id>', methods=['GET'])
@jwt_required()
def list_vital_signs(patient_id):
    vtype = request.args.get('type', None)

    query = VitalSign.query.filter_by(patient_id=patient_id)
    if vtype:
        query = query.filter_by(type=vtype)

    vitals = query.order_by(VitalSign.timestamp.desc()).all()
    result = vital_signs_schema.dump(vitals)
    return jsonify(result), 200


@monitoring_bp.route('/vitals/latest/<int:patient_id>', methods=['GET'])
@jwt_required()
def latest_vital_signs(patient_id):
    subquery = db.session.query(
        VitalSign.type,
        db.func.max(VitalSign.timestamp).label('max_ts')
    ).filter_by(patient_id=patient_id).group_by(VitalSign.type).subquery()

    latests = db.session.query(VitalSign).join(
        subquery,
        (VitalSign.type == subquery.c.type) & (VitalSign.timestamp == subquery.c.max_ts)
    ).all()

    result = vital_signs_schema.dump(latests)
    return jsonify(result), 200
