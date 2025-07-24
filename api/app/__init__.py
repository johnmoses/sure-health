from flask import Flask
from flask_cors import CORS
import logging # Import logging to use app.logger directly
from app.extensions import (
    db,
    migrate,
    jwt,
    jwt_blacklist,
    socketio,
    ma,
    init_milvus_client, 
    init_embed_model,
    init_llama_model # Import the Llama initialization function
)
from app.auth.models import User # Make sure User is imported correctly

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

    # --- Register Blueprints ---
    # Using relative imports if possible, or direct if that's your project style
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
    # Add any new blueprints related to AI/RAG here, e.g.:
    # from app.ai_assistant.routes import ai_assistant_bp 

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
    # app.register_blueprint(ai_assistant_bp, url_prefix="/ai") # Example for new AI module

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
        # Note: 'email' field might not exist in your User model, check models.py
        bot = User.query.filter_by(username="bot").first()
        if not bot:
            try:
                # Assuming your User model has username, role, and password
                bot = User(username="bot", role="bot") 
                bot.set_password("bot_password_here") # Set a secure default password
                db.session.add(bot)
                db.session.commit()
                app.logger.info("Created 'bot' user.")
            except Exception as e:
                app.logger.error(f"Failed to create 'bot' user: {e}", exc_info=True)


        # Initialize Milvus Client and Collection
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

        # Initialize Llama Model
        try:
            llama_model_path = app.config.get("LLAMA_MODEL_PATH")
            if not llama_model_path:
                app.logger.warning("LLAMA_MODEL_PATH not configured. Llama model will not be loaded.")
            else:
                # Add n_ctx, n_gpu_layers if you configure them
                init_llama_model(
                    model_path=llama_model_path,
                    n_ctx=app.config.get("LLAMA_N_CTX", 4096), # Example for adding n_ctx from config
                    n_gpu_layers=app.config.get("LLAMA_N_GPU_LAYERS", 0) # Example for GPU layers
                )
                app.logger.info("Llama model initialized successfully.")
        except Exception as e:
            app.logger.error(f"Failed to initialize Llama model: {e}", exc_info=True)
            # This might be critical, consider raising error if Llama is essential

    return app

