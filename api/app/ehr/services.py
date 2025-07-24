from app.agents.multi_agents import EHRAssistantAgent
from app.rag.retriever import fetch_context

class EHRService:
    def __init__(self):
        self.agent = EHRAssistantAgent()

    def smart_ehr_query(self, user_query: str, patient_id: int) -> dict:
        context = fetch_context(user_query, patient_id)
        try:
            response = self.agent.answer(user_query, context)
            return {"success": True, "answer": response}
        except Exception as e:
            return {"success": False, "message": str(e)}
