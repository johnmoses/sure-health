export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface ApiError {
  error: string;
}

export interface RegisterInput {
  username: string;
  email?: string;
  password: string;
  role?: string;  // default 'clinician'
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  clinician_id: number;
  scheduled_time: string; // ISO date string
  reason?: string;
  // Add other fields as per your AppointmentSchema
}

export interface AppointmentCreateInput {
  patient_id?: number;   // will be set server side, optional here
  clinician_id: number;
  scheduled_time: string;
  reason?: string;
}

export interface AppointmentProposal {
  success: boolean;
  message?: string;
  appointment_data?: AppointmentCreateInput;
}

export interface NLPParseResult {
  success: boolean;
  message?: string;
  clinician_id?: number;
  scheduled_time?: string;
  reason?: string;
}

export interface Invoice {
  id: number;
  patient_id: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue'; // Example statuses
  description?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  // Add other fields as per your InvoiceSchema
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string; // ISO date string
  method?: string; // e.g., 'credit_card', 'bank_transfer'
  // Add other fields as per your PaymentSchema
}

export interface InvoiceCreateInput {
  patient_id: number;
  amount: number;
  description?: string;
}

export interface PaymentCreateInput {
  invoice_id?: number; // Will be set by path param
  amount: number;
  payment_date: string;
  method?: string;
}

export interface BillingQueryResponse {
  success: boolean;
  answer?: string;
  message?: string; // Error message
}

export interface ChatRoom {
  id: number;
  name: string;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  content: string;
  role: 'patient' | 'clinician' | 'bot';
  timestamp: string;
  is_ai: boolean;
}

export interface PostMessagePayload {
  content: string;
  role: 'patient' | 'clinician';
}

export interface BotResponse {
  bot_reply: string;
  conversation: ChatMessage[];
}

export interface MultiAgentResponse {
  response: string;
  error?: string;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  clinician_id: number;
  record_date: string;
  diagnosis?: string;
  notes?: string;
  // Add other fields based on MedicalRecordSchema
}

export interface LabResult {
  id: number;
  medical_record_id: number;
  test_name: string;
  result: string;
  unit?: string;
  reference_range?: string;
  date_conducted: string;
  // Add other fields based on LabResultSchema
}

export interface EHRQueryResult {
  success: boolean;
  answer?: string;
  message?: string;
}

export interface Prescription {
  id: number;
  clinician_id: number;
  patient_id: number;
  medication_name: string;
  dosage: string;
  instructions?: string;
  created_at: string; // ISO date string
  // add fields as per prescription schema
}

export interface PrescriptionCreateInput {
  clinician_id: number;
  patient_id: number;
  medication_name: string;
  dosage: string;
  instructions?: string;
}

export interface MedicationAdviceResponse {
  success: boolean;
  advice?: string;
  message?: string;
}

export interface TelemedicineSession {
  id: number;
  appointment_id: number;
  video_url?: string;
  started_at: string;
  ended_at?: string | null;
  // Add other fields based on your TelemedicineSessionSchema
}

export interface VideoAgentQueryResponse {
  answer: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  event_type: string;
  ip_address?: string;
  timestamp: string;  // ISO date string
  event_metadata?: Record<string, any>;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface LogEventInput {
  event_type: string;
  event_metadata?: Record<string, any>;
}

export interface VitalSign {
  id: number;
  patient_id: number;
  type: string;
  value: string;
  timestamp: string; // ISO date string
}

export interface DashboardSummary {
  total_users: number;
  active_appointments: number;
  total_billings: number;
  active_chat_sessions: number;
  prescriptions_count: number;
  video_sessions_count: number;
  vital_signs_count: number;
}

export interface NewUsersDaily {
  date: string; // ISO date string
  count: number;
}

export interface AppointmentsPerClinician {
  clinician_id: number;
  count: number;
}

export interface PrescriptionsByType {
  type: string;
  count: number;
}

export interface ChatSessionsDaily {
  date: string; // ISO date string
  count: number;
}

export interface WeeklyLoginTrend {
  week: string;
  count: number;
}

export interface AdvancedAnalytics {
  new_users_daily: NewUsersDaily[];
  appointments_per_clinician: AppointmentsPerClinician[];
  prescriptions_by_type: PrescriptionsByType[];
  chat_sessions_daily: ChatSessionsDaily[];
  video_avg_session_duration_sec: number;
  weekly_login_trend: WeeklyLoginTrend[];
}
