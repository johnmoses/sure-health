from app.llm.model import generate_response
from typing import Optional
from flask import current_app

class BaseAgent:
    def __init__(self, system_prompt: str, max_tokens: int = 512, temperature: float = 0.7, top_p: float = 0.9):
        self.system_prompt = system_prompt.strip()
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.top_p = top_p

    def build_messages(self, user_query: str, context: Optional[str] = None) -> list:
        prompt_parts = []
        if context:
            prompt_parts.append(f"Context:\n{context.strip()}")
        prompt_parts.append(f"User Query:\n{user_query.strip()}")

        user_content = "\n\n".join(prompt_parts)

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_content},
        ]
        return messages

    def answer(
        self,
        user_query: str,
        context: Optional[str] = None,
    ) -> str:
        messages = self.build_messages(user_query, context)
        try:
            response = generate_response(
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                top_p=self.top_p,
            )
            return response
        except Exception as e:
            current_app.logger.error(f"LLM generation error in {self.__class__.__name__}: {e}", exc_info=True)
            return "Sorry, I couldn't process your request at the moment."


class SymptomCheckerAgent(BaseAgent):
    def __init__(self, max_tokens=512):
        system_prompt = (
            "You are a medical symptom checker assistant. Your goal is to help identify possible "
            "causes or advice using patient's query and relevant medical context. Provide accurate, empathetic, and safe guidance."
        )
        super().__init__(system_prompt=system_prompt, max_tokens=max_tokens)


class MedicationInfoAgent(BaseAgent):
    def __init__(self, max_tokens=512):
        system_prompt = (
            "You are a medication expert assistant. Your role is to provide detailed, safe medication advice, "
            "including information on usage, dosage, and side effects based on patient queries and context."
        )
        super().__init__(system_prompt=system_prompt, max_tokens=max_tokens)


class BillingAgent(BaseAgent):
    def __init__(self, max_tokens=512):
        system_prompt = (
            "You are a billing assistant. Help patients understand billing, insurance, payments, "
            "and related inquiries in a clear, accurate, and empathetic manner."
        )
        super().__init__(system_prompt=system_prompt, max_tokens=max_tokens)


class PrescriptionAgent(BaseAgent):
    def __init__(self, max_tokens=512):
        system_prompt = (
            "You are a prescription assistant. Provide safe, detailed, and accurate information about prescriptions, "
            "including medication instructions, refills, and usage guidance."
        )
        super().__init__(system_prompt=system_prompt, max_tokens=max_tokens)


class FallbackAgent(BaseAgent):
    def __init__(self, max_tokens=512):
        system_prompt = (
            "You are a helpful healthcare assistant. Provide clear, accurate, and empathetic responses "
            "to patient queries based on available context."
        )
        super().__init__(system_prompt=system_prompt, max_tokens=max_tokens)


# Instantiate once for reuse
AGENTS = {
    "symptom": SymptomCheckerAgent(),
    "medication": MedicationInfoAgent(),
    "billing": BillingAgent(),
    "prescription": PrescriptionAgent(),
    "fallback": FallbackAgent(),
}
