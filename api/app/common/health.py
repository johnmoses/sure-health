from flask import Blueprint, jsonify, current_app
from app.extensions import db, get_milvus_client
from datetime import datetime
import psutil
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """Detailed health check with component status"""
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'components': {}
    }
    
    # Database health
    try:
        db.session.execute('SELECT 1')
        health_status['components']['database'] = {'status': 'healthy'}
    except Exception as e:
        health_status['components']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health_status['status'] = 'unhealthy'
    
    # Milvus health
    try:
        client = get_milvus_client()
        health_status['components']['milvus'] = {'status': 'healthy'}
    except Exception as e:
        health_status['components']['milvus'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health_status['status'] = 'degraded'
    
    # System resources
    try:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        health_status['components']['system'] = {
            'status': 'healthy',
            'memory_percent': memory.percent,
            'disk_percent': disk.percent,
            'cpu_percent': psutil.cpu_percent(interval=1)
        }
    except Exception as e:
        health_status['components']['system'] = {
            'status': 'unknown',
            'error': str(e)
        }
    
    return jsonify(health_status)

@health_bp.route('/metrics', methods=['GET'])
def metrics():
    """Basic metrics endpoint"""
    try:
        # Database metrics
        from app.auth.models import User
        from app.patients.models import Patient
        
        user_count = User.query.count()
        patient_count = Patient.query.count()
        
        return jsonify({
            'users_total': user_count,
            'patients_total': patient_count,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'error': 'Failed to collect metrics',
            'message': str(e)
        }), 500