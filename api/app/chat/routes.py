from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from concurrent.futures import ThreadPoolExecutor

from app.chat.models import ChatRoom, ChatMessage
from app.chat.schemas import ChatRoomSchema, ChatMessageSchema
from app.auth.models import User
from app.llm.model import generate_response
from app.llm.prompt_builder import build_llm_prompt  # updated import path
from app.extensions import db, init_embed_model, search_vectors, get_rag_context
from app.agents.multi_agents import (
    QAAgent, SymptomCheckerAgent, MedicationInfoAgent,
    AppointmentSchedulerAgent, LabResultsInterpreterAgent,
    HealthEducationAgent, BillingInsuranceAgent,
    MentalHealthSupportAgent, TechnicalSupportAgent
)

chat_bp = Blueprint("chat", __name__)

room_schema = ChatRoomSchema()
rooms_schema = ChatRoomSchema(many=True)
message_schema = ChatMessageSchema()
messages_schema = ChatMessageSchema(many=True)

# Mapping keywords to their respective agent instances
AGENT_KEYWORDS = {
    'symptom': SymptomCheckerAgent(),
    'pain': SymptomCheckerAgent(),
    'fatigue': SymptomCheckerAgent(),
    'headache': SymptomCheckerAgent(),

    'medication': MedicationInfoAgent(),
    'dosage': MedicationInfoAgent(),
    'side effects': MedicationInfoAgent(),

    'appointment': AppointmentSchedulerAgent(),
    'schedule': AppointmentSchedulerAgent(),
    'reschedule': AppointmentSchedulerAgent(),
    'cancel': AppointmentSchedulerAgent(),

    'lab': LabResultsInterpreterAgent(),
    'test results': LabResultsInterpreterAgent(),

    'advice': HealthEducationAgent(),
    'diet': HealthEducationAgent(),
    'exercise': HealthEducationAgent(),

    'bill': BillingInsuranceAgent(),
    'payment': BillingInsuranceAgent(),
    'insurance': BillingInsuranceAgent(),

    'anxiety': MentalHealthSupportAgent(),
    'depression': MentalHealthSupportAgent(),
    'stress': MentalHealthSupportAgent(),
    'mood': MentalHealthSupportAgent(),

    'bug': TechnicalSupportAgent(),
    'error': TechnicalSupportAgent(),
    'support': TechnicalSupportAgent(),
}


def get_or_create_bot_user():
    bot_user = User.query.filter_by(username="bot").first()
    if not bot_user:
        bot_user = User(username="bot", role="bot", email="bot@bot")
        bot_user.set_password("bot")
        db.session.add(bot_user)
        db.session.commit()
    return bot_user


def select_agents_for_query(query):
    query_lower = query.lower()
    selected_agents = []
    for keyword, agent in AGENT_KEYWORDS.items():
        if keyword in query_lower and agent not in selected_agents:
            selected_agents.append(agent)
    return selected_agents


def multi_agent_answer(query, context):
    agents = select_agents_for_query(query)
    if not agents:
        agents = [QAAgent()]  # fallback agent

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(agent.answer, query, context) for agent in agents]
        results = [f.result() for f in futures if f.result()]

    return "\n\n".join(results) if results else "Sorry, I couldn't understand your request."


@chat_bp.route('/rooms', methods=['POST'])
def create_room():
    if not request.is_json:
        return jsonify({'error': 'Invalid JSON.'}), 400
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Room name required'}), 400
    if ChatRoom.query.filter_by(name=name).first():
        return jsonify({'error': 'Room already exists'}), 409
    room = ChatRoom(name=name)
    db.session.add(room)
    db.session.commit()
    return room_schema.jsonify(room), 201


@chat_bp.route('/rooms', methods=['GET'])
def list_rooms():
    rooms = ChatRoom.query.all()
    return rooms_schema.jsonify(rooms)


@chat_bp.route('/rooms/<int:room_id>/messages', methods=['GET'])
def room_messages(room_id):
    room = ChatRoom.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404
    messages = ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.asc()).all()
    return messages_schema.jsonify(messages)


@chat_bp.route("/rooms/<int:room_id>/post_message", methods=["POST"])
@jwt_required()
def post_message_and_get_bot_reply(room_id):
    if not request.is_json:
        return jsonify({"error": "Invalid JSON."}), 400

    data = request.json
    content = data.get("content")
    role = data.get("role")  # Expected 'patient' or 'clinician'
    user_id = get_jwt_identity()

    if role not in ["patient", "clinician"]:
        return jsonify({"error": "Invalid role"}), 400
    if not content:
        return jsonify({"error": "Message content required"}), 400

    room = ChatRoom.query.get(room_id)
    if not room:
        return jsonify({"error": "Chat room not found"}), 404

    # Save the user's message
    user_msg = ChatMessage(
        room_id=room_id,
        sender_id=user_id,
        content=content,
        role=role,
        timestamp=datetime.utcnow(),
        is_ai=False,
    )
    db.session.add(user_msg)
    db.session.commit()

    # Collect recent conversation messages for context (latest 20 messages)
    recent_msgs = ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.desc()).limit(20).all()
    recent_msgs.reverse()

    patient_msgs = "\n".join(m.content for m in recent_msgs if m.role == "patient")
    clinician_msgs = "\n".join(m.content for m in recent_msgs if m.role == "clinician")
    bot_msgs = "\n".join(m.content for m in recent_msgs if m.role == "bot")

    # Retrieve documents relevant to the new message
    # collection_name = current_app.config.get("MILVUS_COLLECTION")
    embedding_vector = init_embed_model().encode(content).tolist()
    # docs = search_vectors(embedding_vector, top_k=5, collection_name=collection_name)
    docs = search_vectors(embedding_vector, top_k=5)

    docs_text = "\n".join(r['text'] for r in docs[0]) if docs and docs[0] else ""

    # Build the prompt to send to the LLM
    messages_for_llm = build_llm_prompt(
        user_query=content,
        patient_messages=patient_msgs,
        clinician_messages=clinician_msgs,
        bot_messages=bot_msgs,
        retrieved_context=docs_text,
    )

    # Generate the bot's response
    try:
        bot_reply_text = generate_response(messages_for_llm, max_tokens=512)
    except Exception as e:
        current_app.logger.error(f"LLM generation failed: {e}", exc_info=True)
        bot_reply_text = "Sorry, I couldn't process your request at the moment."

    # Ensure bot user exists
    bot_user = get_or_create_bot_user()

    # Save the bot's reply message
    bot_msg = ChatMessage(
        room_id=room_id,
        sender_id=bot_user.id,
        content=bot_reply_text,
        role="bot",
        timestamp=datetime.utcnow(),
        is_ai=True,
    )
    db.session.add(bot_msg)
    db.session.commit()

    # Serialize entire conversation in chronological order
    conversation = messages_schema.dump(
        ChatMessage.query.filter_by(room_id=room_id).order_by(ChatMessage.timestamp.asc()).all()
    )

    return jsonify({
        "bot_reply": bot_reply_text,
        "conversation": conversation,
    })



@chat_bp.route("/multi_agent_chat", methods=["POST"])
def multi_agent_chat():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON."}), 400

    data = request.json or {}
    query = data.get("query")
    user_id = data.get("user_id")

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    try:
        context = get_rag_context(query)
        response_text = multi_agent_answer(query, context)
        # You may add conversation persistence here if desired
        return jsonify({"response": response_text})
    except Exception as e:
        current_app.logger.error(f"Error in multi_agent_chat: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
