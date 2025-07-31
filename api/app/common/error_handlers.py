from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from marshmallow import ValidationError
import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(e):
        logger.warning(f"Validation error: {e.messages}")
        return jsonify({
            "error": "Validation failed",
            "messages": e.messages
        }), 400

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(e):
        logger.error(f"Database integrity error: {str(e)}")
        return jsonify({
            "error": "Database constraint violation",
            "message": "The operation violates database constraints"
        }), 409

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(e):
        logger.error(f"Database error: {str(e)}")
        return jsonify({
            "error": "Database error",
            "message": "An error occurred while processing your request"
        }), 500

    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        return jsonify({
            "error": e.name,
            "message": e.description
        }), e.code

    @app.errorhandler(Exception)
    def handle_generic_error(e):
        logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
        if current_app.debug:
            return jsonify({
                "error": "Internal server error",
                "message": str(e)
            }), 500
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }), 500