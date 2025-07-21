from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import Prescription
from .schemas import PrescriptionSchema
from app.extensions import db

prescriptions_bp = Blueprint("prescriptions", __name__)
prescription_schema = PrescriptionSchema()
prescriptions_schema = PrescriptionSchema(many=True)

@prescriptions_bp.route("/", methods=["POST"])
def create_prescription():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = prescription_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    prescription = Prescription(**data)
    db.session.add(prescription)
    db.session.commit()
    return jsonify(prescription_schema.dump(prescription)), 201

@prescriptions_bp.route("/patient/<int:patient_id>", methods=["GET"])
def list_patient_prescriptions(patient_id):
    prescriptions = Prescription.query.filter_by(patient_id=patient_id).all()
    return jsonify(prescriptions_schema.dump(prescriptions))
