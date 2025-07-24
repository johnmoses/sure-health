import re
import json
from datetime import datetime, timedelta
from flask import current_app
from app.llm.model import generate_response
from app.auth.models import User
from app.appointments.models import Appointment
from app.extensions import db

class AppointmentSchedulingService:
    def robust_json_extract(self, text: str) -> dict | None:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if not match:
            return None

        json_str = match.group(0)
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        json_str = re.sub(r'//.*', '', json_str)  # Remove inline comments
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return None

    def parse_natural_language_request(self, query: str) -> dict:
        """
        Uses LLM to extract structured data from a natural language query for appointment creation.
        Returns a dict: {"success": bool, "clinician_id": int, "scheduled_time": str, "reason": str, "message": str}
        """
        prompt = f"""
        You are an intelligent assistant for parsing appointment requests.
        Extract the following information from the user's request in JSON format.
        If a field cannot be found, omit it.
        Provide the 'scheduled_time' in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
        Consider current date and time for relative terms like "tomorrow", "next week".
        Current date: {datetime.now().isoformat()}

        User Request: "{query}"

        JSON fields to extract:
        - "clinician_name": (string, full name of the clinician, if mentioned)
        - "clinician_id": (integer, if identifiable, else null)
        - "date": (string, preferred date for appointment, YYYY-MM-DD)
        - "time": (string, preferred time for appointment, HH:MM:SS)
        - "scheduled_time": (string, combined date and time in ISO 8601, most precise)
        - "reason": (string, reason for the appointment)
        - "action": (string, "book", "reschedule", "cancel")
        - "original_appointment_id": (integer, if action is reschedule/cancel)

        Example JSON output:
        {{
            "clinician_name": "Dr. Smith",
            "date": "2025-08-01",
            "time": "10:30:00",
            "scheduled_time": "2025-08-01T10:30:00Z",
            "reason": "annual checkup",
            "action": "book"
        }}
        """
        messages = [
            {"role": "system", "content": "You are a precise JSON data extractor for appointment requests."},
            {"role": "user", "content": prompt}
        ]

        try:
            # Removed unsupported response_format argument here
            llm_response = generate_response(messages, max_tokens=256)
            
            parsed_data = self.robust_json_extract(llm_response)
            if parsed_data is None:
                current_app.logger.error(f"Failed to parse JSON from NLP appointment output: {llm_response}")
                return {
                    "success": False,
                    "message": "Failed to parse JSON from LLM output.",
                    "llm_output": llm_response
                }

            # Post-processing: resolve clinician_id from name if missing
            if "clinician_name" in parsed_data and not parsed_data.get("clinician_id"):
                clinician = User.query.filter_by(
                    username=parsed_data["clinician_name"], role="clinician"
                ).first()
                if clinician:
                    parsed_data["clinician_id"] = clinician.id
                else:
                    return {"success": False, "message": "Clinician not found by name."}

            if "scheduled_time" not in parsed_data or not parsed_data.get("clinician_id"):
                return {
                    "success": False,
                    "message": "Could not extract essential appointment details (clinician or scheduled_time)."
                }

            # Validate scheduled_time is ISO 8601
            try:
                datetime.fromisoformat(parsed_data["scheduled_time"].replace('Z', '+00:00'))
            except Exception:
                return {
                    "success": False,
                    "message": "scheduled_time is not a valid ISO 8601 datetime string."
                }

            return {"success": True, **parsed_data}

        except Exception as e:
            current_app.logger.error(f"Error in parsing appointment request: {e}", exc_info=True)
            return {"success": False, "message": "An internal error occurred during parsing."}


    def find_and_propose_slot(self, query: str, patient_id: int) -> dict:
        prompt = f"""
        User: "{query}"
        Patient ID: {patient_id}

        As an intelligent appointment scheduler, propose the most suitable appointment slot
        based on the user's request. Consider clinician availability (simulated for now)
        and patient preferences. If no specific clinician is mentioned, pick an available one.
        Suggest a specific ISO 8601 timestamp for `scheduled_time`.

        Output a JSON object with:
        - "clinician_id": (integer, ID of the proposed clinician)
        - "scheduled_time": (string, proposed time in ISO 8601 format)
        - "reason": (string, proposed reason for the appointment)
        - "message": (string, a friendly message to the user confirming the suggestion)
        """
        messages = [
            {"role": "system", "content": "You are a smart scheduling assistant. Propose a specific, available time for the user's request. Focus on providing actionable data."},
            {"role": "user", "content": prompt}
        ]

        try:
            # Remove response_format argument here too
            llm_response = generate_response(messages, max_tokens=256)

            # Use the same robust_json_extract to parse JSON out of free text
            proposed_data = self.robust_json_extract(llm_response)
            if proposed_data is None:
                current_app.logger.error(f"Failed to parse JSON from scheduling agent output: {llm_response}")
                return {"success": False, "message": "Failed to parse JSON from LLM output.", "llm_output": llm_response}

            # Validate clinician_id exists and role
            clinician = User.query.get(proposed_data.get("clinician_id"))
            if not clinician or clinician.role != "clinician":
                clinician = User.query.filter_by(role="clinician").first()
                if not clinician:
                    return {"success": False, "message": "No clinicians found to schedule with."}
                proposed_data["clinician_id"] = clinician.id

            # Check if slot is busy
            existing_appointment = Appointment.query.filter_by(
                clinician_id=proposed_data["clinician_id"],
                scheduled_time=datetime.fromisoformat(proposed_data["scheduled_time"].replace("Z", "+00:00"))
            ).first()

            if existing_appointment:
                return {"success": False, "message": "Proposed slot is already taken. Please try again."}

            return {
                "success": True,
                "appointment_data": {
                    "clinician_id": proposed_data["clinician_id"],
                    "scheduled_time": proposed_data["scheduled_time"],
                    "reason": proposed_data.get("reason", "Consultation")
                },
                "message": proposed_data.get("message", "Here's a suggested time for your appointment.")
            }

        except Exception as e:
            current_app.logger.error(f"Error in scheduling agent: {e}", exc_info=True)
            return {"success": False, "message": "An internal error occurred during scheduling."}
