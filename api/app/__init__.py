from flask import Flask
from app.extensions import db, migrate, jwt, socketio, ma, init_milvus_client

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app)
    ma.init_app(app)

    # Import and register blueprints
    from app.auth.routes import auth_bp
    from app.appointments.routes import appointments_bp
    from app.chat.routes import chat_bp
    from app.video.routes import video_bp
    from app.prescriptions.routes import prescriptions_bp
    from app.ehr.routes import ehr_bp
    from app.monitoring.routes import monitoring_bp
    from app.security.routes import security_bp
    from app.billing.routes import billing_bp
    from app.dashboard.routes import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(appointments_bp, url_prefix="/appointments")
    app.register_blueprint(chat_bp, url_prefix="/chat")
    app.register_blueprint(video_bp, url_prefix="/video")
    app.register_blueprint(prescriptions_bp, url_prefix="/prescriptions")
    app.register_blueprint(ehr_bp, url_prefix="/ehr")
    app.register_blueprint(monitoring_bp, url_prefix="/monitoring")
    app.register_blueprint(security_bp, url_prefix="/security")
    app.register_blueprint(billing_bp, url_prefix="/billing")
    app.register_blueprint(dashboard_bp, url_prefix="/dashboard")

    # Initialize Milvus Lite client with DB file
    with app.app_context():
        # Initialize db
        db.create_all()
        # Initialize Milvus Lite client and collection
        init_milvus_client()

    return app
