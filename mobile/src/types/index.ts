// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ChatRoom {
  id: number;
  name: string;
  description: string;
  is_private: boolean;
  created_by: number;
  created_at: string;
  last_message: ChatMessage | null;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  content: string;
  role: string;
  is_ai: boolean;
  message_type: string;
  status: string;
  timestamp: string;
}

export interface Observation {
  id: number;
  fhir_id: string;
  patient_id: number;
  status: string;
  code_text: string;
  effective_datetime: string;
  value_quantity: number;
  value_quantity_unit: string;
}

export interface Encounter {
  id: number;
  fhir_id: string;
  patient_id: number;
  status: string;
  class_code: string;
  type_text: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  appointment_datetime: string;
  status: string;
  practitioner: string;
  reason: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  medication_name: string;
  dosage: string;
  status: string;
  start_date: string;
}

export interface Invoice {
  id: number;
  patient_id: number;
  amount: number;
  status: string;
  created_at: string;
  due_date: string;
}