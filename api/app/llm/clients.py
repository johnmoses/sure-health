from flask import current_app
from app.extensions import init_llama_model
import threading
import logging

_llm_instance = None
_llm_lock = threading.Lock()

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        with _llm_lock:
            if _llm_instance is None:
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
    stream=False
):
    model = get_llm()
    stop_tokens = stop_tokens or []

    logging.info(f"Calling LLM with messages: {messages}")

    response = model.create_chat_completion(
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        stop=stop_tokens,
        stream=stream,
    )

    logging.info(f"Raw LLM response: {response}")

    if stream:
        for token in response:
            content_piece = token.get('choices', [{}])[0].get('delta', {}).get('content', '')
            logging.debug(f"Streaming token: {content_piece}")
            yield content_piece
        return

    choices = response.get("choices", [])
    if not choices:
        logging.error("LLM returned no choices")
        return "Sorry, I couldn't generate a response at this time."

    content = choices[0].get("message", {}).get("content")
    if content is None or not content.strip():
        logging.warning("LLM response missing or empty 'content' in message")
        return "Sorry, I couldn't generate a response at this time."

    logging.info(f"LLM full content: {content.strip()}")
    return content.strip()
