from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import VitalSign
from .schemas import VitalSignSchema
from app.extensions import db

monitoring_bp = Blueprint("monitoring", __name__)
vital_schema = VitalSignSchema()
vitals_schema = VitalSignSchema(many=True)

@monitoring_bp.route("/vitals", methods=["POST"])
def add_vital():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = vital_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    vital = VitalSign(**data)
    db.session.add(vital)
    db.session.commit()
    return jsonify(vital_schema.dump(vital)), 201

@monitoring_bp.route("/vitals/<int:patient_id>", methods=["GET"])
def get_vitals(patient_id):
    vitals = VitalSign.query.filter_by(patient_id=patient_id).order_by(VitalSign.timestamp.desc()).limit(20).all()
    return jsonify(vitals_schema.dump(vitals))
