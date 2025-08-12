from datetime import datetime
from textwrap import dedent

def build_llm_prompt(
    user_query: str,
    patient_messages: str,
    clinician_messages: str,
    admin_messages: str,
    bot_messages: str,
    retrieved_context: str,
) -> list:
    """
    Constructs chat messages for the LLM input with:
    - System prompt defining assistant behavior
    - Few-shot example user-assistant dialogs as demonstration
    - User prompt containing:
        - Current time
        - Retrieved documents/context
        - Conversation history separated by role
        - Current user query
        - Instructions on response style

    Returns:
        List[Dict]: List of messages with "role" and "content" keys
    """

    current_date = datetime.utcnow().strftime("%A, %B %d, %Y, %I:%M %p UTC")

    system_message = dedent("""
        You are a highly knowledgeable and compassionate healthcare assistant. Your role is to assist patients, clinicians, and admins by answering medical questions, interpreting symptoms, supporting appointment scheduling, explaining lab results, and providing clear, evidence-based health education. Always prioritize patient safety, accuracy, and empathy.
    """).strip()

    # Few-shot examples to guide the assistant's tone and style
    few_shot_examples = dedent("""
        Patient: I have a headache and fever.
        Assistant: I'm sorry to hear that you're not feeling well. Could you tell me when your symptoms started and if you've taken any medication?

        Patient: When can I schedule my next appointment?
        Assistant: Let me check the next available slots. May I have your full name and reason for the visit?

        Patient: Can you explain my lab results from last week?
        Assistant: Sure, please provide the name of the test and any specific values or concerns you have.
    """).strip()

    # Use retrieved context or fallback
    context_section = retrieved_context.strip() if retrieved_context else "No additional context available."

    conversation_section = dedent(f"""
        Conversation history:

        Patient:
        {patient_messages}

        Clinician:
        {clinician_messages}

        Admin:
        {admin_messages}

        Bot:
        {bot_messages}
    """).strip()

    user_prompt = dedent(f"""
        Current date and time: {current_date}

        Context information relevant to the user's query:
        {context_section}

        {conversation_section}

        User Query:
        {user_query}

        Please provide a clear, accurate, concise, and empathetic response to the user's current question.
    """).strip()

    # Return messages list in chat format with few-shot examples as a user message before the actual query
    return [
        {"role": "system", "content": system_message},
        {"role": "user", "content": few_shot_examples},
        {"role": "user", "content": user_prompt},
    ]
