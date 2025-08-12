import api from './api';

// Auth Services
export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  listUsers: () => api.get('/auth/users'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Billing Services
export const billingService = {
  createInvoice: (data: any) => api.post('/billing/invoices', data),
  getInvoice: (invoiceId: number) => api.get(`/billing/invoices/${invoiceId}`),
  listInvoices: (params?: any) => api.get('/billing/invoices', { params }),
  updateInvoice: (invoiceId: number, data: any) => api.put(`/billing/invoices/${invoiceId}`, data),
  deleteInvoice: (invoiceId: number) => api.delete(`/billing/invoices/${invoiceId}`),
  createPayment: (data: any) => api.post('/billing/payments', data),
  getPaymentsForInvoice: (invoiceId: number) => api.get(`/billing/invoices/${invoiceId}/payments`),
  explainInvoice: (invoiceId: number) => api.get(`/billing/invoices/${invoiceId}/explain`),
};

// Chat Services
export const chatService = {
  createRoom: (data: any) => api.post('/chat/rooms', data),
  listRooms: () => api.get('/chat/rooms'),
  joinRoom: (roomId: number) => api.post(`/chat/rooms/${roomId}/participants`),
  getMessages: (roomId: number) => api.get(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: number, data: any) => api.post(`/chat/rooms/${roomId}/messages`, data),
  startTelemedSession: (roomId: number, data?: any) => api.post(`/chat/rooms/${roomId}/telemed/start`, data),
  endTelemedSession: (sessionId: number) => api.post(`/chat/telemed/${sessionId}/end`),
  postMessageAndGetBotReply: (roomId: number, data: any) => api.post(`/chat/rooms/${roomId}/post_message`, data),
};

// Clinical Services
export const clinicalService = {
  createObservation: (data: any) => api.post('/clinical/observations', data),
  listObservations: (params?: any) => api.get('/clinical/observations', { params }),
  getObservationById: (id: number) => api.get(`/clinical/observations/${id}`),
  getObservationByFhirId: (fhirId: string) => api.get(`/clinical/observations/${fhirId}`),
  updateObservation: (id: number, data: any) => api.put(`/clinical/observations/${id}`, data),
  updateObservationByFhirId: (fhirId: string, data: any) => api.put(`/clinical/observations/${fhirId}`, data),
  deleteObservation: (id: number) => api.delete(`/clinical/observations/${id}`),
  deleteObservationByFhirId: (fhirId: string) => api.delete(`/clinical/observations/${fhirId}`),
  listEncounters: (params?: any) => api.get('/clinical/encounters', { params }),
  createEncounter: (data: any) => api.post('/clinical/encounters', data),
  updateEncounter: (id: number, data: any) => api.put(`/clinical/encounters/${id}`, data),
  deleteEncounter: (id: number) => api.delete(`/clinical/encounters/${id}`),
  listAppointments: (params?: any) => api.get('/clinical/appointments', { params }),
  createAppointment: (data: any) => api.post('/clinical/appointments', data),
  updateAppointment: (id: number, data: any) => api.put(`/clinical/appointments/${id}`, data),
  deleteAppointment: (id: number) => api.delete(`/clinical/appointments/${id}`),
};

// Dashboard Services
export const dashboardService = {
  getTotalUsers: () => api.get('/dashboard/metrics/users/total'),
  getDailyActiveUsers: (days?: number) => api.get('/dashboard/metrics/users/daily-active', { params: { days } }),
  getApiCallsMetrics: (hours?: number) => api.get('/dashboard/metrics/api-calls', { params: { hours } }),
  getTotalLlmQueries: (hours?: number) => api.get('/dashboard/metrics/llm-queries/total', { params: { hours } }),
  getLlmQueriesByModel: (hours?: number) => api.get('/dashboard/metrics/llm-queries/by-model', { params: { hours } }),
  getMetricsSummary: (hours?: number) => api.get('/dashboard/metrics/summary', { params: { hours } }),
  askLlmAboutMetrics: (data: { question: string }) => api.post('/dashboard/metrics/ask-llm', data),
};

// LLM Services (updated chatWithAI to chatCompletion for consistency with backend)
export const llmService = {
  chatCompletion: (data: any) => api.post('/llm/chat', data),
  getLlmHealth: () => api.get('/llm/health'),
};

// Medications Services
export const medicationsService = {
  createPrescription: (data: any) => api.post('/medications/prescriptions', data),
  listPrescriptions: (params?: any) => api.get('/medications/prescriptions', { params }),
  getMedicationCounseling: (data: { medication: string }) => api.post('/medications/counseling', data),
  createTreatmentPlan: (data: any) => api.post('/medications/treatment-plans', data),
  listTreatmentPlans: (params?: any) => api.get('/medications/treatment-plans', { params }),
  getTreatmentPlan: (planId: number) => api.get(`/medications/treatment-plans/${planId}`),
  updateTreatmentPlan: (planId: number, data: any) => api.put(`/medications/treatment-plans/${planId}`, data),
  deleteTreatmentPlan: (planId: number) => api.delete(`/medications/treatment-plans/${planId}`),
};

// Patients Services
export const patientService = {
  createPatient: (data: any) => api.post('/patients/', data),
  getPatient: (id: number) => api.get(`/patients/${id}`),
  updatePatient: (id: number, data: any) => api.put(`/patients/${id}`, data),
  deletePatient: (id: number) => api.delete(`/patients/${id}`),
  listPatients: () => api.get('/patients'),
  getPatientSummary: (patientId: number) => api.get(`/patients/${patientId}/summary`),
  searchPatients: (query: string) => api.get('/patients/search', { params: { query } }),
  maskPatientPhi: (patientId: number) => api.get(`/patients/${patientId}/mask_phi`),
};