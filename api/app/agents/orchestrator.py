from flask import current_app
from app.agents.multi_agents import AGENTS


def classify_intent(user_query: str) -> str:
    lower = user_query.lower()
    if any(word in lower for word in ["pain", "symptom", "fever", "ache", "not feeling", "i have"]):
        return "symptom"
    elif any(word in lower for word in ["medication", "drug", "dose", "side effect"]):
        return "medication"
    elif any(word in lower for word in ["bill", "payment", "invoice", "insurance", "cost"]):
        return "billing"
    elif any(word in lower for word in ["prescription", "refill", "medicine", "script"]):
        return "prescription"
    else:
        return "fallback"


def supervisor_agent(user_query: str, context: str) -> str:
    intent = classify_intent(user_query)
    current_app.logger.info(f"Classified intent: {intent}")
    agent = AGENTS.get(intent, AGENTS["fallback"])
    return agent.answer(user_query, context)
