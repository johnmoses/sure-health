from flask import Blueprint, jsonify
from app.auth.models import User
from app.appointments.models import Appointment
from app.billing.models import Payment, Invoice
from app.chat.models import ChatRoom
from app.prescriptions.models import Prescription
from app.video.models import TelemedicineSession
from app.monitoring.models import VitalSign

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route('/summary', methods=['GET'])
def dashboard_summary():
    """
    Provides aggregated summary metrics across app parts:
    - Total users
    - Active appointments
    - Total billings
    - Active chat sessions
    - Prescriptions count
    - Telemedicine video sessions count
    - Recorded vital signs count
    """

    total_users = User.query.count()
    active_appointments = Appointment.query.filter(Appointment.status == 'active').count()
    total_billings = Invoice.query.count()
    active_chat_sessions = ChatRoom.query.count()
    prescriptions_count = Prescription.query.count()
    video_sessions_count = TelemedicineSession.query.count()
    vital_signs_count = VitalSign.query.count()

    data = {
        "total_users": total_users,
        "active_appointments": active_appointments,
        "total_billings": total_billings,
        "active_chat_sessions": active_chat_sessions,
        "prescriptions_count": prescriptions_count,
        "video_sessions_count": video_sessions_count,
        "vital_signs_count": vital_signs_count,
    }

    return jsonify(data)
