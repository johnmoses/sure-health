import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Appointment, Encounter, Observation, Prescription, User } from '../types';
// Set the API base URL
const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized error logging
const logError = (error: any) => {
  console.error('API Error:', error.response?.status, error.message);
};
// Request interceptor to add auth token
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    data: config.data,
    headers: config.headers,
  });
  return config;
});
// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Handle token refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loop
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            },
          );
          // Store new access token
          await AsyncStorage.setItem('access_token', response.data.access_token);

          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          // Redirect to login or handle logout
          // You might want to use a navigation library to redirect
        }
      }
    }
    // Handle other errors
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // Optionally handle specific status codes here (e.g., 403, 404)
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  },
);
// Auth API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  // register: async (username: string, email: string, password: string, role = 'user') => {
  //   try {
  //     const response = await api.post('/auth/register', { username, email, password, role });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Registration failed:', error);
  //     throw error;
  //   }
  // },
  register: async (username: string, email: string, password: string, role = 'user') => {
    const isValidEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    email = email.trim(); // Trim any whitespace
    if (!isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    try {
      console.log('Registering user with:', { username, email, password, role });
      const response = await api.post('/auth/register', { username, email, password, role });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Check if the error is an AxiosError with a response
        console.error('Registration failed:', error.response.data); // Log the error response data
        throw new Error(error.response.data.message || 'Registration failed'); // Throw an error with the message from the response or a generic message
      } else {
        console.error('Registration failed:', (error as Error).message);
        throw new Error((error as Error).message);
      }
    }
  },
  profile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Fetching profile failed:', error);
      throw error;
    }
  },
  updateProfile: async (profile: Omit<User, 'id' | 'created_at'>) => {
    try {
      const response = await api.put('/auth/profile', profile);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  changePassword: async (passwords: any) => {
    try {
      const response = await api.post('/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
};
// Chat API functions
export const chatAPI = {
  getRooms: async () => {
    try {
      const response = await api.get('/chat/rooms');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createRoom: async (name: string, description?: string) => {
    try {
      const response = await api.post('/chat/rooms', { name, description });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  joinRoom: async (roomId: number) => {
    try {
      const response = await api.post(`/chat/rooms/${roomId}/participants`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getMessages: async (roomId: number) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  sendMessage: async (roomId: number, content: string, role: string) => {
    try {
      const response = await api.post(`/chat/rooms/${roomId}/post_message`, { content, role });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};

// Clinical API functions
export const clinicalAPI = {
  getObservations: async () => {
    try {
      const response = await api.get('/clinical/observations');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  updateObservation: async (id: number, observation: Omit<Observation, 'id'>) => {
    try {
      const response = await api.put(`/clinical/observations/${id}`, observation);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  deleteObservation: async (id: number) => {
    try {
      const response = await api.delete(`/clinical/observations/${id}`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createObservation: async (observation: Omit<Observation, 'id'>) => {
    try {
      const response = await api.post('/clinical/observations', observation);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  updateEncounter: async (id: number, encounter: Omit<Encounter, 'id'>) => {
    try {
      const response = await api.put(`/clinical/encounters/${id}`, encounter);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  deleteEncounter: async (id: number) => {
    try {
      const response = await api.delete(`/clinical/encounters/${id}`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createEncounter: async (encounter: Omit<Encounter, 'id'>) => {
    try {
      const response = await api.post('/clinical/encounters', encounter);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getEncounters: async () => {
    try {
      const response = await api.get('/clinical/encounters');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  updateAppointment: async (id: number, appointment: Omit<Appointment, 'id'>) => {
    try {
      const response = await api.put(`/clinical/appointments/${id}`, appointment);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  deleteAppointment: async (id: number) => {
    try {
      const response = await api.delete(`/clinical/appointments/${id}`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createAppointment: async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const response = await api.post('/clinical/appointments', appointment);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getPrescriptions: async () => {
    try {
      const response = await api.get('/medications/prescriptions');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createPrescription: async (prescription: Omit<Prescription, 'id'>) => {
    try {
      const response = await api.post('/medications/prescriptions', prescription);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  updatePrescription: async (id: number, prescription: Omit<Prescription, 'id'>) => {
    try {
      const response = await api.put(`/medications/prescriptions/${id}`, prescription);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  deletePrescription: async (id: number) => {
    try {
      const response = await api.delete(`/medications/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getMedicationCounseling: async (medication: string) => {
    try {
      const response = await api.post('/medications/counseling', { medication });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getAppointments: async () => {
    try {
      const response = await api.get('/clinical/appointments');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};

// Billing API functions
export const billingAPI = {
  getInvoices: async (patientId?: number) => {
    try {
      const params = patientId ? { patient_id: patientId } : {};
      const response = await api.get('/billing/invoices', { params });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};

export default api;
