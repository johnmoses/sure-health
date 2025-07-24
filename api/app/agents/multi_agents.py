from app.llm.model import generate_response


class QAAgent:
    def answer(self, query: str, context: str) -> str:
        prompt_text = (
            f"Answer precisely with this context:\n{context}\nQuestion: {query}"
        )
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt_text},
        ]
        return generate_response(messages, max_tokens=512)


class SymptomCheckerAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are a medical symptom checker. Using the context below, help identify possible causes or advice.\nContext:\n{context}\nPatient Query:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You are a medical symptom checker assistant.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class MedicationInfoAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are a medication expert assistant. Based on the context, provide accurate information about medications including usage, dosage, and side effects.\nContext:\n{context}\nQuestion:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You provide detailed, safe medication advice.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class AppointmentSchedulerAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are an appointment scheduler. Help the patient book, reschedule or cancel appointments based on the context.\nContext:\n{context}\nRequest:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You assist patients with scheduling their healthcare appointments.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class LabResultsInterpreterAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are a lab results assistant. Explain lab reports and test values to patients in an understandable way.\nContext:\n{context}\nQuestion:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "Explain lab results clearly and compassionately for patients.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class HealthEducationAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You provide health education on diet, exercise, lifestyle, and disease prevention using the context.\nContext:\n{context}\nUser Question:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You educate patients on healthy habits and disease prevention.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class BillingInsuranceAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are an assistant specialized in billing and insurance queries. Based on the context below respond accurately.\nContext:\n{context}\nQuestion:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You help with healthcare billing and insurance questions.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class MentalHealthSupportAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are a mental health support companion. Provide empathetic and helpful responses related to anxiety, depression, stress, or mood.\nContext:\n{context}\nUser Query:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You provide compassionate mental health support and resources.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class TechnicalSupportAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = f"You are the technical support representative for the healthcare app. Answer questions or solve problems about app functionality or errors.\nContext:\n{context}\nUser Query:\n{query}"
        messages = [
            {
                "role": "system",
                "content": "You assist users with technical issues and app support.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class PrescriptionAgent:
    def answer(self, query: str, context: str) -> str:
        prompt = (
            "You are a medication expert assistant. "
            "Using the context below, provide medication information or prescription suggestions.\n\n"
            f"Context:\n{context}\nUser Query:\n{query}"
        )
        messages = [
            {
                "role": "system",
                "content": "You provide detailed, safe medication advice.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class EHRAssistantAgent:
    def answer(self, query: str, context: str = "") -> str:
        prompt = (
            "You are a medical assistant AI for EHR queries. "
            "Use the following patient record context if provided.\n\n"
            f"Context:\n{context}\nQuery:\n{query}"
        )
        messages = [
            {
                "role": "system",
                "content": "You provide concise, accurate EHR assistance.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class BillingAgent:
    def answer(self, query: str, context: str = "") -> str:
        """
        Respond to billing-related questions or perform billing workflow using LLM.
        Context can include invoice summaries or payment info to ground answers.
        """
        prompt = (
            "You are a billing assistant for healthcare invoices and payments.\n"
            "Use the context below and answer the user's query accurately and clearly.\n\n"
            f"Context:\n{context}\nQuestion:\n{query}"
        )
        messages = [
            {
                "role": "system",
                "content": "You provide concise billing information and assistance.",
            },
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)


class VideoAgent:
    def answer(self, query: str, context: str = "") -> str:
        prompt = (
            "You are a telemedicine virtual assistant, helping explain session details and generate summaries.\n"
            "Context:\n" + context + "\nQuestion:\n" + query
        )
        messages = [
            {"role": "system", "content": "Provide clear, concise medical session info."},
            {"role": "user", "content": prompt}
        ]
        return generate_response(messages, max_tokens=512)

class VideoSummarizerAgent(VideoAgent):
    """Specialized agent for generating concise summaries of telemedicine video sessions."""
    def answer(self, query: str, context: str = "") -> str:
        prompt = (
            "You are a telemedicine virtual assistant specialized in creating concise summaries of video sessions.\n"
            f"Use the following session context to answer the query:\n{context}\n\nQuestion:\n{query}"
        )
        messages = [
            {"role": "system", "content": "Create clear, concise summaries for telemedicine sessions."},
            {"role": "user", "content": prompt},
        ]
        return generate_response(messages, max_tokens=512)