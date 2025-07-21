from flask import Blueprint, render_template
from flask_login import login_required
from app import db
from app.chat.models import Message
from app.appointments.models import Appointment
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__, template_folder='../templates')

@analytics_bp.route('/dashboard')
@login_required
def analytics_dashboard():
    appointment_stats = db.session.query(
        func.strftime('%Y-%m-%d', Appointment.scheduled_time).label('day'),
        func.count(Appointment.id)
    ).group_by('day').order_by('day').limit(7).all()
    
    message_stats = db.session.query(
        func.strftime('%Y-%m-%d', Message.timestamp).label('day'),
        func.count(Message.id)
    ).group_by('day').order_by('day').limit(7).all()

    # va_stats = db.session.query(
    #     func.strftime('%Y-%m-%d', VirtualAssistantLog.timestamp).label('day'),
    #     func.count(VirtualAssistantLog.id)
    # ).group_by('day').order_by('day').limit(7).all()

    return render_template('analytics_dashboard.html',
                           appointment_stats=appointment_stats,
                           message_stats=message_stats)
