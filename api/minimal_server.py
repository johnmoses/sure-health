from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DB_PATH = 'surehealth.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/patients', methods=['GET'])
def list_patients():
    try:
        conn = get_db()
        patients = conn.execute('SELECT * FROM patients').fetchall()
        conn.close()
        return jsonify([dict(p) for p in patients])
    except Exception as e:
        return jsonify([])

@app.route('/clinical/appointments', methods=['GET'])
def list_appointments():
    try:
        conn = get_db()
        appointments = conn.execute('SELECT * FROM appointments').fetchall()
        conn.close()
        return jsonify([dict(a) for a in appointments])
    except Exception as e:
        return jsonify([])

@app.route('/medications/prescriptions', methods=['GET'])
def list_prescriptions():
    try:
        conn = get_db()
        prescriptions = conn.execute('SELECT * FROM prescriptions').fetchall()
        conn.close()
        return jsonify([dict(p) for p in prescriptions])
    except Exception as e:
        return jsonify([])

@app.route('/billing/invoices', methods=['GET'])
def list_invoices():
    try:
        conn = get_db()
        invoices = conn.execute('SELECT * FROM invoices').fetchall()
        conn.close()
        return jsonify([dict(i) for i in invoices])
    except Exception as e:
        return jsonify([])

@app.route('/auth/login', methods=['POST'])
def login():
    return jsonify({
        'access_token': 'test_token',
        'user': {'id': 1, 'username': 'admin', 'email': 'admin@test.com', 'role': 'admin'}
    })

@app.route('/auth/me', methods=['GET'])
def me():
    return jsonify({
        'user': {'id': 1, 'username': 'admin', 'email': 'admin@test.com', 'role': 'admin'}
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)