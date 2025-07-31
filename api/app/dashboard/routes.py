from flask import Blueprint, jsonify, request
from app.dashboard.services import (
    get_total_users, get_daily_active_users, get_api_call_counts_per_endpoint,
    get_llm_query_counts, get_llm_queries_by_model, get_metric_data
)
from app.dashboard.schemas import AggregatedDataSchema
from app.common.decorators import jwt_required_with_roles
from app.llm.clients import generate_response
from flask_jwt_extended import jwt_required


dashboard_bp = Blueprint('dashboard', __name__)

# Schemas for response serialization
aggregated_data_schema = AggregatedDataSchema(many=True)

@dashboard_bp.route('/metrics/users/total', methods=['GET'])
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer']) # Only authorized roles
def total_users():
    total = get_total_users()
    return jsonify({"total_users": total})

@dashboard_bp.route('/metrics/users/daily-active', methods=['GET'])
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer'])
def daily_active_users():
    days = request.args.get('days', 7, type=int)
    data = get_daily_active_users(days)
    return aggregated_data_schema.jsonify(data)

@dashboard_bp.route('/metrics/api-calls', methods=['GET'])
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer'])
def api_calls_metrics():
    hours = request.args.get('hours', 24, type=int)
    data = get_api_call_counts_per_endpoint(hours)
    return jsonify(data)

@dashboard_bp.route('/metrics/llm-queries/total', methods=['GET'])
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer'])
def llm_query_total():
    hours = request.args.get('hours', 24, type=int)
    total = get_llm_query_counts(hours)
    return jsonify({"total_llm_queries": total})

@dashboard_bp.route('/metrics/llm-queries/by-model', methods=['GET'])
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer'])
def llm_query_by_model():
    hours = request.args.get('hours', 24, type=int)
    data = get_llm_queries_by_model(hours)
    return jsonify(data)

@dashboard_bp.route('/metrics/summary', methods=['GET'])
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer'])
def metrics_summary():
    hours = request.args.get('hours', 24, type=int)
    return jsonify({
        "total_users": get_total_users(),
        "total_llm_queries": get_llm_query_counts(hours),
        "api_calls": get_api_call_counts_per_endpoint(hours),
        "llm_queries_by_model": get_llm_queries_by_model(hours)
    })

# Example: A simple dashboard HTML view (if you plan on a server-rendered dashboard)
# Requires 'templates' folder inside 'dashboard' and 'static' for assets
@dashboard_bp.route('/')
@jwt_required_with_roles(roles=['admin', 'dashboard_viewer'])
def dashboard_home():
    # You would typically render a Jinja2 template here that loads your JS frontend for the dashboard
    return "<h1>Welcome to the EHR Dashboard!</h1><p>API endpoints available for data.</p>"
    # from flask import render_template
    # return render_template('dashboard/index.html') # Requires app/dashboard/templates/dashboard/index.html

@dashboard_bp.route('/metrics/ask-llm', methods=['POST'])
@jwt_required()
def dashboard_ask_llm():
    data = request.get_json()
    question = data.get('question')
    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        raw_metrics = get_metric_data()
        context = f"Current metrics:\n{raw_metrics}"

        messages = [
            {"role": "system", "content": "You are a medical admin dashboard assistant. Interpret metrics and answer dashboard queries clearly."},
            {"role": "user", "content": f"{context}\n\nQ: {question}"}
        ]

        answer = generate_response(messages)
        
        # Handle both string and generator responses
        if hasattr(answer, '__iter__') and not isinstance(answer, str):
            answer = ''.join(answer)
        
        return jsonify({"answer": answer or "No response generated"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
