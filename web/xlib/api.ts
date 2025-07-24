import { Appointment, AppointmentCreateInput, AuthResponse, ChatMessage, ChatRoom, EHRQueryResult, Invoice, InvoiceCreateInput, LabResult, LogEventInput, LoginInput, MedicalRecord, MultiAgentResponse, PaginatedAuditLogs, Payment, PaymentCreateInput, PostMessagePayload, Prescription, PrescriptionCreateInput, RegisterInput, TelemedicineSession, User, VideoAgentQueryResponse, VitalSign } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Error');
  }
  return data;
}

export async function registerUser(input: RegisterInput) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse(response);
}

export async function loginUser(credentials: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) {
    // Throw with backend error message if exists
    throw new Error(data.error || 'Login failed');
  }

  return data; // expected to contain access_token
}

export async function getProfile(token: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

async function apiFetch(url: string, options: RequestInit = {}, token?: string) {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
}

export async function listAppointments(token: string) {
  return apiFetch('/appointments/', { method: 'GET' }, token) as Promise<Appointment[]>;
}

export async function getAppointment(id: number, token: string) {
  return apiFetch(`/appointments/${id}`, { method: 'GET' }, token) as Promise<Appointment>;
}

export async function createAppointment(input: AppointmentCreateInput, token: string) {
  return apiFetch('/appointments/', { method: 'POST', body: JSON.stringify(input) }, token) as Promise<Appointment>;
}

export async function updateAppointment(id: number, update: Partial<AppointmentCreateInput>, token: string) {
  return apiFetch(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(update) }, token) as Promise<Appointment>;
}

export async function deleteAppointment(id: number, token: string) {
  return apiFetch(`/appointments/${id}`, { method: 'DELETE' }, token);
}

export async function nlpCreateAppointment(query: string, token: string) {
  return apiFetch('/appointments/nlp_create', { method: 'POST', body: JSON.stringify({ query }) }, token);
}

export async function scheduleSuggest(query: string, token: string) {
  return apiFetch('/appointments/schedule_suggest', { method: 'POST', body: JSON.stringify({ query }) }, token) as Promise<AppointmentProposal>;
}

// Re-using the existing apiFetch from previous generation

// Invoice API Calls
export async function createInvoice(input: InvoiceCreateInput, token: string) {
  return apiFetch('/billing/invoices', { method: 'POST', body: JSON.stringify(input) }, token) as Promise<Invoice>;
}

export async function listInvoices(token: string) {
  return apiFetch('/billing/invoices', { method: 'GET' }, token) as Promise<Invoice[]>;
}

export async function getInvoice(id: number, token: string) {
  return apiFetch(`/billing/invoices/${id}`, { method: 'GET' }, token) as Promise<Invoice>;
}

export async function updateInvoice(id: number, update: Partial<InvoiceCreateInput>, token: string) {
  return apiFetch(`/billing/invoices/${id}`, { method: 'PUT', body: JSON.stringify(update) }, token) as Promise<Invoice>;
}

export async function deleteInvoice(id: number, token: string) {
  return apiFetch(`/billing/invoices/${id}`, { method: 'DELETE' }, token);
}

// Payment API Calls
export async function createPayment(invoiceId: number, input: PaymentCreateInput, token: string) {
  return apiFetch(`/billing/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(input) }, token) as Promise<Payment>;
}

export async function listPayments(invoiceId: number, token: string) {
  return apiFetch(`/billing/invoices/${invoiceId}/payments`, { method: 'GET' }, token) as Promise<Payment[]>;
}

// Billing Query
export async function sendBillingQuery(query: string, token: string, invoiceId?: number) {
  const body: { query: string; invoice_id?: number } = { query };
  if (invoiceId) body.invoice_id = invoiceId;
  return apiFetch('/billing/query', { method: 'POST', body: JSON.stringify(body) }, token) as Promise<BillingQueryResponse>;
}

export async function createRoom(name: string, token: string) {
  return apiFetch('/chat/rooms', { method: 'POST', body: JSON.stringify({ name }) }, token);
}

export async function listRooms(token: string) {
  return apiFetch('/chat/rooms', { method: 'GET' }, token) as Promise<ChatRoom[]>;
}

export async function getRoomMessages(roomId: number, token: string) {
  return apiFetch(`/chat/rooms/${roomId}/messages`, { method: 'GET' }, token) as Promise<ChatMessage[]>;
}

export async function postMessage(roomId: number, payload: PostMessagePayload, token: string) {
  return apiFetch(`/chat/rooms/${roomId}/post_message`, { method: 'POST', body: JSON.stringify(payload) }, token) as Promise<Response>;
}

export async function multiAgentChat(query: string, user_id: number | string) {
  return apiFetch('/chat/multi_agent_chat', {
    method: 'POST',
    body: JSON.stringify({ query, user_id }),
  }) as Promise<MultiAgentResponse>;
}

// Using your existing apiFetch helper to handle requests/error

export async function listMedicalRecords(token: string) {
  return apiFetch('/ehr/medical_records', { method: 'GET' }, token) as Promise<MedicalRecord[]>;
}

export async function getMedicalRecord(id: number, token: string) {
  return apiFetch(`/ehr/medical_records/${id}`, { method: 'GET' }, token) as Promise<MedicalRecord>;
}

export async function createMedicalRecord(data: Partial<MedicalRecord>, token: string) {
  return apiFetch('/ehr/medical_records', { method: 'POST', body: JSON.stringify(data) }, token) as Promise<MedicalRecord>;
}

export async function updateMedicalRecord(id: number, data: Partial<MedicalRecord>, token: string) {
  return apiFetch(`/ehr/medical_records/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token) as Promise<MedicalRecord>;
}

export async function deleteMedicalRecord(id: number, token: string) {
  return apiFetch(`/ehr/medical_records/${id}`, { method: 'DELETE' }, token);
}

// Lab Results

export async function listLabResults(recordId: number, token: string) {
  return apiFetch(`/ehr/medical_records/${recordId}/lab_results`, { method: 'GET' }, token) as Promise<LabResult[]>;
}

export async function getLabResult(id: number, token: string) {
  return apiFetch(`/ehr/lab_results/${id}`, { method: 'GET' }, token) as Promise<LabResult>;
}

export async function createLabResult(recordId: number, data: Partial<LabResult>, token: string) {
  return apiFetch(`/ehr/medical_records/${recordId}/lab_results`, { method: 'POST', body: JSON.stringify(data) }, token) as Promise<LabResult>;
}

export async function updateLabResult(id: number, data: Partial<LabResult>, token: string) {
  return apiFetch(`/ehr/lab_results/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token) as Promise<LabResult>;
}

export async function deleteLabResult(id: number, token: string) {
  return apiFetch(`/ehr/lab_results/${id}`, { method: 'DELETE' }, token);
}

// EHR Smart Query
export async function ehrSmartQuery(query: string, token: string) {
  return apiFetch('/ehr/qa', { method: 'POST', body: JSON.stringify({ query }) }, token) as Promise<EHRQueryResult>;
}

export async function listPrescriptions(token: string) {
  return apiFetch('/prescriptions/', { method: 'GET' }, token) as Promise<Prescription[]>;
}

export async function getPrescription(id: number, token: string) {
  return apiFetch(`/prescriptions/${id}`, { method: 'GET' }, token) as Promise<Prescription>;
}

export async function createPrescription(data: PrescriptionCreateInput, token: string) {
  return apiFetch('/prescriptions/', { method: 'POST', body: JSON.stringify(data) }, token) as Promise<Prescription>;
}

export async function updatePrescription(id: number, data: Partial<PrescriptionCreateInput>, token: string) {
  return apiFetch(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token) as Promise<Prescription>;
}

export async function deletePrescription(id: number, token: string) {
  return apiFetch(`/prescriptions/${id}`, { method: 'DELETE' }, token);
}

export async function getMedicationAdvice(query: string, context: string, token: string) {
  return apiFetch('/prescriptions/medication_advice', { method: 'POST', body: JSON.stringify({ query, context }) }, token) as Promise<MedicationAdviceResponse>;
}

export async function listSessions(token: string): Promise<TelemedicineSession[]> {
  return apiFetch('/video/', { method: 'GET' }, token);
}

export async function listAllSessions(token: string): Promise<TelemedicineSession[]> {
  return apiFetch('/video/all_sessions', { method: 'GET' }, token);
}

export async function getSession(id: number, token: string): Promise<TelemedicineSession> {
  return apiFetch(`/video/${id}`, { method: 'GET' }, token);
}

export async function createSession(data: Partial<TelemedicineSession>, token: string): Promise<TelemedicineSession> {
  return apiFetch('/video/', { method: 'POST', body: JSON.stringify(data) }, token);
}

export async function updateSession(id: number, data: Partial<TelemedicineSession>, token: string): Promise<TelemedicineSession> {
  return apiFetch(`/video/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
}

export async function deleteSession(id: number, token: string): Promise<void> {
  await apiFetch(`/video/${id}`, { method: 'DELETE' }, token);
}

export async function videoAgentQuery(
  query: string,
  token: string,
  session_id?: number,
  agent_key?: string
): Promise<VideoAgentQueryResponse> {
  const body = { query, session_id, agent_key };
  return apiFetch('/video/query', { method: 'POST', body: JSON.stringify(body) }, token);
}

export async function logEvent(input: LogEventInput, token: string) {
  return apiFetch('/security/log', {
    method: 'POST',
    body: JSON.stringify(input),
  }, token);
}

export async function getUserLogs(
  userId: number,
  token: string,
  page = 1,
  per_page = 20,
  event_type?: string
): Promise<PaginatedAuditLogs> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
  });
  if (event_type) params.append('event_type', event_type);
  
  return apiFetch(`/security/logs/${userId}?${params.toString()}`, { method: 'GET' }, token);
}

// Existing apiFetch assumed

export async function addVitalSign(data: Partial<VitalSign>, token: string): Promise<VitalSign> {
  return apiFetch('/monitoring/vitals', { method: 'POST', body: JSON.stringify(data) }, token);
}

export async function listVitalSigns(patientId: number, token: string, type?: string): Promise<VitalSign[]> {
  return apiFetch(`/monitoring/vitals/${patientId}${type ? `?type=${type}` : ''}`, { method: 'GET' }, token);
}

export async function getLatestVitalSigns(patientId: number, token: string): Promise<VitalSign[]> {
  return apiFetch(`/monitoring/vitals/latest/${patientId}`, { method: 'GET' }, token);
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummary> {
  return apiFetch('/dashboard/summary', { method: 'GET' }, token);
}

export async function fetchAdvancedAnalytics(token: string, days = 30): Promise<AdvancedAnalytics> {
  const url = new URL(`${API_BASE}/analytics/dashboard/advanced`);
  url.searchParams.append("days", days.toString());

  return apiFetch(url.toString(), { method: "GET" }, token);
}
