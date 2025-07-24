from flask import Blueprint, jsonify, request
from app.appointments import Appointment
from app.prescriptions import Prescription
from app.auth.models import User
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from marshmallow import ValidationError

from app.analytics.schemas import AdvancedAnalyticsSchema
from app.chat.models import ChatSession
from app.video.models import TelemedicineSession
from app.security.models import AuditLog

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard/advanced', methods=['GET'])
def advanced_analytics_dashboard():
    days = int(request.args.get('days', 30))
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    new_users_daily = (
        User.query
        .with_entities(func.date(User.created_at).label('date'), func.count(User.id))
        .filter(User.created_at >= cutoff_date)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
        .all()
    )
    new_users_daily_data = [{'date': r[0], 'count': r[1]} for r in new_users_daily]

    appts_per_clinician = (
        Appointment.query
        .with_entities(Appointment.clinician_id, func.count(Appointment.id).label('count'))
        .filter(Appointment.date >= cutoff_date)
        .group_by(Appointment.clinician_id)
        .order_by(desc('count'))
        .limit(5)
        .all()
    )
    appts_per_clinician_data = [{'clinician_id': r[0], 'count': r[1]} for r in appts_per_clinician]

    prescriptions_by_type = (
        Prescription.query
        .with_entities(Prescription.type, func.count(Prescription.id).label('count'))
        .group_by(Prescription.type)
        .order_by(desc('count'))
        .limit(5)
        .all()
    )
    prescriptions_by_type_data = [{'type': r[0], 'count': r[1]} for r in prescriptions_by_type]

    chat_cutoff = datetime.utcnow() - timedelta(days=7)
    chat_sessions_daily = (
        ChatSession.query
        .with_entities(func.date(ChatSession.created_at).label('date'), func.count(ChatSession.id))
        .filter(ChatSession.created_at >= chat_cutoff)
        .group_by(func.date(ChatSession.created_at))
        .order_by(func.date(ChatSession.created_at))
        .all()
    )
    chat_sessions_daily_data = [{'date': r[0], 'count': r[1]} for r in chat_sessions_daily]

    video_avg_duration = (
        TelemedicineSession.query
        .with_entities(func.avg(TelemedicineSession.duration))
        .filter(TelemedicineSession.start_time >= cutoff_date)
        .scalar()
    ) or 0

    weeks = []
    counts = []
    for i in range(8):
        start_week = datetime.utcnow() - timedelta(weeks=i+1)
        end_week = datetime.utcnow() - timedelta(weeks=i)
        logins_count = AuditLog.query.filter(
            AuditLog.action == "login",
            AuditLog.timestamp >= start_week,
            AuditLog.timestamp < end_week
        ).count()
        weeks.append(f"Week {8 - i}")
        counts.append(logins_count)
    login_trend = list(zip(weeks[::-1], counts[::-1]))

    result = {
        "new_users_daily": new_users_daily_data,
        "appointments_per_clinician": appts_per_clinician_data,
        "prescriptions_by_type": prescriptions_by_type_data,
        "chat_sessions_daily": chat_sessions_daily_data,
        "video_avg_session_duration_sec": round(video_avg_duration, 2),
        "weekly_login_trend": [{"week": w, "count": c} for w, c in login_trend],
    }

    schema = AdvancedAnalyticsSchema()
    try:
        validated_data = schema.load(result)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    return jsonify(schema.dump(validated_data))
