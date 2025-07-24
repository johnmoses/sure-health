from app.agents.multi_agents import PrescriptionAgent
from app.prescriptions.models import Prescription
from app.extensions import db
from flask import current_app

class PrescriptionService:
    def __init__(self):
        self.agent = PrescriptionAgent()

    def get_medication_advice(self, query: str, context: str = "") -> dict:
        """
        Query the PrescriptionAgent and return parsed advice.
        """
        try:
            # Call the agent
            raw_response = self.agent.answer(query, context)

            # Here you could parse/validate response if structured JSON expected,
            # or just return raw text for display.
            # For simplicity, we return raw text.
            return {"success": True, "advice": raw_response}

        except Exception as e:
            current_app.logger.error(f"PrescriptionService error: {e}", exc_info=True)
            return {"success": False, "message": "Failed to get medication advice."}
