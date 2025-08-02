import api from './api';

// Auth Services
export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout')
};

// Chat Services
export const chatService = {
  getMessages: (roomId: number) => api.get(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: number, data: any) => api.post(`/chat/rooms/${roomId}/messages`, data),
  chatWithAI: (data: any) => api.post('/llm/chat', data)
};

