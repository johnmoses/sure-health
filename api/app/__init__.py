from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.extensions import (
    db,
    migrate,
    jwt,
    jwt_blacklist,
    socketio,
    ma,
    init_milvus_client, 
    init_embed_model
)
from app.auth.models import User
from app.common.hipaa_middleware import HIPAAMiddleware
from app.common.error_handlers import register_error_handlers

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])


    # --- Initialize Flask extensions ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app)
    ma.init_app(app)
    
    # Initialize HIPAA compliance middleware
    HIPAAMiddleware(app)
    
    # Initialize rate limiting for HIPAA compliance
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["100 per hour", "20 per minute"],
        storage_uri=app.config.get("RATELIMIT_STORAGE_URL", "memory://")
    )
    limiter.init_app(app)
    
    # Register error handlers
    register_error_handlers(app)

    # --- Register Blueprints ---
    from app.auth.routes import auth_bp
    from app.chat.routes import chat_bp
    from app.patients.routes import patients_bp
    from app.clinical.routes import clinical_bp
    from app.medications.routes import medications_bp
    from app.billing.routes import billing_bp
    from app.dashboard.routes import dashboard_bp
    from app.llm.routes import llm_bp
    from app.common.health import health_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(patients_bp, url_prefix="/api/patients")
    app.register_blueprint(clinical_bp, url_prefix="/api/clinical")
    app.register_blueprint(medications_bp, url_prefix="/api/medications")
    app.register_blueprint(billing_bp, url_prefix="/api/billing")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(llm_bp, url_prefix="/api/llm")

    # --- JWT Token Revocation (Blacklist) ---
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return jti in jwt_blacklist

    # --- Application Context Initializations (DB, Milvus, Models) ---
    with app.app_context():
        # Initialize Database Tables (for dev/first run; use Flask-Migrate in prod)
        db.create_all()

        # Ensure 'bot' user exists for AI/RAG interactions
        bot = User.query.filter_by(username="bot").first()
        if not bot:
            try:
                bot = User(username="bot", email="bot@surehealth.ai", role="bot") 
                bot.set_password("secure_bot_password_2024") 
                db.session.add(bot)
                db.session.commit()
                app.logger.info("Created 'bot' user.")
            except Exception as e:
                app.logger.error(f"Failed to create 'bot' user: {e}", exc_info=True)
                db.session.rollback()


        # Initialize Milvus Client and Collection 
        # help generate postman collections for the routes including auth, chat, patients, clinical, medications, billing, dashboard
        try:
            milvus_db_path = app.config.get("MILVUS_DB_PATH")
            milvus_collection = app.config.get("MILVUS_COLLECTION")
            milvus_dimension = app.config.get("MILVUS_DIMENSION")
            
            if not all([milvus_db_path, milvus_collection, milvus_dimension]):
                app.logger.error("Missing Milvus configuration. Check MILVUS_DB_PATH, MILVUS_COLLECTION, MILVUS_DIMENSION in config.py")
                # Decide if you want to raise an error and prevent startup, or continue with warning
                raise RuntimeError("Milvus configuration missing.")
                
            init_milvus_client(
                db_path=milvus_db_path,
                collection=milvus_collection,
                dim=milvus_dimension,
            )
            app.logger.info("Milvus client initialized successfully.")
        except Exception as e:
            app.logger.error(f"Failed to initialize Milvus client: {e}", exc_info=True)
            # Depending on criticality, you might want to re-raise or sys.exit(1)

        # Initialize Embedding Model
        try:
            embed_model_name = app.config.get("EMBED_MODEL_NAME")
            if not embed_model_name:
                app.logger.error("Missing Embedding Model configuration (EMBED_MODEL_NAME).")
                raise RuntimeError("Embedding Model configuration missing.")
            init_embed_model(model_name=embed_model_name)
            app.logger.info("Embedding model initialized successfully.")
        except Exception as e:
            app.logger.error(f"Failed to initialize embedding model: {e}", exc_info=True)

        # Llama Model - using lazy loading to prevent segfault
        app.logger.info("Llama model will be loaded on first use (lazy loading).")

    return app

