from flask import Blueprint, request, jsonify, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.llm.schemas import LLMQuerySchema
from app.llm.services import process_llm_query

llm_bp = Blueprint('llm', __name__)

llm_query_schema = LLMQuerySchema()

@llm_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat_completion():
    data = request.get_json()
    errors = llm_query_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    messages = data['messages']
    max_tokens = data.get('max_tokens', 512)
    temperature = data.get('temperature', 0.7)
    top_p = data.get('top_p', 0.9)
    stop_tokens = data.get('stop_tokens')
    stream = data.get('stream', False)
    user_id = get_jwt_identity()

    if stream:
        def generate():
            yield from process_llm_query(
                messages,
                user_id=user_id,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop_tokens=stop_tokens,
                stream=True,
            )
        return Response(stream_with_context(generate()), mimetype='text/plain')

    else:
        response = process_llm_query(
            messages,
            user_id=user_id,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stop_tokens=stop_tokens,
            stream=False,
        )
        return jsonify({"response": response})

@llm_bp.route('/health', methods=['GET'])
@jwt_required()
def llm_health():
    try:
        from flask import current_app
        import os
        
        # Check if model path exists
        model_path = current_app.config.get("LLAMA_MODEL_PATH")
        if not model_path:
            return jsonify({
                "status": "unhealthy",
                "llm_available": False,
                "error": "LLAMA_MODEL_PATH not configured"
            }), 500
        
        if not os.path.exists(model_path):
            return jsonify({
                "status": "unhealthy",
                "llm_available": False,
                "error": f"Model file not found: {model_path}"
            }), 500
        
        from app.llm.clients import generate_response
        
        # Test LLM with simple message
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'OK' if you are working."}
        ]
        
        response_text = generate_response(test_messages)
        
        if response_text and response_text.strip():
            return jsonify({
                "status": "healthy",
                "llm_available": True,
                "test_response": response_text[:50] + "..." if len(response_text) > 50 else response_text
            })
        else:
            return jsonify({
                "status": "degraded",
                "llm_available": False,
                "message": "LLM not responding"
            })
            
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "llm_available": False,
            "error": str(e)
        }), 500


