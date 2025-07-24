from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.ehr.models import MedicalRecord, LabResult
from app.ehr.schemas import MedicalRecordSchema, LabResultSchema
from app.ehr.services import EHRService

ehr_bp = Blueprint("ehr_bp", __name__)

medical_record_schema = MedicalRecordSchema()
medical_records_schema = MedicalRecordSchema(many=True)
lab_result_schema = LabResultSchema()
lab_results_schema = LabResultSchema(many=True)

ehr_service = EHRService()

# Helpers (adjust as per your auth model)
def is_user_clinician(user_id):
    from app.auth.models import User
    user = User.query.get(user_id)
    return user and user.role == "clinician"

# MedicalRecord endpoints

@ehr_bp.route("/medical_records", methods=["POST"])
@jwt_required()
def create_medical_record():
    data = request.get_json()
    user_id = get_jwt_identity()

    if "patient_id" not in data or "clinician_id" not in data:
        return jsonify({"error": "patient_id and clinician_id are required."}), 400

    if user_id != data.get("clinician_id") and not is_user_clinician(user_id):
        return jsonify({"error": "Only clinicians can create medical records."}), 403

    errors = medical_record_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    record = medical_record_schema.load(data, session=db.session)
    db.session.add(record)
    db.session.commit()

    return medical_record_schema.jsonify(record), 201

@ehr_bp.route("/medical_records", methods=["GET"])
@jwt_required()
def list_medical_records():
    user_id = get_jwt_identity()
    if is_user_clinician(user_id):
        records = MedicalRecord.query.order_by(MedicalRecord.record_date.desc()).all()
    else:
        records = MedicalRecord.query.filter_by(patient_id=user_id).order_by(MedicalRecord.record_date.desc()).all()
    return medical_records_schema.jsonify(records)

@ehr_bp.route("/medical_records/<int:record_id>", methods=["GET"])
@jwt_required()
def get_medical_record(record_id):
    record = MedicalRecord.query.get_or_404(record_id)
    user_id = get_jwt_identity()
    if user_id != record.patient_id and not is_user_clinician(user_id):
        return jsonify({"error": "Access forbidden."}), 403
    return medical_record_schema.jsonify(record)

@ehr_bp.route("/medical_records/<int:record_id>", methods=["PUT"])
@jwt_required()
def update_medical_record(record_id):
    record = MedicalRecord.query.get_or_404(record_id)
    user_id = get_jwt_identity()

    if user_id != record.clinician_id and not is_user_clinician(user_id):
        return jsonify({"error": "You cannot update this medical record."}), 403

    data = request.get_json()
    errors = medical_record_schema.validate(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400

    for key, value in data.items():
        setattr(record, key, value)

    db.session.commit()
    return medical_record_schema.jsonify(record)

@ehr_bp.route("/medical_records/<int:record_id>", methods=["DELETE"])
@jwt_required()
def delete_medical_record(record_id):
    record = MedicalRecord.query.get_or_404(record_id)
    user_id = get_jwt_identity()

    if not is_user_clinician(user_id):
        return jsonify({"error": "Only clinicians can delete medical records."}), 403

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": f"Medical record {record_id} deleted."}), 200


# LabResult endpoints

@ehr_bp.route("/medical_records/<int:record_id>/lab_results", methods=["POST"])
@jwt_required()
def create_lab_result(record_id):
    record = MedicalRecord.query.get_or_404(record_id)
    user_id = get_jwt_identity()

    if user_id != record.clinician_id and not is_user_clinician(user_id):
        return jsonify({"error": "Only clinicians can add lab results."}), 403

    data = request.get_json()
    data["medical_record_id"] = record_id

    errors = lab_result_schema.validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    lab_result = lab_result_schema.load(data, session=db.session)
    db.session.add(lab_result)
    db.session.commit()
    return lab_result_schema.jsonify(lab_result), 201

@ehr_bp.route("/medical_records/<int:record_id>/lab_results", methods=["GET"])
@jwt_required()
def list_lab_results(record_id):
    record = MedicalRecord.query.get_or_404(record_id)
    user_id = get_jwt_identity()
    if user_id != record.patient_id and not is_user_clinician(user_id):
        return jsonify({"error": "Access forbidden."}), 403

    results = LabResult.query.filter_by(medical_record_id=record_id).all()
    return lab_results_schema.jsonify(results)

@ehr_bp.route("/lab_results/<int:lab_result_id>", methods=["GET"])
@jwt_required()
def get_lab_result(lab_result_id):
    result = LabResult.query.get_or_404(lab_result_id)
    user_id = get_jwt_identity()
    if user_id != result.medical_record.patient_id and not is_user_clinician(user_id):
        return jsonify({"error": "Access forbidden."}), 403
    return lab_result_schema.jsonify(result)

@ehr_bp.route("/lab_results/<int:lab_result_id>", methods=["PUT"])
@jwt_required()
def update_lab_result(lab_result_id):
    result = LabResult.query.get_or_404(lab_result_id)
    user_id = get_jwt_identity()

    if user_id != result.medical_record.clinician_id and not is_user_clinician(user_id):
        return jsonify({"error": "You cannot update this lab result."}), 403

    data = request.get_json()
    errors = lab_result_schema.validate(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400

    for key, value in data.items():
        setattr(result, key, value)

    db.session.commit()
    return lab_result_schema.jsonify(result)

@ehr_bp.route("/lab_results/<int:lab_result_id>", methods=["DELETE"])
@jwt_required()
def delete_lab_result(lab_result_id):
    result = LabResult.query.get_or_404(lab_result_id)
    user_id = get_jwt_identity()

    if not is_user_clinician(user_id):
        return jsonify({"error": "Only clinicians can delete lab results."}), 403

    db.session.delete(result)
    db.session.commit()
    return jsonify({"message": f"Lab result {lab_result_id} deleted."}), 200

@ehr_bp.route("/qa", methods=["POST"])
@jwt_required()
def query_ehr():
    user_id = get_jwt_identity()
    data = request.get_json()
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"error": "Query is required."}), 400
    # Optionally add role/permission checks here
    answer = ehr_service.smart_ehr_query(query, patient_id=user_id)
    return jsonify(answer), 200 if answer.get("success") else 500
