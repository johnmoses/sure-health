from app.llm.clients import generate_response
from app.llm.models import LLMQueryLog
from app.extensions import db
from datetime import datetime

def process_llm_query(messages, user_id=None, max_tokens=512, temperature=0.7, top_p=0.9, stop_tokens=None, stream=False):
    """
    Handles the LLM inference call, logs the request, and returns or streams response.
    If stream=True, yields chunks; else returns full response.
    """
    if stream:
        # Stream generator wrapper that logs after streaming finished
        full_response = []

        def generator():
            for chunk in generate_response(
                messages,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop_tokens=stop_tokens,
                stream=True,
            ):
                full_response.append(chunk)
                yield chunk

            # After streaming is done, log full response
            log = LLMQueryLog(
                user_id=user_id,
                prompt=str(messages),
                response="".join(full_response),
                model_name="Meta-Llama-3-8B-Instruct.Q4_K_M.gguf",
                created_at=datetime.utcnow(),
            )
            db.session.add(log)
            db.session.commit()

        return generator()

    else:
        # Non-streaming: call generate_response and log immediately
        response_text = generate_response(
            messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stop_tokens=stop_tokens,
            stream=False,
        )

        log = LLMQueryLog(
            user_id=user_id,
            prompt=str(messages),
            response=response_text,
            model_name="Meta-Llama-3-8B-Instruct.Q4_K_M.gguf",
            created_at=datetime.utcnow(),
        )
        db.session.add(log)
        db.session.commit()

        return response_text
