from functools import wraps
from flask import request, current_app, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from datetime import datetime
import logging
from app.extensions import db

# HIPAA Audit Log Model
class HIPAAAuditLog(db.Model):
    __tablename__ = 'hipaa_audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    patient_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(50), nullable=False)  # CREATE, READ, UPDATE, DELETE
    resource = db.Column(db.String(100), nullable=False)  # patients, encounters, etc.
    resource_id = db.Column(db.String(50), nullable=True)
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    success = db.Column(db.Boolean, default=True, nullable=False)
    reason = db.Column(db.String(255), nullable=True)  # For failed attempts

def log_hipaa_access(action, resource, resource_id=None, patient_id=None, success=True, reason=None):
    """Log HIPAA-compliant access to PHI"""
    try:
        user_id = get_jwt_identity() if verify_jwt_in_request(optional=True) else None
        
        audit_log = HIPAAAuditLog(
            user_id=user_id,
            patient_id=patient_id,
            action=action,
            resource=resource,
            resource_id=str(resource_id) if resource_id else None,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            success=success,
            reason=reason
        )
        
        db.session.add(audit_log)
        db.session.commit()
        
        current_app.logger.info(
            f"HIPAA Audit: User {user_id} {action} {resource} {resource_id} - Success: {success}"
        )
    except Exception as e:
        current_app.logger.error(f"Failed to log HIPAA audit: {e}")

def hipaa_audit(action, resource):
    """Decorator for HIPAA audit logging"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            resource_id = kwargs.get('id') or kwargs.get('patient_id')
            patient_id = kwargs.get('patient_id')
            
            try:
                result = f(*args, **kwargs)
                log_hipaa_access(action, resource, resource_id, patient_id, success=True)
                return result
            except Exception as e:
                log_hipaa_access(action, resource, resource_id, patient_id, success=False, reason=str(e))
                raise
        return decorated_function
    return decorator

def require_patient_access(patient_id_param='patient_id'):
    """Decorator to ensure user has access to specific patient data"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            patient_id = kwargs.get(patient_id_param)
            
            # Admin and clinician roles can access all patients
            from app.auth.models import User
            user = User.query.get(user_id)
            if user and user.role in ['admin', 'clinician']:
                return f(*args, **kwargs)
            
            # Patient users can only access their own data
            if user and user.role == 'patient':
                from app.patients.models import Patient
                patient = Patient.query.filter_by(user_id=user_id, id=patient_id).first()
                if not patient:
                    log_hipaa_access('READ', 'patient', patient_id, patient_id, success=False, reason='Unauthorized access attempt')
                    return {'error': 'Access denied'}, 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Data encryption utilities
from cryptography.fernet import Fernet
import os

class PHIEncryption:
    """Utility class for encrypting/decrypting PHI data"""
    
    def __init__(self):
        self.cipher = None
    
    def _init_cipher(self):
        if self.cipher is None:
            key = os.environ.get('PHI_ENCRYPTION_KEY')
            if not key:
                # Generate key for development - use proper key management in production
                key = Fernet.generate_key()
                try:
                    from flask import current_app
                    current_app.logger.warning("Using generated encryption key - set PHI_ENCRYPTION_KEY in production")
                except RuntimeError:
                    # Outside application context
                    print("Warning: Using generated encryption key - set PHI_ENCRYPTION_KEY in production")
            
            if isinstance(key, str):
                key = key.encode()
            self.cipher = Fernet(key)
    
    def encrypt(self, data):
        """Encrypt sensitive data"""
        if not data:
            return data
        self._init_cipher()
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data):
        """Decrypt sensitive data"""
        if not encrypted_data:
            return encrypted_data
        self._init_cipher()
        return self.cipher.decrypt(encrypted_data.encode()).decode()

# Global encryption instance
phi_encryption = PHIEncryption()

def mask_phi_data(data, fields_to_mask=None):
    """Mask PHI data for logging/display"""
    if fields_to_mask is None:
        fields_to_mask = ['ssn', 'phone', 'email', 'address', 'first_name', 'last_name']
    
    if isinstance(data, dict):
        masked_data = data.copy()
        for field in fields_to_mask:
            if field in masked_data and masked_data[field]:
                if field == 'ssn':
                    masked_data[field] = 'XXX-XX-' + str(masked_data[field])[-4:]
                elif field in ['first_name', 'last_name']:
                    masked_data[field] = masked_data[field][0] + '*' * (len(masked_data[field]) - 1)
                else:
                    masked_data[field] = '*' * len(str(masked_data[field]))
        return masked_data
    return data