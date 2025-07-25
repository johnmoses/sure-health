from datetime import datetime
from app.extensions import db

class PromptTemplate(db.Model):
    __tablename__ = 'prompt_templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    template_text = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LLMQueryLog(db.Model):
    __tablename__ = 'llm_query_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)  # Link to auth user ID, if available
    prompt = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text)
    model_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
