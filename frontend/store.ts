import { create } from 'zustand';
import { User } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true, token });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, token: null });
  },
}));
