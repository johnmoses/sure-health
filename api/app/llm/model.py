from app.extensions import init_llama_model
from flask import current_app

_llm_instance = None  # singleton

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        # Access MODEL_PATH from current Flask app config inside app context
        model_path = current_app.config.get("LLAMA_MODEL_PATH")
        if not model_path:
            raise RuntimeError("LLAMA_MODEL_PATH not configured in Flask config.")
        _llm_instance = init_llama_model(model_path)
    return _llm_instance

def generate_response(
    messages: list,
    max_tokens=512,
    temperature=0.7,
    top_p=0.9,
    stop_tokens=None,
):
    model = get_llm()
    stop_tokens = stop_tokens or []

    response = model.create_chat_completion(
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        stop=stop_tokens,
    )
    choices = response.get("choices")
    if not choices or len(choices) == 0:
        raise RuntimeError("LLM returned no choices in response")
    content = choices[0].get("message", {}).get("content")
    if content is None:
        raise RuntimeError("LLM response missing 'content' in message")

    return content.strip()

# def run_nlp_appointment_parser(text):
#     """
#     Use LLM to extract appointment slots from natural language.
#     This would call your LLM API/service and return structured slots.
#     """
#     # Simulate output for now
#     return {
#         "success": True,
#         "clinician_id": 2,
#         "scheduled_time": "2025-08-01T09:00:00Z",
#         "reason": "Checkup"
#     }

# def run_scheduling_agent(query, patient_id):
#     """
#     Simulated multi-agent scheduling logic.
#     Input: user query string, patient id
#     Output: dict with keys success, appointment_data
#     """
#     # Real implementation queries calendars, proposes options, etc.
#     return {
#         "success": True,
#         "appointment_data": {
#             "clinician_id": 3,
#             "scheduled_time": "2025-08-02T14:00:00Z",
#             "reason": "Follow up"
#         }
#     }