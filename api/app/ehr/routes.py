from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .models import MedicalRecord, LabResult
from .schemas import MedicalRecordSchema
from app.extensions import db

ehr_bp = Blueprint("ehr", __name__)
medical_record_schema = MedicalRecordSchema()
medical_records_schema = MedicalRecordSchema(many=True)

@ehr_bp.route("/records/<int:patient_id>", methods=["GET"])
def get_medical_records(patient_id):
    records = MedicalRecord.query.filter_by(patient_id=patient_id).all()
    return jsonify(medical_records_schema.dump(records))

@ehr_bp.route("/records", methods=["POST"])
def add_medical_record():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"msg": "No input data"}), 400
    try:
        data = medical_record_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 422
    record = MedicalRecord(**data)
    db.session.add(record)
    db.session.commit()
    return jsonify(medical_record_schema.dump(record)), 201
