import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

const isBrowser = typeof window !== 'undefined';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  login: (user, token) => {
    if (isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user }),
  hydrate: () => {
    if (!isBrowser || get().hydrated) return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, hydrated: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ hydrated: true });
      }
    } else {
      set({ hydrated: true });
    }
  },
}));