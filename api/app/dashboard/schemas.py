from flask import Blueprint, jsonify
from app.appointments.models import Appointment
from app.chat.models import Message, ChatRoom
from app.prescriptions.models import Prescription
from app.monitoring.models import VitalSign
from app.extensions import db

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/clinician/<int:clinician_id>")
def clinician_dashboard(clinician_id):
    upcoming = Appointment.query.filter_by(clinician_id=clinician_id, status="scheduled").count()
    unread_msgs = db.session.query(Message).join(ChatRoom).filter(
        ChatRoom.appointment_id.in_(
            db.session.query(Appointment.id).filter_by(clinician_id=clinician_id)
        )
    ).count()
    rx_count = Prescription.query.filter_by(clinician_id=clinician_id).count()
    return jsonify({
        "upcoming_appointments": upcoming,
        "unread_messages": unread_msgs,
        "recent_prescriptions": rx_count
    })

@dashboard_bp.route("/patient/<int:patient_id>")
def patient_dashboard(patient_id):
    upcoming = Appointment.query.filter_by(patient_id=patient_id, status="scheduled").count()
    msgs = Message.query.join(ChatRoom).filter(
        ChatRoom.appointment_id.in_(
            db.session.query(Appointment.id).filter_by(patient_id=patient_id)
        )
    ).order_by(Message.timestamp.desc()).limit(10).all()
    vitals = VitalSign.query.filter_by(patient_id=patient_id).order_by(VitalSign.timestamp.desc()).limit(5).all()
    return jsonify({
        "upcoming_appointments": upcoming,
        "recent_messages": [{"content": m.content, "timestamp": m.timestamp.isoformat()} for m in msgs],
        "recent_vitals": [{"type": v.type, "value": v.value, "timestamp": v.timestamp.isoformat()} for v in vitals]
    })
