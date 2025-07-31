from flask import request, g, current_app
from datetime import datetime, timedelta
import hashlib

class HIPAAMiddleware:
    """HIPAA compliance middleware for request/response handling"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        app.teardown_appcontext(self.teardown)
    
    def before_request(self):
        """Pre-request HIPAA compliance checks"""
        g.request_start_time = datetime.utcnow()
        g.request_id = self.generate_request_id()
        
        # Log request for audit trail
        if self.is_phi_endpoint():
            current_app.logger.info(
                f"HIPAA Request [{g.request_id}]: {request.method} {request.path} "
                f"from {request.remote_addr}"
            )
    
    def after_request(self, response):
        """Post-request HIPAA compliance processing"""
        if hasattr(g, 'request_start_time'):
            duration = datetime.utcnow() - g.request_start_time
            
            if self.is_phi_endpoint():
                current_app.logger.info(
                    f"HIPAA Response [{g.request_id}]: {response.status_code} "
                    f"in {duration.total_seconds():.3f}s"
                )
        
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response
    
    def teardown(self, exception):
        """Cleanup after request"""
        pass
    
    def generate_request_id(self):
        """Generate unique request ID for audit trail"""
        timestamp = str(datetime.utcnow().timestamp())
        ip = request.remote_addr or 'unknown'
        return hashlib.md5(f"{timestamp}{ip}".encode()).hexdigest()[:8]
    
    def is_phi_endpoint(self):
        """Check if endpoint handles PHI data"""
        phi_endpoints = ['/patients', '/clinical', '/encounters', '/observations']
        return any(endpoint in request.path for endpoint in phi_endpoints)

# Session timeout for HIPAA compliance
class SessionTimeoutManager:
    """Manage session timeouts for HIPAA compliance"""
    
    TIMEOUT_MINUTES = 15  # HIPAA recommended timeout
    
    @staticmethod
    def check_session_timeout():
        """Check if session has timed out"""
        from flask_jwt_extended import get_jwt, verify_jwt_in_request
        
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            
            # Check if token is close to expiry (within 5 minutes)
            exp_timestamp = claims.get('exp', 0)
            current_timestamp = datetime.utcnow().timestamp()
            
            if exp_timestamp - current_timestamp < 300:  # 5 minutes
                return {'warning': 'Session will expire soon'}, 200
                
        except Exception:
            return {'error': 'Session expired'}, 401
        
        return None