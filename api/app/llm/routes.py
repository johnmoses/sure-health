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
