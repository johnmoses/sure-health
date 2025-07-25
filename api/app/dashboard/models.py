from app.extensions import db
from datetime import datetime

class AppMetric(db.Model):
    __tablename__ = 'app_metrics'
    id = db.Column(db.Integer, primary_key=True)
    metric_name = db.Column(db.String(100), nullable=False) # e.g., 'page_hits', 'api_calls_patients'
    value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    # Optional: dimensions for filtering, e.g., 'endpoint', 'user_id'
    dimension_key = db.Column(db.String(100))
    dimension_value = db.Column(db.String(255))

    def __repr__(self):
        return f'<AppMetric {self.metric_name} {self.value} at {self.timestamp}>'

# You might also have models to track specific events
class UserActivity(db.Model):
    __tablename__ = 'user_activity'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Link to auth user
    activity_type = db.Column(db.String(100), nullable=False) # e.g., 'login', 'patient_view', 'chat_message_sent'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    details = db.Column(db.Text) # JSON string or free text for additional context
