from app.agents.multi_agents import (
    QAAgent,
    SymptomCheckerAgent,
    MedicationInfoAgent,
    AppointmentSchedulerAgent,
    LabResultsInterpreterAgent,
    HealthEducationAgent,
    BillingInsuranceAgent,
    MentalHealthSupportAgent,
    TechnicalSupportAgent,
    PrescriptionAgent,
    EHRAssistantAgent,
    BillingAgent,
    VideoSummarizerAgent,  # Newly added
)

class MultiAgentService:
    def __init__(self):
        # Map string keys to agent instances
        self.agents = {
            'qa': QAAgent(),
            'symptom_checker': SymptomCheckerAgent(),
            'medication_info': MedicationInfoAgent(),
            'appointment_scheduler': AppointmentSchedulerAgent(),
            'lab_results_interpreter': LabResultsInterpreterAgent(),
            'health_education': HealthEducationAgent(),
            'billing_insurance': BillingInsuranceAgent(),
            'mental_health_support': MentalHealthSupportAgent(),
            'technical_support': TechnicalSupportAgent(),
            'prescription': PrescriptionAgent(),
            'ehr_assistant': EHRAssistantAgent(),
            'billing': BillingAgent(),
            'video_summarizer': VideoSummarizerAgent(),  # Added here
        }

    def route_query(self, query: str, agent_key: str = None, context: str = "") -> str:
        """
        Route the query to a specific agent (by key).
        If agent_key is omitted or unknown, fall back to a default agent or composite answers.
        """
        if agent_key in self.agents:
            agent = self.agents[agent_key]
            return agent.answer(query, context)
        else:
            # Simple fallback: just use QAAgent
            return self.agents['qa'].answer(query, context)
