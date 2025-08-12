from flask import Blueprint
from flask_restx import Api, Resource, fields
from flask_jwt_extended import jwt_required

# Create API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api/v1')
api = Api(api_bp, 
    title='SureHealth API',
    version='1.0',
    description='Healthcare Management System API',
    doc='/docs/',
    authorizations={
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
    },
    security='Bearer'
)

# Define common models
user_model = api.model('User', {
    'id': fields.Integer(required=True, description='User ID'),
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'role': fields.String(required=True, description='User role')
})

patient_model = api.model('Patient', {
    'id': fields.Integer(required=True, description='Patient ID'),
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'date_of_birth': fields.Date(required=True, description='Date of birth'),
    'gender': fields.String(required=True, description='Gender'),
    'phone': fields.String(description='Phone number'),
    'email': fields.String(description='Email address')
})

@api.route('/health')
class HealthCheck(Resource):
    def get(self):
        """Health check endpoint"""
        return {'status': 'healthy'}

@api.route('/patients')
class PatientList(Resource):
    @api.doc('list_patients')
    @api.marshal_list_with(patient_model)
    @jwt_required()
    def get(self):
        """Fetch all patients"""
        pass
    
    @api.doc('create_patient')
    @api.expect(patient_model)
    @api.marshal_with(patient_model, code=201)
    @jwt_required()
    def post(self):
        """Create a new patient"""
        pass