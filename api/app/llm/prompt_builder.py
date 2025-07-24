from datetime import datetime
from textwrap import dedent

def build_llm_prompt(
    user_query: str,
    patient_messages: str,
    clinician_messages: str,
    bot_messages: str,
    retrieved_context: str,
) -> list:
    """
    Constructs a prompt formatted as messages for the LLM containing:
    - System instructions (assistant role)
    - Retrieved context (RAG)
    - Conversation history
    - Current user query with current time

    Returns:
        List[Dict]: List of messages formatted for chat LLM.
    """

    current_date = datetime.utcnow().strftime("%A, %B %d, %Y, %I:%M %p UTC")

    system_message = dedent("""
        You are a highly knowledgeable and compassionate healthcare assistant. Your role is to help patients and clinicians by answering medical questions, interpreting symptoms, guiding appointment scheduling, explaining lab results, and providing clear, evidence-based health education. Always prioritize patient safety, clarity, and empathy.

        Use the provided context information carefully, cite it when relevant, and avoid making assumptions if the information is not present.
    """).strip()

    context_section = retrieved_context.strip() if retrieved_context else "No additional context available."

    conversation_section = dedent(f"""
        Conversation history:

        Patient:
        {patient_messages}

        Clinician:
        {clinician_messages}

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

    # Return messages in chat format
    return [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_prompt},
    ]
