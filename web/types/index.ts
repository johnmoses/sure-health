// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  error: string;
  message?: string;
  status: number;
}

// Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Billing Types
export interface Payment {
  id?: number;
  invoice_id: number;
  amount: number;
  payment_date?: string;
  method: string;
}

export interface Invoice {
  id?: number;
  patient_id: number;
  amount: number;
  status: string;
  created_at?: string;
  due_date?: string;
  updated_at?: string;
  payments?: Payment[];
}

// Chat Types
export interface ChatRoom {
  id?: number;
  name: string;
  created_at?: string;
  last_message?: ChatMessage; // Added based on list_rooms endpoint
}

export interface ChatMessage {
  id?: number;
  room_id: number;
  sender_id: number;
  content: string;
  timestamp?: string;
  role?: 'patient' | 'clinician' | 'bot' | 'other';
  is_ai?: boolean;
  message_type?: 'text' | 'image' | 'system';
  status?: string;
}

export interface ChatParticipant {
  id?: number;
  room_id: number;
  user_id: number;
  joined_at?: string;
}

export interface TelemedSession {
  id?: number;
  room_id: number;
  session_url: string;
  start_time?: string;
  end_time?: string;
  status: string;
}

// Clinical Types
export interface Encounter {
  id?: number;
  fhir_id?: string;
  patient_id: number;
  encounter_class: string;
  type: string;
  status: string;
  period_start: string;
  period_end: string;
  location: string;
  provider: string;
  reason: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface Observation {
  id?: number;
  patient_id: number;
  encounter_id: number;
  code: string;
  display: string;
  value: string;
  unit: string;
  effective_datetime: string;
  status: string;
  created_at?: string;
}

export interface Appointment {
  id?: number;
  fhir_id?: string;
  patient_id: number;
  appointment_datetime: string;
  status: string;
  practitioner: string;
  location: string;
  reason: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// Dashboard Types
export interface Metric {
  metric_name: string;
  value: number;
  timestamp?: string;
  dimension_key?: string | null;
  dimension_value?: string | null;
}

export interface UserActivity {
  user_id?: number | null;
  activity_type: string;
  timestamp?: string;
  details?: string | null;
}

export interface AggregatedData {
  label: string;
  value: number;
}

export interface DashboardData {
  totalPatients: number;
  todayAppointments: number;
  activePrescriptions: number;
  pendingBills: number;
}

// LLM Types
export interface LLMMessage {
  role: string;
  content: string;
}

export interface LLMQuery {
  messages: LLMMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop_tokens?: string[] | null;
  stream?: boolean;
}

// Medications Types
export interface Prescription {
  id?: number;
  fhir_id?: string;
  patient_id: number;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  status: string;
  start_date: string;
  end_date?: string | null;
  prescribed_by: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentPlan {
  id?: number;
  patient_id: number;
  plan_description: string;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  responsible_provider: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// Patients Types
export interface Patient {
  id?: number;
  user_id?: number;
  fhir_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string | null;
  email?: string | null;
  address?: string;
  medical_record_number?: string;
  insurance_id?: string;
  insurance_provider?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface PatientCreate extends Omit<Patient, 'id' | 'fhir_id' | 'created_at' | 'updated_at' | 'is_active'> {
  user_id: number;
}

export interface PatientUpdate extends Partial<Omit<Patient, 'id' | 'fhir_id' | 'user_id' | 'created_at' | 'updated_at'>> {}
