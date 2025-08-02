from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/patients', methods=['GET'])
def test_patients():
    return jsonify([{"id": 1, "name": "Test Patient"}])

@app.route('/clinical/appointments', methods=['GET'])
def test_appointments():
    return jsonify([{"id": 1, "patient_id": 1, "date": "2024-01-15"}])

@app.route('/medications/prescriptions', methods=['GET'])
def test_prescriptions():
    return jsonify([{"id": 1, "medication": "Test Med", "status": "active"}])

@app.route('/billing/invoices', methods=['GET'])
def test_invoices():
    return jsonify([{"id": 1, "amount": 100.0, "status": "pending"}])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)