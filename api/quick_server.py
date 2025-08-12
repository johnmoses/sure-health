from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")

# Mock data
patients = [{"id": 1, "first_name": "John", "last_name": "Doe", "gender": "male"}]
appointments = [{"id": 1, "patient_id": 1, "appointment_datetime": "2024-01-15T10:00:00", "status": "scheduled"}]
prescriptions = [{"id": 1, "patient_id": 1, "medication_name": "Aspirin", "status": "active"}]
invoices = [{"id": 1, "patient_id": 1, "amount": 150.0, "status": "pending"}]

@app.route('/patients', methods=['GET'])
def get_patients():
    return jsonify(patients)

@app.route('/clinical/appointments', methods=['GET'])
def get_appointments():
    return jsonify(appointments)

@app.route('/medications/prescriptions', methods=['GET'])
def get_prescriptions():
    return jsonify(prescriptions)

@app.route('/billing/invoices', methods=['GET'])
def get_invoices():
    return jsonify(invoices)

@app.route('/auth/login', methods=['POST'])
def login():
    return jsonify({'access_token': 'test', 'user': {'id': 1, 'username': 'admin'}})

@app.route('/auth/me', methods=['GET'])
def me():
    return jsonify({'user': {'id': 1, 'username': 'admin'}})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)