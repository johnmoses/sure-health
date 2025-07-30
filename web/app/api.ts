import axios from 'axios';
import { ApiResponse } from './types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ access_token: string; user: any }>('/auth/login', { username, password }),
  register: (data: any) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

export const patientsApi = {
  getAll: () => api.get('/patients'),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

export const clinicalApi = {
  getRecords: (patientId: string) => api.get(`/clinical/records/${patientId}`),
  createRecord: (data: any) => api.post('/clinical/records', data),
  getAppointments: () => api.get('/clinical/appointments'),
  createAppointment: (data: any) => api.post('/clinical/appointments', data),
  updateAppointment: (id: string, data: any) => api.put(`/clinical/appointments/${id}`, data),
  getObservations: () => api.get('/clinical/observations'),
  createObservation: (data: any) => api.post('/clinical/observations', data),
  updateObservation: (id: string, data: any) => api.put(`/clinical/observations/${id}`, data),
  getEncounters: () => api.get('/clinical/encounters'),
  createEncounter: (data: any) => api.post('/clinical/encounters', data),
  updateEncounter: (id: string, data: any) => api.put(`/clinical/encounters/${id}`, data),
};

export const medicationsApi = {
  getByPatient: (patientId: string) => api.get(`/medications/patient/${patientId}`),
  create: (data: any) => api.post('/medications', data),
  update: (id: string, data: any) => api.put(`/medications/${id}`, data),
  getPrescriptions: () => api.get('/medications/prescriptions'),
  createPrescription: (data: any) => api.post('/medications/prescriptions', data),
  updatePrescription: (id: string, data: any) => api.put(`/medications/prescriptions/${id}`, data),
  getTreatmentPlans: () => api.get('/medications/treatment-plans'),
  createTreatmentPlan: (data: any) => api.post('/medications/treatment-plans', data),
  updateTreatmentPlan: (id: string, data: any) => api.put(`/medications/treatment-plans/${id}`, data),
  getCounseling: (medication: string) => api.post('/medications/counseling', { medication }),
};

export const billingApi = {
  getAll: () => api.get('/billing'),
  getByPatient: (patientId: string) => api.get(`/billing/patient/${patientId}`),
  create: (data: any) => api.post('/billing', data),
  updateStatus: (id: string, status: string) => api.patch(`/billing/${id}/status`, { status }),
  getInvoices: () => api.get('/billing/invoices'),
  createInvoice: (data: any) => api.post('/billing/invoices', data),
  updateInvoice: (id: string, data: any) => api.put(`/billing/invoices/${id}`, data),
  getPayments: (invoiceId: string) => api.get(`/billing/invoices/${invoiceId}/payments`),
  createPayment: (data: any) => api.post('/billing/payments', data),
};

export const chatApi = {
  getMessages: (userId: string) => api.get(`/chat/messages/${userId}`),
  sendMessage: (data: any) => api.post('/chat/messages', data),
  getRooms: () => api.get('/chat/rooms'),
  createRoom: (data: any) => api.post('/chat/rooms', data),
  joinRoom: (roomId: string) => api.post(`/chat/rooms/${roomId}/participants`),
  getRoomMessages: (roomId: string) => api.get(`/chat/rooms/${roomId}/messages`),
  sendRoomMessage: (roomId: string, data: any) => api.post(`/chat/rooms/${roomId}/post_message`, data),
  startTelemed: (roomId: string, data: any) => api.post(`/chat/rooms/${roomId}/telemed/start`, data),
  endTelemed: (sessionId: string) => api.post(`/chat/telemed/${sessionId}/end`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
};

export default api;